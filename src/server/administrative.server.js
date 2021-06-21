var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
var ax = require('axios');
const { Pool } = require("pg");
const { body, validationResult, checkSchema, matchedData } = require('express-validator');
const models = require('./models/administrative.js');

// const baseUrl = 'http://localhost:5000';
const baseUrl = process.env.AZURE_URL ?? 'http://mo4-hydro-api.azurewebsites.net';
const bearer = process.env.AZURE_TOKEN;
const timeout = +process.env.TIMEOUT || 60000;
const http = ax.default;
const headers = {
  "content-type": "application/json",
  'Authorization': `Bearer ${bearer}`
}

// #################### Default values ####################
const DEFAULT_WEATHER_PROVIDER_NAME = 'infoplaza';
const DEFAULT_CLIENT_NAME           = 'Demo';



// #################### Actual API ####################

/**
 * Server file with all the secure endpoints to the admin database.
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {Pool} admin_server_pool
 * @param {(subject: string, body: string, recipient: string) => void} mailTo
 * @api public
 */
module.exports = function (
  app,
  logger,
  admin_server_pool,
  mailTo = (subject, body, recipient = 'webmaster@mo4.online') => { }
) {
  // ######################### Endpoints #########################
  app.get('/api/admin/connectionTest', (req, res) => {
    admin_server_pool.query('SELECT sum(numbackends) FROM pg_stat_database').then(() => {
      return res.send({ status: 1 })
    }).catch((err) => {
      logger.warn(err, 'Connection test failed')
      return res.send({ status: 0 })
    })
  })

  app.post("/api/getRegistrationInformation",
    body('username').isString(),
    body('registration_token').isString(),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors);

      const username = req.body.username;
      const registration_token = req.body.registration_token;
      // NOT SURE WHAT TO MAKE OF THIS FUNCTION
      const query = `SELECT username, requires2fa, secret2fa
        FROM "userTable"
        WHERE "token"=$1`
      const values = [registration_token]
      admin_server_pool.query(query, values).then(sqlresponse => {
        if (sqlresponse.rowCount == 0) return res.status(400).send('User not found / token invalid')
        const row = sqlresponse.rows[0];
        if (row.username != username) return res.onBadRequest('Registration token does not match requested user!')
        res.send({
          username: row.username,
          requires2fa: row.requires2fa,
          secret2fa: row.secret2fa
        })
      }).catch(err => res.onError(err))
  });

  app.post('/api/createDemoUser',
    checkSchema(models.createDemoUserModel),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res['onBadRequest'](errors);

    const username = req.body.username;
    const password = req.body.password;
    const requires2fa = req.body.requires2fa;
    const vessel_ids = req.body.vessel_ids; // Always empty?
    const user_type = req.body.user_type ?? 'demo'; // Shouldn't this always be demo?

    const phoneNumber = req.body.phoneNumber;
    const full_name = req.body.full_name;
    const job_title = req.body.job_title;
    const company = req.body.company;

    // Need to check on this in the future
    const bad_vessel_list = Array.isArray(vessel_ids) && vessel_ids.length>0;
    if (bad_vessel_list) return res.onUnauthorized('Vessel ids is not supported when creating a demo account!');
    if (user_type != 'demo') return res.onUnauthorized(`User type must be demo - actual ${user_type}`);

    logger.debug('Validating incoming request')
    if (vessel_ids != null && !Array.isArray(vessel_ids)) {
      logger.info('Vessel is not in valid format')
      return res.status(400).send('Invalid vessel id format');
    }
    logger.trace('Verfying username format')
    if (typeof (username) != 'string' || username.length <= 0) return res.status(400).send('Invalid username. Should be string')
    logger.trace('Verfying 2fa format')
    if (requires2fa != 0 && requires2fa != 1) return res.status(400).send('Invalid requires2fa: should be 0 or 1')
    logger.trace(`Verfying password format ${password} (${typeof password})`)
    const is_bad_pw = typeof (password) != ("string" || null) || password.length <= 6
    if (is_bad_pw) return res.status(400).send('Invalid password: should be string of at least 7 characters')

    // Getting demo client information
    const demo_client_id = await getDefaultClientId();

    //turn account creation back on after other functions
    try {
      const query = `SELECT t.username
        FROM "userTable" t
        WHERE t."username"=$1`
      const values = [username];
      const response = await admin_server_pool.query(query, values)
      const user_exists = response.rowCount > 0;
      if (user_exists) return res.onBadRequest('User already exists');
      const demo_project_id = await createProject() // works
      await createDemoUser({
        username,
        requires2fa,
        client_id: demo_client_id,
        vessel_ids,
        user_type,
        password,
        demo_project_id,
      })
    } catch (err) {
      if (err.constraint == 'Unique usernames') return res.onUnauthorized('User already exists')
      return res.onError(err, 'Error creating user')
    }
    // send email
    const html = `A demo account has been created for ${username}.<br>
    Please add the following details to the customer-contact excel sheet.<br>
    Username: ${username}<br>
    Full name: ${full_name}<br>
    Company: ${company}<br>
    Function: ${job_title}<br>
    Phone number: ${phoneNumber}
    `;

    mailTo('Registered demo user', html, 'webmaster@mo4.online');
    logger.info({ msg: 'Succesfully created user ', username })
    return res.send({ data: `User ${username} succesfully added!` });
  });

  app.post('/api/setPassword', checkSchema(models.setPasswordModel), function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors);

    const data = matchedData(req);
    const passwordToken = data.passwordToken;
    const password = data.password;
    const confirm = data.confirmPassword;
    const secret2fa = data.secret2fa;
    const confirm2fa = data.confirm2fa
    const localLogger = logger.child({
      token: passwordToken,
      hasPassword: password != null,
      has2Fa: confirm2fa != null
    })
    localLogger.info('Receiving set password request')

    if (password != confirm) return res.onBadRequest('Password does not match confirmation code')
    const query = `SELECT user_id, secret2fa, requires2fa
      FROM "userTable"
      WHERE "token"=$1`
    const values = [passwordToken];
    localLogger.debug('Getting user info from admin db')
    admin_server_pool.query(query, values).then((sqlresponse) => {
      localLogger.debug('Got sql response')
      if (sqlresponse.rowCount == 0) return res.onBadRequest('User not found / token invalid')
      const data = sqlresponse.rows[0];
      const requires2fa = data.requires2fa ?? true;
      if (!requires2fa) localLogger.info('User does not require 2FA')
      const valid2fa = (typeof(confirm2fa) == 'string') && (confirm2fa.length > 0);
      if (requires2fa && !valid2fa) return res.onBadRequest('2FA code is required but not provided!')
      const usableSecret2fa = data.secret2fa ?? secret2fa;
      const secret2faValid = (confirm2fa?.length > 0) && (twoFactor.verifyToken(usableSecret2fa, confirm2fa) != null)
      if (!secret2faValid && requires2fa) return res.onBadRequest('2FA code is not correct!')

      const user_id = data.user_id;
      const query2 = `UPDATE "userTable"
      SET password=$1,
          secret2fa=$2,
          token=null
      WHERE "userTable"."user_id"=$3
      `
      const hashed_password = bcrypt.hashSync(req.body.password, 10)
      const value2 = [hashed_password, usableSecret2fa, user_id]
      localLogger.debug('Performing password update')
      admin_server_pool.query(query2, value2).then(() => {
        logger.info('Updated password for user with id ' + user_id)
        res.send({ data: 'Password set successfully!' })
      }).catch(err => res.onError(err));
    }).catch(err => res.onError(err, 'Registration token not found!'))
  })

  app.post("/api/login", checkSchema(models.loginModel), async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors)

    const data = matchedData(req);
    let username = data.username;
    // let password = data.password;
    const localLogger = logger.child({
      username
    })

    let token;
    let PgQuery = `SELECT "userTable"."user_id", "userTable"."username", "userTable"."password",
    "userTable"."active", "userTable".requires2fa, "userTable"."secret2fa",
    "clientTable"."client_name", "user_type", "admin", "user_read", "demo",
    "user_manage", "twa", "dpr", "longterm", "forecast", "user_see_all_vessels_client",
    "userTable"."client_id", "userTable"."demo_project_id"
    FROM "userTable"
    INNER JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
    LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
    WHERE "userTable"."username"=$1`
    const values = [username];

    localLogger.info('Received login for user: ' + username);
    admin_server_pool.query(PgQuery, values).then(async (admin_data, err) => {
      if (err) return res.onError(err);
      if (admin_data.rows.length == 0) return res.onUnauthorized('User does not exist');

      let user = admin_data.rows[0];
      localLogger.debug('Validating login')
      if (!validateLogin(req, user, res)) return null; // Password validation happens here
      localLogger.debug('Retrieving vessels for user');
      const vessels = await getVesselsForUser(res, user.user_id).catch(err => { return res.onError(err) });

      localLogger.debug('Retrieving client for user');
      const query = 'SELECT "forecast_client_id" FROM "clientTable" WHERE "client_id" = $1';
      const client_data = await admin_server_pool.query(query, [user.client_id]);
      if (client_data.rowCount == 0) return res.onError('Issue getting client forecast id for user')
      const forecast_client_id = client_data.rows[0].forecast_client_id;
      localLogger.debug('Found forecast client id' + forecast_client_id)

      localLogger.trace(vessels);
      const expireDate = new Date();
      const payload = {
        userID: user.user_id,
        userPermission: user.user_type,
        userCompany: user.client_name,
        userBoats: vessels,
        username: user.username,
        client_id: user.client_id,
        forecast_client_id: forecast_client_id,
        demo_project_id: user.demo_project_id,
        permission: {
          admin: user.admin,
          user_read: user.user_read,
          demo: user.demo,
          user_manage: user.user_manage,
          twa: user.twa,
          dpr: user.dpr,
          longterm: user.longterm,
          user_type: user.user_type,
          forecast: user.forecast,
          user_see_all_vessels_client: user.user_see_all_vessels_client,
        },
        expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
      };
      localLogger.trace('Signing payload')
      token = jwt.sign(payload, 'secretKey');
      localLogger.debug('Login succesful for user: ' + user.username.toLowerCase())
      return res.status(200).send({ token });

    }).catch((err) => { return res.onError( err) })
  });


  // #################### Support code ####################

  function getVesselsForUser(res, user_id) {
    let PgQuery = `
    SELECT "vesselTable"."mmsi", "vesselTable"."nicename"
      FROM "vesselTable"
      INNER JOIN "userTable"
      ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")
      WHERE "userTable"."user_id"=$1`;
    const values = [user_id]
    return admin_server_pool.query(PgQuery, values).then((data, err) => {
      if (err) return res.onError( err);
      if (data.rows.length > 0) {
        return data.rows;
      } else {
        return null;
      }
    }).catch(err => res.onError( err, 'Failed to load vessels'));
  };


  async function createDemoUser({
    username = '',
    requires2fa = false,
    client_id = null,
    vessel_ids = [],
    user_type = 'demo',
    password = null,
    demo_project_id = null
  }) {
    const expireDate = new Date();
    const formattedExpireDate = toIso8601(new Date(expireDate.setMonth(expireDate.getMonth() + 1)))
    if (!(client_id > 0)) { throw Error('Invalid client id!') }
    if (!(username?.length > 0)) { throw Error('Invalid username!') }

    logger.info(`Creating new user ${username}`)
    const password_setup_token = null;
    if (password !== null && password !== '') password = bcrypt.hashSync(password, 10)
    const valid_vessel_ids = Array.isArray(vessel_ids); // && (vessel_ids.length > 0);
    const query = `INSERT INTO public."userTable"(
      username,
      requires2fa,
      secret2fa,
      active,
      vessel_ids,
      password,
      token,
      client_id,
      demo_project_id,
      demo_expiration_date
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING "userTable"."user_id"`
    const values = [
      username,
      Boolean(requires2fa) ?? true,
      null,
      true,
      valid_vessel_ids ? vessel_ids : null,
      password,
      password_setup_token,
      client_id,
      demo_project_id,
      formattedExpireDate
    ]

    const sqlresponse = await admin_server_pool.query(query, values)
    const user_id = sqlresponse.rows[0].user_id;

    logger.info('New user has id ' + user_id)
    logger.debug('Init user permissions')
    initUserPermission(user_id, user_type, {demo: true});
    logger.debug('Init user settings')
    initUserSettings(user_id);
    return;
  }


  async function createProject(client_id = -1, metocean_provider_id = -1) {
    if (client_id < 1) client_id = await getDefaultForecastClientId();
    if (metocean_provider_id < 1) metocean_provider_id = await getDefaultMetoceanProviderId();
    logger.info(`Creating new project with client id = ${client_id}`)
    const currentTime = Date.now()
    const currentDate = new Date(currentTime);
    const activation_start_date = toIso8601(currentDate);
    const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
    const activation_end_date = toIso8601(nextMonth);
    const project_name = `demo_${currentTime}`
    const project_preferences = getDefaultProjectPreferences();
    const project_insert = {
      "name": project_name,
      "display_name": "Demo project",
      "consumer_id": 2,
      "client_id": client_id,
      "vessel_id": 1,
      "activation_start_date": activation_start_date,
      "activation_end_date": activation_end_date,
      "maximum_duration": 60,
      "latitude": 52,
      "longitude": 3,
      "water_depth": 20,
      "client_preferences": project_preferences,
      "analysis_types": ["Standard"],
      "metocean_provider_id": metocean_provider_id,
    }
    const project = await pg_post('/project/' + project_name, project_insert).catch(err => {
      logger.error(err?.response?.data?.message ?? `Unspecified error: status code ${err?.response?.status}`)
      throw err
    });
    if (project?.status != 201) {
      logger.error(project.data)
      throw new Error('Issue creating new project')
    }
    logger.info('Created project with id ' + project?.data?.id)
    return project.data.id;
  }


  async function getDefaultClientId() {
    const query = `SELECT "client_id" FROM "clientTable" WHERE "client_name"=$1`
    const values = [DEFAULT_CLIENT_NAME];
    const out = await admin_server_pool.query(query, values)
    const default_client_id = out.rows[0]?.client_id;
    if (default_client_id == null) throw new Error('Failed to find default client id')
    return default_client_id;
  }

  async function getDefaultForecastClientId() {
    const query = `SELECT "forecast_client_id" FROM "clientTable" WHERE "client_name"=$1`
    const values = [DEFAULT_CLIENT_NAME];
    const out = await admin_server_pool.query(query, values)
    const default_client_id = out.rows[0]?.forecast_client_id;
    if (default_client_id == null) throw new Error('Failed to find default client id')
    return default_client_id;
  }

  async function getDefaultMetoceanProviderId() {
    const out = await pg_get('/metocean_providers');
    const providers = out.data.metocean_providers;
    const demo_provider = providers.find(p => p?.name == DEFAULT_WEATHER_PROVIDER_NAME) ?? providers[0];
    return demo_provider.id;
  }


  function validateLogin(req, user, res) {
    const userData = req.body;
    if (!user.active) { res.onUnauthorized('User is not active, please contact your supervisor'); return false }
    if (!user.password || user.password == '') {
      res.onUnauthorized('Account needs to be activated before loggin in, check your email for the link');
      return false;
    }
    if (!bcrypt.compareSync(userData.password, user.password)) {
      res.onUnauthorized('Password is incorrect');
      return false;
    }
    logger.trace(user)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const isLocalHost = ip == '::1' || ip === '';
    const secret2faValid = (user.secret2fa?.length > 0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
    const requires2fa = (user.requires2fa == null) ? true : Boolean(user.requires2fa);
    logger.debug({ "msg": "2fa status", "requires2fa": requires2fa, "2fa_valid": secret2faValid, "isLocalhost": isLocalHost })
    if (!isLocalHost && !secret2faValid && requires2fa) {
      res.onUnauthorized('2fa is incorrect');
      return false
    }
    return true;
  }


  function initUserSettings(user_id = 0) {
    const localLogger = logger.child({
      user_id,
      function: "initUserSettings"
    })
    const text = `INSERT INTO "userSettingsTable"
    (user_id, timezone, unit, longterm, weather_chart, dpr)
    VALUES($1, $2, $3, $4, $5, $6)`;
    const values = [+user_id, { type: 'vessel' }, { speed: "knots" }, null, null, null];
    admin_server_pool.query(text, values).then(() => {
      localLogger.info('Created user settings')
    }).catch((err) => {
      localLogger.error(err.message)
    })
  }


  function initUserPermission(user_id = 0, user_type, opt_permissions = {}) {
    const localLogger = logger.child({
      user_id,
      user_type,
      function: "initUserPermission"
    })
    const is_admin = user_type == 'admin';
    const default_values = {
      user_type,
      admin: is_admin,
      user_read: true,
      demo: false,
      user_manage: is_admin,
      user_see_all_vessels_client: is_admin,
      dpr: {
        read: true,
        sov_input: 'read',
        sov_commercial: 'read',
        sov_hse: null,
      },
      longterm: {
        read: false,
      },
      twa: {
        read: is_admin
      },
      forecast: {
        read: is_admin,
        changeLimits: is_admin,
        createProject: is_admin
      }
    }
    let permissions = { ...default_values, ...opt_permissions };

    switch (user_type) {
      case 'admin':
        permissions.dpr.sov_input = 'write';
        permissions.dpr.sov_hse = 'write';
        break
      case 'Vessel master':
        permissions.user_read = false;
        permissions.dpr.sov_hse = 'write';
        break
      case 'Qhse specialist':
        permissions.dpr.sov_hse = 'sign';
        break
      case 'Marine controller':
        permissions.longterm.read = true;
        permissions.dpr.sov_hse = 'read';
        break
      case 'Logistics specialist':
        permissions.longterm.read = true;
        permissions.user_see_all_vessels_client = true;
        permissions.user_manage = true;
        break
      case 'Client representative':
        permissions.dpr.sov_commercial = 'read';
        permissions.dpr.sov_input = 'read';
        break
      case 'demo':
        permissions.demo = true;
        permissions.dpr.read = false;
        permissions.forecast.read = true;
        break
    }
    const query = `
      INSERT INTO "userPermissionTable"(
        "user_id", "admin", "user_read", "demo", "user_manage", "twa",
        "dpr", "longterm", "user_type", "forecast"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `
    const values = [user_id, permissions.admin, permissions.user_read, permissions.demo,
      permissions.user_manage, permissions.twa, permissions.dpr, permissions.longterm,
      permissions.user_type, permissions.forecast];
    admin_server_pool.query(query, values).then(() => {
      localLogger.info('Created user permissions')
    }).catch((err) => {
      localLogger.error(err)
    })
  }


  function getDefaultProjectPreferences() {
    return {
      "Points": [
        {
          "Name": "Crane",
          "X": {
            "Value": 5.0,
            "Type": "absolute",
            "Unit": "m"
          },
          "Y": {
            "Value": 3.5,
            "Type": "absolute",
            "Unit": "m"
          },
          "Z": {
            "Value": 2.0,
            "Type": "absolute",
            "Unit": "m"
          }
        }
      ],
      "Degrees_Of_Freedom": {
        "Roll": {
          "Disp": true,
          "Vel": false,
          "Acc": false
        },
        "Pitch": {
          "Disp": false,
          "Vel": false,
          "Acc": true
        },
        "Yaw": {
          "Disp": false,
          "Vel": true,
          "Acc": false
        },
        "Surge": {
          "Disp": false,
          "Vel": false,
          "Acc": false
        },
        "Sway": {
          "Disp": false,
          "Vel": true,
          "Acc": false
        },
        "Heave": {
          "Disp": true,
          "Vel": true,
          "Acc": false
        }
      },
      "Ops_Start_Time": "12:00",
      "Ops_Stop_Time": "13:00",
      "Ops_Heading": 45,
      "Max_Type": "MPM",
      "Limits": [
        {
          "Dof": "Heave",
          "Type": "Disp",
          "Value": 1.5,
          "Unit": "m"
        },
      ],
      "Ctv_Slip_Options": {
        "Window_Length_Seconds": 2,
        "Max_Allowed_Slip_Meter": 30,
        "Thrust_Level_N": 100000,
        "Slip_Coefficient": 0.7
      }
    }
  }


  function pg_get(endpoint) {
    const url = baseUrl + endpoint;
    logger.debug(`Performing POST request: ${url}`)
    return http.get(url, { headers, timeout })
  }
  function pg_post(endpoint, data) {
    const url = baseUrl + endpoint;
    logger.debug(`Performing POST request: ${url}`)
    return http.post(url, data, { headers, timeout })
  }
};

// #################### Support code non-dependent on server state ####################
function toIso8601(d) {
  return d.toISOString().slice(0, 23) + '+00:00';
}
