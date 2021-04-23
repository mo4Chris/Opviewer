var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');


module.exports = function (
  app,
  logger,
  onError = (res, err, additionalInfo) => console.log(err),
  onUnauthorized = (res, additionalInfo) => console.log(additionalInfo),
  admin_server_pool,
  mailTo = (subject, body, recipient='webmaster@mo4.online') => {}
) {
  // ######################### Endpoints #########################
  app.get('/api/admin/connectionTest', (req, res) => {
    admin_server_pool.query('SELECT sum(numbackends) FROM pg_stat_database').then(() => {
      return res.send({status: 1})
    }).catch((err) => {
      logger.warn(err, 'Connection test failed')
      return res.send({status: 0})
    })
  })

  app.post("/api/getRegistrationInformation", function(req, res) {
    const username = req.body.user;
    const registration_token = req.body.registration_token;
    // NOT SURE WHAT TO MAKE OF THIS FUNCTION
    const query = `SELECT username, requires2fa, secret2fa
      FROM "userTable"
      WHERE "token"=$1`
    const values = [registration_token]
    admin_server_pool.query(query, values).then(sqlresponse => {
      if (sqlresponse.rowCount == 0) return res.status(400).send('User not found / token invalid')
      const row = sqlresponse.rows[0];
      res.send({
        username: row.username,
        requires2fa: row.requires2fa,
      })
    }).catch(err => onError(res, err))
  });

  app.post('/api/createDemoUser',  async (req, res) => {
    const username = req.body.username;
    const password = req.body.password
    const requires2fa = req.body.requires2fa;
    const client_id = req.body.client_id;
    const vessel_ids = req.body.vessel_ids;
    const user_type = req.body.user_type;

    logger.debug('Validating incoming request')
    if (vessel_ids != null && !Array.isArray(vessel_ids)) {
      logger.info('Vessel is not in valid format')
      return res.status(400).send('Invalid vessel id format');
    }
    logger.trace('Verfying username format')
    if (typeof(username)!='string' || username.length<=0) return res.status(400).send('Invalid username. Should be string')
    logger.trace('Verfying 2fa format')
    if (requires2fa!=0 && requires2fa!= 1) return res.status(400).send('Invalid requires2fa: should be 0 or 1')
    logger.trace(`Verfying client_id format ${client_id} (${typeof client_id})`)
    if (typeof(client_id) != "number") return res.status(400).send('Invalid client id: should be int')
    logger.trace(`Verfying password format ${password} (${typeof password})`)
    if (typeof(password) != ("string" || null) || password.length<=6) return res.status(400).send('Invalid password: should be string of at least 7 characters')



    //turn account creation back on after other functions
    try {
      await createUser({
        username,
        requires2fa,
        client_id,
        vessel_ids,
        user_type,
        password
      })
    } catch (err) {
      if (err.constraint == 'Unique usernames') return onUnauthorized(res, 'User already exists')
      return onError(res, err, 'Error creating user')
    }
    // send email
    const html = `Dear Webmaster, <br><br>

    A demo account has been created for ${req.body.username}.<br>
    Please add the following details to the customer-contact excel sheet.<br>
    Username: ${req.body.username}<br>
    Full name: ${req.body.full_name}<br>
    Company: ${req.body.company}<br>
    Function: ${req.body.job_title}<br>
    Phone number: ${req.body?.phoneNumber}
    `;

    mailTo('Registered demo user', html, 'webmaster@mo4.online');
    logger.info({msg: 'Succesfully created user ', username})
    return res.send({ data: `User ${username} succesfully added!` });
  });

  app.post('/api/setPassword', function (req, res) {
    const token = req.body.passwordToken;
    const password = req.body.password;
    const confirm = req.body.confirmPassword;
    const confirm2fa = req.body.secret2fa;
    const localLogger = logger.child({
      token,
      hasPassword: password != null,
      has2Fa: confirm2fa != null
    })
    localLogger.info('Receiving set password request')

    if (!(token?.length > 0)) return res.status(400).send('Missing token')
    if (password != confirm) return res.status(400).send('Password does not match confirmation code')
    const query = `SELECT user_id, secret2fa, requires2fa
      FROM "userTable"
      WHERE "token"=$1`
    const values = [token];
    admin_server_pool.query(query, values).then((sqlresponse) => {
      localLogger.debug('Got sql response')
      if (sqlresponse.rowCount == 0) return res.status(400).send('User not found / token invalid')
      const data = sqlresponse.rows[0];
      const requires2fa = data.requires2fa ?? true;
      if (!requires2fa) localLogger.info('User does not require 2FA')
      const valid2fa = typeof(confirm2fa)=='string' && (confirm2fa.length > 0);
      if (requires2fa && !valid2fa) return res.status(400).send('2FA code is required but not provided!')
      const secret2faValid = (confirm2fa?.length > 0) && (twoFactor.verifyToken(data.secret2fa, confirm2fa) != null)
      if (!secret2faValid && requires2fa) return res.status(400).send('2FA code is not correct!')

      const user_id = data.user_id;
      const query2 = `UPDATE "userTable"
      SET password=$1,
          secret2fa=$2,
          token=null
      WHERE "userTable"."user_id"=$3
      `
      const hashed_password = bcrypt.hashSync(req.body.password, 10)
      const value2 = [hashed_password, confirm2fa, user_id]
      admin_server_pool.query(query2, value2).then(() => {
        res.send({ data: 'Password set successfully!' })
      }).catch(err => {
        onError(res, err)
      });
    }).catch(err => onError(res, err, 'Registration token not found!'))
  })

  app.post("/api/login", async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    const localLogger = logger.child({
      username
    })
    if (!username) {
      localLogger.info('Login failed: missing username')
      return res.status(400).send('Missing username')
    }
    if (!password) {
      localLogger.info({
        msg: 'Login failed: missing password',
        username: username,
      })
      return res.status(400).send('Missing password')
    }

    let token;
    let PgQuery = `SELECT "userTable"."user_id", "userTable"."username", "userTable"."password",
    "userTable"."active", "userTable".requires2fa, "userTable"."secret2fa",
    "clientTable"."client_name", "user_type", "admin", "user_read", "demo", 
    "user_manage", "twa", "dpr", "longterm", "forecast", "user_see_all_vessels_client", "userTable"."client_id"
    FROM "userTable"
    INNER JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
    LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
    WHERE "userTable"."username"=$1`
    const values = [username];

    localLogger.info('Received login for user: ' + username);
    admin_server_pool.query(PgQuery, values).then(async (data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length == 0) return onUnauthorized(res, 'User does not exist');

      let user = data.rows[0];
      localLogger.debug('Validating login')
      if (!validateLogin(req, user, res)) return null;
      localLogger.debug('Retrieving vessels for user')
      const vessels = await getVesselsForUser(res, user.user_id).catch(err => {return onError(res, err)});
      localLogger.trace(vessels);
      const expireDate = new Date();
      const payload = {
        userID: user.user_id,
        userPermission: user.user_type,
        userCompany: user.client_name,
        userBoats: vessels,
        username: user.username,
        client_id: user.client_id,
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

    }).catch((err) => {return onError(res, err)})
  });

  function getVesselsForUser(res, user_id) {
    let PgQuery = `
    SELECT "vesselTable"."mmsi", "vesselTable"."nicename"
      FROM "vesselTable"
      INNER JOIN "userTable"
      ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")
      WHERE "userTable"."user_id"=$1`;
    const values = [user_id]
    return admin_server_pool.query(PgQuery, values).then((data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length > 0) {
        return data.rows;
      } else {
        return null;
      }
    }).catch(err => onError(res, err, 'Failed to load vessels'));
  };

  async function createUser({
    username = '',
    requires2fa = false,
    client_id = null,
    vessel_ids = [],
    user_type = 'demo',
    password = null
  }) {
    let expireDate = new Date();
    expireDate = '' + expireDate.setMonth(expireDate.getMonth() + 1).valueOf()
    if (!(client_id > 0)) { throw Error('Invalid client id!') }
    if (!(username?.length > 0)) { throw Error('Invalid username!') }

    logger.info(`Creating new user ${username}`)
    const password_setup_token = null;
    if (password !== null && password !== '') password = bcrypt.hashSync(password, 10)
    const valid_vessel_ids = Array.isArray(vessel_ids); // && (vessel_ids.length > 0);
    const query = `INSERT INTO "userTable"(
      "username",
      "requires2fa",
      "active",
      "vessel_ids",
      "token",
      "client_id",
      "password",
      "demo_expiration_date"
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "userTable"."user_id"`
    const values = [
      username,
      Boolean(requires2fa) ?? true,
      true,
      valid_vessel_ids ? vessel_ids : null,
      password_setup_token,
      client_id,
      password,
      expireDate
    ]
    
    const sqlresponse = await admin_server_pool.query(query, values)
    const user_id = sqlresponse.rows[0].user_id;

    logger.info('New user has id ' + user_id)
    logger.debug('Init user permissions')
    initUserPermission(user_id, user_type);
    logger.debug('Init user settings')
    initUserSettings(user_id);
    return ;
  }


  function validateLogin(req, user, res) {
    const userData = req.body;
    if (!user.active) {onUnauthorized(res, 'User is not active, please contact your supervisor'); return false}
    if (!user.password || user.password == '') {
      onUnauthorized(res, 'Account needs to be activated before loggin in, check your email for the link');
      return false;
    }
    if (!bcrypt.compareSync(userData.password, user.password)) {
      onUnauthorized(res, 'Password is incorrect');
      return false;
    }
    logger.trace(user)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const isLocalHost = ip == '::1' || ip === '';
    const secret2faValid = (user.secret2fa?.length > 0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
    const requires2fa = (user.requires2fa == null) ? true : Boolean(user.requires2fa);
    logger.debug({"msg": "2fa status", "requires2fa": requires2fa, "2fa_valid": secret2faValid, "isLocalhost": isLocalHost})
    if (!isLocalHost && !secret2faValid && requires2fa) {
      onUnauthorized(res, '2fa is incorrect');
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
    const values = [+user_id, {type: 'vessel'}, {speed: "knots"}, null, null, null];
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
};
