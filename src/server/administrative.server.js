var { Client, Pool } = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
require('dotenv').config({ path: __dirname + '/./../.env' });

const pool = new Pool({
  host: process.env.ADMIN_DB_HOST,
  port: +process.env.ADMIN_DB_PORT,
  database: process.env.ADMIN_DB_DATABASE,
  user: process.env.ADMIN_DB_USER,
  password: process.env.ADMIN_DB_PASSWORD,
  ssl: false
})



module.exports = function (
  app,
  logger,
  onError = (res, err, additionalInfo) => console.log(err),
  onUnauthorized = (res, additionalInfo) => console.log(additionalInfo),
) {
  // ######################### SETUP CODE #########################
  pool.connect().then(() => {
    logger.info(`Connected to admin database at host ${process.env.ADMIN_DB_HOST}`)
  }).catch(err => {
    return logger.fatal(err, "Failed initial connection to admin db!")
  })
  pool.on('error', (err) => {
    logger.fatal(err, 'Unexpected error in connection with admin database!')
  })


  // ######################### Endpoints #########################
  app.get('/api/admin/connectionTest', (req, res) => {
    pool.query('SELECT sum(numbackends) FROM pg_stat_database').then(() => {
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
    pool.query(query, values).then(sqlresponse => {
      if (sqlresponse.rowCount == 0) return res.status(400).send('User not found / token invalid')
      const row = sqlresponse.rows[0];
      res.send({
        username: row.username,
        requires2fa: row.requires2fa,
      })
    }).catch(err => onError(res, err))
  });

  app.post('/api/setPassword', function (req, res) {
    const token = req.body.passwordToken;
    const password = req.body.password;
    const confirm = req.body.confirmPassword;
    const secret2fa = req.body.secret2fa;

    if (!(token?.length > 0)) return res.status(400).send('Missing token')
    if (password != confirm) return res.status(400).send('Password does not match confirmation code')

    const query = `SELECT user_id, requires2fa
      FROM "userTable"
      WHERE "token"=$1`
    const values = [token];
    pool.query(query, values).then((sqlresponse) => {
      if (sqlresponse.rowCount == 0) return res.status(400).send('User not found / token invalid')
      const data = sqlresponse.rows[0];
      const requires2fa = data.requires2fa ?? true;
      const valid2fa = typeof(secret2fa)=='string' && (secret2fa.length > 0);
      if (requires2fa && !valid2fa) return res.status(400).send('2FA code is required but not provided!')

      const user_id = data.user_id;
      const query2 = `UPDATE "user
      SET password=$1,
          secret2fa=$2,
          token=null
      WHERE "user_id"=$3
      `
      const value2 = [password, secret2fa, user_id]
      pool.query(query2, value2).then(() => {
        res.send({ data: 'Password set successfully!' })
      }).catch(err => onError(res, err));
    }).catch(err => onError(res, err, 'Registration token not found!'))
  })

  app.post("/api/login", async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!username) {
      logger.info('Login failed: missing username')
      return res.status(400).send('Missing username')
    }
    if (!password) {
      logger.info({
        msg: 'Login failed: missing password',
        username: username,
      })
      return res.status(400).send('Missing password')
    }

    let token;
    let PgQuery = `SELECT "userTable"."user_id", "userTable"."username", "userTable"."password",
    "userTable"."active", "userTable".requires2fa, "userTable"."secret2fa",
    "clientTable"."client_name", "user_type", "admin", "user_read", "user_write", "user_manage", "twa", "dpr", "longterm",
    "user_type", "forecast", "userTable"."client_id"
    FROM "userTable"
    INNER JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
    LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
    WHERE "userTable"."username"=$1`
    const values = [username];

    logger.info('Received login for user: ' + username);
    pool.query(PgQuery, values).then(async (data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length == 0) return onUnauthorized(res, 'User does not exist');

      let user = data.rows[0];
      logger.info(user);

      if (!validateLogin(req, user, res)) return null;
      const vessels = await getVesselsForUser(res, user.user_id).catch(err => {return onError(res, err)});
      logger.trace(vessels);
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
          user_write: user.user_write,
          user_manage: user.user_manage,
          twa: user.twa,
          dpr: user.dpr,
          longterm: user.longterm,
          user_type: user.user_type,
          forecast: user.forecast,
        },
        expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
      };
      token = jwt.sign(payload, 'secretKey');
      logger.trace('Login succesful for user: ' + user.username.toLowerCase())
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
    return pool.query(PgQuery, values).then((data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length > 0) {
        return data.rows;
      } else {
        return null;
      }
    }).catch(err => onError(res, err, 'Failed to load vessels'));
  };


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


};
