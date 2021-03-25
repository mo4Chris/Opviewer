var {Client, Pool} = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
require('dotenv').config({ path: __dirname + '/./../.env' });

const pool = new Client({
    host: process.env.ADMIN_DB_HOST,
    port: +process.env.ADMIN_DB_PORT,
    database: process.env.ADMIN_DB_DATABASE,
    user: process.env.ADMIN_DB_USER,
    password: process.env.ADMIN_DB_PASSWORD,
    ssl: false
})


module.exports = function(app, logger, onError, onUnauthorized) {
  // ######################### SETUP CODE #########################
  pool.connect().then(() => {
    logger.info(`Connected to admin database at host ${pool.host}`)
  }).catch(err => {
    return logger.fatal(err, "Failed initial connection to admin db!")
  })
  pool.on('error', (err) => {
    logger.fatal(err, 'Unexpected error in connection with admin database!')
  })


  // ######################### Endpoints #########################
  app.get('/api/admin/connectionTest',
      defaultPgLoaderMultiColumn('"userTable"', '"username", "password", "2fa"')
  )

  app.get('/api/mo4admin/getClients', (req, res) => {
    const token = req['token'];
    const perm = token['permission'];
    if (!perm.admin) return onUnauthorized(res);
    defaultPgLoader('clients')(req, res);
  });

  app.get('/api/getUsers',
    // if admin OR only for current client
    defaultPgLoader('users', 'username')
  );

  app.get('/api/vesselList',
    // if admin, or filter o'wise
    defaultPgLoader('vessels', 'type')
  );

  app.get('/api/userPermissions', (req, res) => {
    const token = req['token'];
    const user_id = token['user_id'];
    return loadUserPermissions(user_id).catch((err) => {
      return onError(res, err)
    })
  })
  app.get('/api/userPreferences', (req, res) => {
    const token = req['token'];
    const user_id = token['user_id'];
    return loadUserPermissions(user_id).catch((err) => {
      return onError(res, err)
    })
  })

  app.post('/api/createUser', (req, res) => {
    // TODO: verify client ID
    // TODO: verify if vessels belong to client
    // TODO: verify if token is acceptable)
    const own_token = req['token'];
    const own_user_id = own_token['user_id'];
    const own_client_id = own_token['client_id']

    const username = req.body.username;
    const requires2fa = req.body.requires2fa;
    const client_id = req.body.client_id;
    const vessel_ids = req.body.vessel_ids;

    if (client_id != own_client_id) onUnauthorized(res, 'Target client does not match own client')
    if (client_id != own_client_id) onUnauthorized(res, 'Target client does not match own client')

    createUser({
      username,
      requires2fa,
      client_id,
      vessel_ids
    }, err => onError(res, err))
  });

  app.post("/api/registerUser", function (req, res) {
    res.send({data: 'Great success!'})
  })

  app.post("/api/login", function (req, res) {
    let usernameInput = req.body.username;
    let passwordInput = req.body.password;
    let twofactorInput = req.body.confirm2fa;
    let PgQuery = `SELECT username, password, "2fa" from public."userTable" where (username='${usernameInput}')`;
    pool.query(PgQuery).then((data, err) => {
      if (err) return onError(res, err);
      if (data?.rows?.length > 0 ){
          validateLogin(req, data.rows[0], res)
      } else {
        return onUnauthorized(res, 'User does not exist');
      }
      //res.send(data.rows)
    }).catch(err => onError(res, err))

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
    const userData = req.body;
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
        if (fields == '*') return res.send(data.rows)
        if (typeof fields == 'string') {
          return res.send(data.rows.map(user => user[fields]));
        }
        const out = [];
        data.rows.forEach(row => {
          data = {};
          fields.forEach(key => {
            data[key] = row[key]
          });
          out.push(data)
        });
        res.send(out);
      }).catch(err => onError(res, err))
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
      pool.query(PgQuery).then((data) => {
        if (typeof fields == 'string')  return res.send(data.rows);
          // must check the else functionality for multicolumn
        const out = [];
        data.rows.forEach(row => {
          const data = {};
          fields.forEach(key => {
            data[key] = row[key]
          });
          out.push(data)
        });
        res.send(out);
      }).catch(err => {
        onError(res, err);
      })
    }
  }

  function loadUserPermissions(user_id = 0) {
    return pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
  }
  function loadUserPreference(user_id = 0) {
    return pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
  }


  async function createUser({username='', requires2fa=true, vessel_ids=[], client_id=null}, onError = (err)=>{}) {
    " Creates a new user "
    if (!(client_id>0)) onError('Invalid client id!')
    if (!(username?.length==0)) onError('Invalid username!')

    const valid_vessel_ids = Array.isArray(vessel_ids) && (vessel_ids.length>0);
    const password_setup_token = generateRandomToken();
    const newUser = [
      username,
      requires2fa ?? true,
      true,
      valid_vessel_ids ? vessel_ids : null,
      password_setup_token,
      client_id,
    ]
    // return genericSqlInsert('userTable', newUser)
    const txt = `INSERT INTO "userTable"(
        "username",
        "requires2fa",
        "active",
        "vessel_ids",
        "token"
        "client_id"
      ) VALUES($1, $2, $3, $3, $5, $6) RETURNING "user_id"`
    return pool.query(txt, newUser)
      .catch(onError)
      .then(user_id => {
        initUserPermission(user_id).catch(onError);
        initUserSettings(user_id).catch(onError);
        return password_setup_token;
    })
  }

  function initUserSettings(res, user_id) {
    const text = 'INSERT INTO "userSettingsTable"(user_id, timezone, unit, longterm, weather_chart) VALUES($1, $2, $3, $4, $5)';
    const values = [user_id,'vessel',{},{},{}];
    return pool.query(text, [values])
  }

  function initUserPermission(user_id, user_type, opt_permissions = {}) {
    // const text = `INSERT INTO "userSettingsTable"(
    //   user_id, timezone, unit, longterm, weather_chart
    //   ) VALUES($1, $2, $3, $4, $5)`;
    const is_admin = user_type == 'admin';
    const default_values = {
      user_id,
      user_type,
      admin: is_admin,
      user_read: true,
      user_write: is_admin,
      user_manage: is_admin,
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
    let values = {... default_values, ... opt_permissions};

    switch (user_type) {
      case 'admin':
        values.dpr.sov_input = 'write';
        values.dpr.sov_hse = 'write';
        break
      case 'Vessel master':
        values.user_read = false;
        values.dpr.sov_hse = 'write';
        break
      case 'Qhse specialist':
        values.dpr.sov_hse = 'sign';
        break
      case 'Marine controller':
        values.longterm.read = true;
        values.dpr.sov_hse = 'read';
        break
      case 'Logistics specialist':
        values.longterm.read = true;
        break
      case 'Client representative':
        values.dpr.sov_commercial = 'read';
        values.dpr.sov_input = 'read';
        break
      case 'Forecast demo':
        values.dpr.read = false;
        break
    }
    return genericSqlInsert('userPermissionTable', values)
  }

  function genericSqlInsert(table_name, insert_object, appendum = null, id_name = 'user_id') {
    // return pool.query(`SELECT * FROM "${table_name}"`)

    const keys = Object.keys(insert_object);
    const joined_keys = keys.map(k => '"' + k + '"').join(', ')
    const joined_values = keys.map((key, i) => '$' + (i + 1)).join(', ')
    const values = keys.map(k => insert_object[k])
    const full_query = `INSERT INTO "${table_name}"(${joined_keys}) VALUES(${joined_values}) RETURNING ${id_name}`
    return pool.query(full_query, values)
  }

  function generateRandomToken() {
    let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
    randomToken = randomToken.replace(/\//gi, '8');
    return randomToken;
  }
};
