var { Client, Pool } = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
const { response } = require('express');
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

  app.post("/api/registerUser", function (req, res) {
    res.send({ data: 'Great success!' })
  })

  app.post("/api/login", async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!username) {
      logger.info('Login failed: missing username')
      return res.status(400).send('Missing username')
    }
    if (!password) {
      logger.info('Login failed: missing password')
      return res.status(400).send('Missing password')
    }

    let token;
    let PgQuery = `SELECT "userTable"."user_id", "userTable"."username", "userTable"."password",
    "userTable"."active", "userTable"."permission", "userTable".requires2fa, "userTable"."2fa",
    "clientTable"."client_name"
    FROM "userTable"
    INNER JOIN "clientTable"
    ON "userTable"."client_id" = "clientTable"."client_id"
    WHERE ("userTable"."username"='${username}')`;

    pool.query(PgQuery).then(async (data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length == 0) return onUnauthorized(res, 'User does not exist');

      let user = data.rows[0];
      logger.trace(user);
      if (validateLogin(req, user, res)) {
        const vessels = await getVesselsForUser(res).catch(err => {return onError(res, err)});
        logger.trace(vessels);
        const expireDate = new Date();
        const payload = {
          userID: user.user_id,
          userPermission: 'admin',
          userCompany: user.client_name,
          userBoats: vessels,
          username: user.username,
          permission: user.permission,
          expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
        };
        token = jwt.sign(payload, 'secretKey');
        logger.trace('Login succesful for user: ' + user.username.toLowerCase())
        return res.status(200).send({ token });

      }
    }).catch((err) => {return onError(res, err)})
    logger.info('Received login for user: ' + username);
  });

  function getVesselsForUser(res) {
    let PgQuery = `
    SELECT "vesselTable"."mmsi", "vesselTable"."nicename"
      FROM "vesselTable"
      INNER JOIN "userTable"
      ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")`;
    return pool.query(PgQuery).then((data, err) => {
      if (err) return onError(res, err);
      if (data.rows.length > 0) {
        return data.rows;
      } else {
        return null;
      }
    });
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
