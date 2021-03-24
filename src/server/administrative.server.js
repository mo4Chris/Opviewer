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
  
app.get('/api/mo4admin/connectionTest', 
    defaultPgLoaderMultiColumn('public."userTable"', '"username", "password", "2fa"')
)

  app.get('/api/mo4admin/getClients', 
    defaultPgLoader('clients')
  );

  app.get('/api/mo4admin/getUsers',
    defaultPgLoader('users', 'username')
  );

  app.get('/api/mo4admin/getVesselList', 
    defaultPgLoader('vessels', 'type')
  );

  app.post("/api/mo4admin/login", function (req, res) {
    let usernameInput = req.body.username;
    let passwordInput = req.body.password;
    let twofactorInput = req.body.confirm2fa;
    let PgQuery = `SELECT username, password, "2fa" from public."userTable" where (username='${usernameInput}')`;
    console.log(PgQuery);
    pool.query(PgQuery).then((data, err) => {
      if (err) return onError(res, err);
      
      if (data.rows.length > 0 ){
          validateLogin(req, data.rows[0], res)
      } else {
        return onUnauthorized(res, 'User does not exist');
      }
      //res.send(data.rows)
    }, (err) => {
      onError(res, err);
    })

    logger.info('Received login for user: ' + usernameInput);
    // defaultPgLoaderMultiColumn('public."userTable"', '"username", "password", "2fa"')(function (err, user) {
    // //   if (user.active == 0) return onUnauthorized(res, 'User is not active, please contact your supervisor');
    // //   if (!user.password) return onUnauthorized(res, 'Account needs to be activated before loggin in, check your email for the link');
    //if (!bcrypt.compareSync(userData.password, user.password)) return onUnauthorized(res, 'Password is incorrect');
      
    // //   const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // //   const isLocalHost = ip == '::1' || ip === '';
    // //   const secret2faValid = (user.secret2fa?.length >0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
    // //   const isBibbyVesselMaster = user.client === 'Bibby Marine' && user.permissions == 'Vessel master';
    // //   if (!isLocalHost && !secret2faValid && !isBibbyVesselMaster) return onUnauthorized(res, '2fa is incorrect');
  
    // //   let filter = user.permissions == 'admin' ? null : { client: user.client };
    // //   turbineWarrantymodel.find(filter, function (err, data) {
    // //     if (err) return onError(res, err)
    // //     const expireDate = new Date();
    // //     const payload = {
    // //       userID: user._id,
    // //       userPermission: user.permissions,
    // //       userCompany: user.client,
    // //       userBoats: user.boats,
    // //       username: user.username,
    // //       expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
    // //       hasCampaigns: data?.length >= 1 && (user.permissions !== "Vessel master")
    // //     };
  
    // //     let token = jwt.sign(payload, 'secretKey');
    // //     logger.trace('Login succesful for user: ' + userData.username.toLowerCase())
  
    // //     return res.status(200).send({ token });
    // //  });
    // });
  });

  function validateLogin(req, user, res) {
    userData = req.body;
    //if (user.active == 0) return onUnauthorized(res, 'User is not active, please contact your supervisor');
    if (!user.password || user.password == '') return onUnauthorized(res, 'Account needs to be activated before loggin in, check your email for the link');
    if (!bcrypt.compareSync(userData.password, user.password)) return onUnauthorized(res, 'Password is incorrect');
      
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const isLocalHost = ip == '::1' || ip === '';
      const secret2faValid = (user.secret2fa?.length >0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
    // //   const isBibbyVesselMaster = user.client === 'Bibby Marine' && user.permissions == 'Vessel master';
    // //   if (!isLocalHost && !secret2faValid && !isBibbyVesselMaster) return onUnauthorized(res, '2fa is incorrect');
  
    // //   let filter = user.permissions == 'admin' ? null : { client: user.client };
    // //   turbineWarrantymodel.find(filter, function (err, data) {
    // //     if (err) return onError(res, err)
    const expireDate = new Date();
    const payload = {
        //userID: user._id,
        //userPermission: user.permissions,
        //userCompany: user.client,
        //userBoats: user.boats,
        username: user.username,
        expires: expireDate.setMonth(expireDate.getMonth() + 1).valueOf(),
        //hasCampaigns: data?.length >= 1 && (user.permissions !== "Vessel master")
    };
  
    let token = jwt.sign(payload, 'secretKey');
    logger.trace('Login succesful for user: ' + userData.username.toLowerCase())
  
    return res.status(200).send({ token });
    // //  });
    // });
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
  
//   function verifyToken(req, res) {
//     try {
//       if (!req.headers.authorization) return onUnauthorized(res, 'Missing headers');
      
//       const token = req.headers.authorization;
//       if (token == null || token === 'null')  return onUnauthorized(res, 'Token missing!');
  
//       const payload = jwt.verify(token, 'secretKey');
//       if (payload == null || payload == 'null') return onUnauthorized(res, 'Token corrupted!');
  
//       Usermodel.findByIdAndUpdate(payload.userID, {
//         lastActive: new Date()
//       }).exec().catch(err => {
//         logger.error('Failed to update last active status of user')
//       });
//       return payload;
//     } catch (err) {
//       return onError(res, err, 'Failed to parse jwt token')
//     }
//   }


  function defaultPgLoader(table, fields = '*', filter=null) {
    let PgQuery = '';
    if (fields == '*') {
      PgQuery = `SELECT * from ${table}`;
    } else if (typeof fields == 'string') {
      PgQuery = `SELECT (${fields}) from ${table}`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT (${fieldList}) from ${table}`;
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
      PgQuery = `SELECT ${fields} from ${table}`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT ${fieldList} from ${table}`;
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