var {Client, Pool} = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
require('dotenv').config({ path: __dirname + '/./../.env' });

const pool = new Client({
    host: process.env.ADMINPGHOST,
    port:process.env.ADMINPGPORT, 
    database: process.env.ADMINPGDATABASE, 
    user: process.env.ADMINPGUSER,
    password: process.env.ADMINPGPASSWORD,
    ssl: false
})

module.exports = function(app, logger) {
  try {
    pool.connect()
    logger.info(`Connected to pg database at host ${pool.host}`)
  } catch (err) {
    logger.fatal(err)
  }
  
// app.get('/api/mo4admin/connectionTest', 
//     defaultPgLoaderMultiColumn('"userTable"', '"username", "password", "2fa"')
// )

  app.post("/api/mo4admin/login", function (req, res) {
    let usernameInput = req.body.username;
    let token;
    let PgQuery = `SELECT "userTable"."user_id", "userTable"."username", "userTable"."password",
    "userTable"."active", "userTable".requires2fa, "userTable"."2fa", "clientTable"."client_name"
    FROM "userTable"
    INNER JOIN "clientTable" 
    ON "userTable"."client_id" = "clientTable"."client_id"
    WHERE ("userTable"."username"='${usernameInput}')`;

    pool.query(PgQuery).then(async (data, err) => {
        if (err) return onError(res, err);  
        if (data.rows.length == 0) return onUnauthorized(res, 'User does not exist');
        
        let user = data.rows[0];
        console.log(user);
        vessels = await getVesselsForUser();
        if (validateLogin(req, user, res)) {
            const expireDate = new Date();
            const payload = {
                userID: user.user_id,
                //userPermission: user.permissions,
                userPermission: 'admin',
                userCompany: user.client_name,
                userBoats: vessels,
                username: user.username,
                expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
                //hasCampaigns: data?.length >= 1 && (user.permissions !== "Vessel master")
            };
            token = jwt.sign(payload, 'secretKey');
            logger.trace('Login succesful for user: ' + userData.username.toLowerCase())
            return res.status(200).send({ token });
        
        }
    }, (err) => {
      onError(res, err);
    })

    logger.info('Received login for user: ' + usernameInput);

  });

    function getVesselsForUser() {
        let PgQuery = `
        SELECT "vesselTable"."mmsi", "vesselTable"."nicename"
            FROM "vesselTable"
            INNER JOIN "userTable" 
            ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")`;
        return pool.query(PgQuery).then((data, err) => {
            if (err) return onError(res, err);
            
            if (data.rows.length > 0 ){
                return data.rows;
            } else {
                return null;
            }
        });
    };

    function validateLogin(req, user, res) {
        userData = req.body;
        if (!user.active) return onUnauthorized(res, 'User is not active, please contact your supervisor');
        if (!user.password || user.password == '') return onUnauthorized(res, 'Account needs to be activated before loggin in, check your email for the link');
        if (!bcrypt.compareSync(userData.password, user.password)) return onUnauthorized(res, 'Password is incorrect');
        
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const isLocalHost = ip == '::1' || ip === '';
        const secret2faValid = (user.secret2fa?.length >0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
        const doesNotRequire2fa = !user.requires2fa;

        if (!isLocalHost && !secret2faValid && !doesNotRequire2fa) return onUnauthorized(res, '2fa is incorrect');
        return true;

    }

  function onUnauthorized(res, cause = 'unknown') {
    logger.warn(`Unauthorized request: ${cause}`)
    if (cause == 'unknown') {
      res.status(401).send('Unauthorized request')
    } else {
      res.status(401).send(`Unauthorized: ${cause}`)
    }
  }
  
  function onError(res, err, additionalInfo = 'Internal server error') {
    if (typeof(err) == 'object') {
      err.debug = additionalInfo;
    } else {
      err = {
        debug: additionalInfo,
        msg: err,
        error: err,
      }
    }
    logger.error(err)
    res.status(500).send(additionalInfo);
  }


  function defaultPgLoader(table, fields = '*', filter=null) {
    let PgQuery = '';
    if (fields == '*') {
      PgQuery = `SELECT * from "${table}"`;
    } else if (typeof fields == 'string') {
      PgQuery = `SELECT (${fields}) from "${table}"`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT (${fieldList}) from "${table}"`;
    }
    if (filter) {
      PgQuery = `${PgQuery} where ${filter}`
    }
    return function(req, res) {
      pool.query(PgQuery).then((data, err) => {
        if (err) return onError(res, err);
        if (fields == '*') {
          res.send(data.rows)
        } else if (typeof fields == 'string') {
          res.send(data.rows.map(user => user[fields]));
        } else {
          const out = [];
          data.rows.forEach(row => {
            data = {};
            fields.forEach(key => {
              data[key] = row[key]
            });
            out.push(data)
          });
          res.send(out);
        }
      }, err => {
        onError(res, err);
      })
    }
  }

  function defaultPgLoaderMultiColumn(table, fields = '*', filter=null) {
    let PgQuery = '';
    if (typeof fields == 'string') {
      PgQuery = `SELECT ${fields} from "${table}"`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT ${fieldList} from "${table}"`;
    }
    if (filter) {
      PgQuery = `${PgQuery} where ${filter}`
    }
    return function(req, res) {
      pool.query(PgQuery).then((data, err) => {
        if (err) return onError(res, err);
        if (typeof fields == 'string') {
            res.send(data.rows)
        } else {
            // must check the else functionality for multicolumn
          const out = [];
          data.rows.forEach(row => {
            data = {};
            fields.forEach(key => {
              data[key] = row[key]
            });
            out.push(data)
          });
          res.send(out);
        }
      }, err => {
        onError(res, err);
      })
    }
  }

    function onError(res, err, additionalInfo = 'Internal server error') {
        if (typeof(err) == 'object') {
        err.debug = additionalInfo;
        } else {
            err = {
                debug: additionalInfo,
                msg: err,
                error: err,
            }
        }
        logger.error(err)
        res.status(500).send(additionalInfo);
    }
};