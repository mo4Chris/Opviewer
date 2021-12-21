var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
const { body, validationResult, checkSchema, matchedData } = require('express-validator');
const models = require('./models/administrative.js');
const user_helper = require('./helper/user');
const hydro_helper = require('./helper/hydro');
const connections = require('./helper/connections');


// #################### Actual API ####################

/**
 * Server file with all the secure endpoints to the admin database.
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {(subject: string, body: string, recipient: string) => void} mailTo
 * @api public
 */
module.exports = function (
  app,
  logger,
  mailTo = (subject, body, recipient = 'webmaster@mo4.online') => { }
) {
  // ######################### Endpoints #########################
  app.get('/api/admin/connectionTest', (req, res) => {
    connections.admin.query('SELECT sum(numbackends) FROM pg_stat_database').then(() => {
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
      connections.admin.query(query, values).then(sqlresponse => {
        if (sqlresponse.rowCount == 0) return res.onBadRequest('User not found / token invalid')
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

    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const requires2fa = req.body.requires2fa;
    const vessel_ids = req.body.vessel_ids; // Always empty?
    const user_type = req.body.user_type ?? 'demo'; // Shouldn't this always be demo?
    //functie voor maken
    const tokenHash = bcrypt.hashSync(username, 10).replace(/\\|\$|\//g,'');

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
    try {
      const demo_client_id = await user_helper.getDefaulClientId();
      const query = `SELECT t.username
        FROM "userTable" t
        WHERE t."username"=$1`
      const values = [username];
      const response = await connections.admin.query(query, values)
      const user_exists = response.rowCount > 0;
      if (user_exists) return res.onBadRequest('User already exists');
      const demo_project_id = await hydro_helper.createProject() // works
      await user_helper.createDemoUser({
        username,
        requires2fa,
        client_id: demo_client_id,
        vessel_ids,
        user_type,
        password,
        demo_project_id,
        tokenHash
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
    Phone number: ${phoneNumber}<br>
    <br>
    https://portal.mo4.online/activate-demo-user/${tokenHash}/${username}
    `;

    mailTo('Registered demo user', html, 'webmaster@mo4.online');
    logger.info({ msg: 'Succesfully created user ', username })
    return res.send({ data: `User ${username} succesfully added! Please await account approval.` });
  });

  app.post('/api/activateDemoUser',
  async (req, res) => {
    const token = req.body?.token;
    const username = req.body?.username;
    const userValidationResponse = await user_helper.activateDemoUserViaToken(token, username)

    //Dit moet nog naar een EmailService/helper
    if (userValidationResponse?.status === 'success') sendDemoActivationEmail(username);

    return res.send(userValidationResponse)
  });

  function sendDemoActivationEmail(username) {

    const html = `
    Via this email we would like to update you regarding your requested demo account. <br>
    Your demo account has been approved. You can now use the MO4 portal for a month. <br>
    Go to https://portal.mo4.online to login using your credentials. <br>
    Please remember that for your trial period, the 2FA field should remain empty during login. <br><br>`;

    mailTo('Registered demo user', html, username);
    logger.info({ msg: 'Succesfully created user ', username })

  }
  

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
    connections.admin.query(query, values).then((sqlresponse) => {
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
      connections.admin.query(query2, value2).then(() => {
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
    const values = [username.toLowerCase()];

    localLogger.info('Received login for user: ' + username);
    connections.admin.query(PgQuery, values).then(async (admin_data, err) => {
      if (err) return res.onError(err);
      if (admin_data.rows.length == 0) return res.onUnauthorized('User does not exist');

      let user = admin_data.rows[0];
      localLogger.debug('Validating login')
      if (!user_helper.validateLogin(req, user, res)) return null; // Password validation happens here
      localLogger.debug('Retrieving vessels for user');
      const vessels = await user_helper.getAssignedVessels(user.user_id);

      localLogger.debug('Retrieving client for user');
      const query = 'SELECT "forecast_client_id" FROM "clientTable" WHERE "client_id" = $1';
      const client_data = await connections.admin.query(query, [user.client_id]);
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
}
