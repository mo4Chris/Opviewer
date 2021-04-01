var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
require('dotenv').config({ path: __dirname + '/./../.env' });


module.exports = function (
  app,
  logger,
  onError = (res, err, additionalInfo) => console.log(err),
  onUnauthorized = (res, err, additionalInfo) => console.log(err),
  admin_server_pool
) {



  // ############## ENDPOINTS ############

  app.get('/api/mo4admin/getClients', (req, res) => {
    const token = req['token'];
    const perm = token['permission'];
    if (!perm.admin) return onUnauthorized(res);
    defaultPgLoader('clients')(req, res);
  });

  app.get('/api/vesselList', (req, res) => {
    res.send([])
  });

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
    const own_user_id = +own_token['user_id'];
    const own_vessel_ids = own_token['userBoats'];
    const own_client_id = +own_token['client_id'];
    const own_permissions = +own_token['permission'];
    logger.trace(own_token)
    logger.trace(req.body)
    const username = req.body.username;
    const requires2fa = req.body.requires2fa;
    const client_id = req.body.client_id;
    const vessel_ids = req.body.vessel_ids;
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

    // Check if user is admin
    const is_admin = own_permissions?.['admin'] ?? false
    logger.trace('Verfying client')
    // TODO: If a user is associated with multiple clients this wont do
    if (is_admin || (client_id != own_client_id)) return onUnauthorized(res, 'Target client does not match own client')
    logger.trace({msg: 'Verfying vessels belong to client', own: own_vessel_ids, new: vessel_ids})
    if (is_admin || (own_vessel_ids == null && vessel_ids == null)) {
      // Valid - do nothing
    } else if (own_vessel_ids == null) {
      // TODO: Check if vessel belongs to client
      // const own_vessel_list = loadVesselList(own_user_id);
    } else {
      if (vessel_ids == null) return onUnauthorized(res, 'Cannot assign vessels you have no access to!')
      const illegal = vessel_ids.some(id => {
        const in_own_vessel_list = own_vessel_ids.some(_onw_id => id === _onw_id)
        return !in_own_vessel_list;
      });
      if (illegal) return onUnauthorized(res, 'Cannot assign vessels you have no access to!')
    }
    createUser({
      username,
      requires2fa,
      client_id,
      vessel_ids
    }).catch(err => {
      console.log('ERROR CATCH')
      return onError(res, err, 'Error creating user')
    }).then((password_setup_token) => {
      logger.info(`Created new user with random token ${password_setup_token}`)
      res.send({ data: 'Vessel succesfully added!' });
      // send email

      // const link = SERVER_ADDRESS + "/set-password;token=" + password_setup_token + ";user=" + username;
      // const html = 'An account for the dataviewer has been created for this email. To activate your account <a href="' + link + '">click here</a> <br>' +
      //   'If that doesnt work copy the link below <br>' + link;
      // mailTo('Registered user', html, username);
      // logger.info('Succesfully created user ' + user.username)
      // return res.send({
      //   data: 'User created',
      //   status: 200
      // });
    })
  });



  // app.post("/api/registerUser", function(req, res) {
  //   const userData = req.body;
  //   const token = req['token']
  //   logger.info('Received request to create new user: ' + userData.email);
  //   switch (token.userPermission){
  //     case 'admin':
  //       // Always allowed
  //       break;
  //     case 'Logistics specialist':
  //       if (token.userCompany != userData.client) return onUnauthorized(res, 'Cannot register user for different company')
  //       break;
  //     default:
  //       return onUnauthorized(res, 'User not priviliged to register users!')
  //   }
  //   Usermodel.findOne({ username: userData.email, active: { $ne: false } },
  //     function(err, existingUser) {
  //       if (err) return onError(res, err);
  //       if (existingUser) return onUnauthorized(res, 'User already exists');
  //       let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
  //       randomToken = randomToken.replace(/\//gi, '8');
  //       let user = new Usermodel({
  //         "username": userData.email.toLowerCase(),
  //         "token": randomToken,
  //         "permissions": userData.permissions,
  //         "client": userData.client,
  //         "secret2fa": "",
  //         "active": 1,
  //         "password": null,
  //       });
  //       user.save((error, registeredUser) => {
  //         if (error) return onError(res, 'User already exists');
  //       });
  //     });
  //   })


app.post("/api/resetPassword", function(req, res) {
  const token = req['token']
  logger.info('Password reset requested for user' + token.username)
  if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
  if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);

  let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
  randomToken = randomToken.replace(/\//gi, '8');
  // Usermodel.findOneAndUpdate({
  //   _id: req.body._id,
  //   active: { $ne: false }
  // }, {
  //   token: randomToken
  // }, function(err, data) {
  //   if (err) return onError(res, err);
  //   let link = SERVER_ADDRESS + "/registerUser;token=" + randomToken + ";user=" + data.username;
  //   let html = 'Your password has been reset to be able to use your account again you need to <a href="' + link + '">click here</a> <br>' +
  //     'If that doesnt work copy the link below <br>' + link;
  //   mailTo('Password reset', html, data.username);
  //   res.send({ data: "Succesfully reset the password" });
  // });
});

app.post("/api/setActive", function(req, res) { // Naam moet eigenlijk wel beter
  const token = req['token']
  if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
  if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);

  // Usermodel.findOneAndUpdate({
  //   _id: req.body._id
  // }, {
  //   active: 1
  // }, function(err, data) {
  //   if (err) return onError(res, err);
  //   var userActivity = new UserActivitymodel();
  //   userActivity.username = req.body.user;
  //   userActivity.changedUser = req.body._id;
  //   userActivity.newValue = 'active';
  //   userActivity.date = new Date();

  //   userActivity.save(function(err, data) {
  //     if (err) return onError(res, err, 'Failed to activate user!');
  //     res.send({ data: "Succesfully activated this user" });
  //   });
  // });
});

app.post("/api/setInactive", function(req, res) {
  const token = req['token']
  if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
  if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);
  // Usermodel.findOneAndUpdate({
  //   _id: req.body._id
  // }, {
  //   active: 0
  // }, function(err, data) {
  //   if (err) return onError(res, err);
  //   var userActivity = new UserActivitymodel();
  //   userActivity.username = req.body.user;
  //   userActivity.changedUser = req.body._id;
  //   userActivity.newValue = 'inactive';
  //   userActivity.date = new Date();

  //   userActivity.save(function(err, data) {
  //     if (err) return onError(res, err, 'Failed to deactivate user!')
  //     res.send({ data: "Succesfully deactivated this user" });
  //   });
  // });
});


  async function createUser({
    username = '',
    requires2fa = true,
    vessel_ids = [],
    client_id = null
  }) {
    if (!(client_id > 0)) { throw Error('Invalid client id!') }
    if (!(username?.length > 0)) { throw Error('Invalid username!') }

    logger.info(`Creating new user ${username}`)
    const password_setup_token = generateRandomToken();
    const valid_vessel_ids = Array.isArray(vessel_ids) && (vessel_ids.length > 0);
    const newUser = [
      username,
      requires2fa ?? true,
      true,
      valid_vessel_ids ? vessel_ids : null,
      password_setup_token,
      client_id,
    ]
    const txt = `INSERT INTO "userTable"(
        "username",
        "requires2fa",
        "active",
        "vessel_ids",
        "token",
        "client_id"
      ) VALUES($1, $2, $3, $3, $5, $6) RETURNING "user_id"`
    logger.debug('Starting database insert')
    return admin_server_pool.query(txt, newUser).then(user_id => {
      logger.debug('New user has id', user_id)
      logger.debug('Init user permissions')
      initUserPermission(user_id).catch(err => {
        logger.error(err)
      });
      logger.debug('Init user settings')
      initUserSettings(user_id).catch(err => {
        logger.error(err)
      });
      return password_setup_token;
    }).catch(err => { throw Error(err) })
  }

  app.post("/api/sendFeedback", function(req, res) {
    const feedbacklogger = logger.child({ feedback: req.body.message, user: req.body.person, page: req.body.page })
    Usermodel.findOne({ _id: req.body.person, active: { $ne: false } }, function(err, data) {
      if (err) {
        feedbacklogger.error(err);
        return res.send(err);
      }
      if (data) {
        feedbacklogger.info({ msg: 'Received feedback!' })
        let html = 'feedback has been given by: ' + data.username + ' on page ' + req.body.page + '.<br><br>' +
          'feedback message: ' + req.body.message;
        mailTo('Feedback ' + data.client, html, WEBMASTER_MAIL);
        res.send({ data: 'Feedback has been sent', status: 200 });
      } else {
        return onError(res, err);
      }
    });
  });

  app.post("/api/getUserByToken", function(req, res) {
    const user = req.body.user;
    Usermodel.findOne({
      token: req.body.passwordToken,
      username: user,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      if (data) {
        res.send({
          username: data.username,
          userCompany: data.client,
          permissions: data.permissions
        });
      } else {
        return onError(res, `User ${user} not found!`, 'User not found / password not correct')
      }
    });
  });

  app.get('/api/loadUserSettings', function(req, res) {
    const token = req['token']
    const user_id = token['userID']
    'FROM '
    // Usermodel.findOne({
    //   username: token.username
    // }, {
    //   settings: 1,
    //   _id: 0,
    // }, (err, data) => {
    //   if (err) return onError(res, err);
    //   res.send(data);
    // })
  });

  app.post('/api/saveUserSettings', function(req, res) {
    const token = req['token']
    let newSettings = req.body;
    // Usermodel.updateOne({
    //   username: token.username,
    // }, {
    //   settings: newSettings
    // }, (err, data) => {
    //   if (err) return onError(res, err);
    //   res.send(data);
    // });
  });
  app.get("/api/checkUserActive/:user", function(req, res) {
    // Currently any user can check if any other user is active...
    const query = 'SELECT "active" FROM "userTable" where username=$1';
    // const vals = req.params.user;
    const vals = 'test@test.nl'
   admin_server_pool.query(query, [vals]).then(sql_response => {
      const data = sql_response.rows[0];
      const out = data.active;
      res.send(out);
    }).catch(err => {
      onError(res, err, 'user not found')
    })
  });

  app.post("/api/get2faExistence", function (req, res) {
    let userEmail = req.body.userEmail;
    // Usermodel.findOne({ username: userEmail, active: { $ne: false } },
    //   function (err, user) {
    //     if (err) return onError(res, err);
    //     if (!user) return onError(res, 'User does not exist: ' + userEmail, 'User does not exist');
    //     if (user.secret2fa === undefined || user.secret2fa === "" || user.secret2fa === {} || (user.client === 'Bibby Marine' && user.permissions == 'Vessel master')) {
    //       res.send({ secret2fa: "" });
    //     } else {
    //       res.send({ secret2fa: user.secret2fa });
    //     }
    //   });
  });

  app.get("/api/getUsers", function(req, res) {
    const token = req['token']
    const usertype = token['userPermission'];
    const is_admin = Boolean(token?.permission?.admin) || usertype == 'admin';
    // if ( !is_admin && usertype !== "Logistics specialist") return onUnauthorized(res);

    const selectedFields = `"userTable"."user_id", "userTable"."active", "username", "vessel_ids", "userTable"."client_id",
    "admin", "user_read", "user_write", "user_manage", "twa", "dpr", "longterm",
    "user_type", "forecast", "client_name"`
    let query, value;
    if (is_admin) {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"`;
      value = []
    } else {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        where "client_id"=$1`;
      value = [token['client_id']]
    }
   admin_server_pool.query(query, value).then(sqldata => {
      const users = sqldata.rows.map(row => {
        return {
          active: row.active,
          userID: row.user_id,
          username: row.username,
          client_name: row.client_name,
          client_id: row.client_id,
          vessel_ids: row.vessel_ids,
          permission: {
            user_type: row.user_type,
            admin: row.admin,
            user_read: row.user_read,
            user_write: row.user_write,
            user_manage: row.user_manage,
            twa: row.twa,
            dpr: row.dpr,
            longterm: row.longterm,
            forecast: row.forecast,
          }
        }
      })
      return res.send(users)
    }).catch(err => {
      console.log(err)
      // onError(res, err)
    })
  });

  app.post("/api/getUserByUsername", function(req, res) {
    const token = req['token']
    const usertype = token['userPermission'];
    const is_admin = Boolean(token?.permission?.admin) || usertype == 'admin';
    // if ( !is_admin && usertype !== "Logistics specialist") return onUnauthorized(res);

    const selectedFields = `"userTable"."user_id", "userTable"."active", "username", "vessel_ids", "userTable"."client_id",
    "admin", "user_read", "user_write", "user_manage", "twa", "dpr", "longterm",
    "user_type", "forecast", "client_name"`
    let query, value;
    if (is_admin) {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        WHERE "userTable"."username" = $1`;
      value = [req.body.username]
    } else {
      query = `SELECT ${selectedFields}
        FROM "userTable"
        LEFT JOIN "userPermissionTable" ON "userTable"."user_id" = "userPermissionTable"."user_id"
        LEFT JOIN "clientTable" ON "userTable"."client_id" = "clientTable"."client_id"
        where "username" = $1 AND "client_id"=$2`;
      value = [req.body.username, token['client_id']]
    }
   admin_server_pool.query(query, value).then(sqldata => {
      const users = sqldata.rows.map(row => {
        return {
          active: row.active,
          userID: row.user_id,
          username: row.username,
          client_name: row.client_name,
          client_id: row.client_id,
          vessel_ids: row.vessel_ids,
          permission: {
            user_type: row.user_type,
            admin: row.admin,
            user_read: row.user_read,
            user_write: row.user_write,
            user_manage: row.user_manage,
            twa: row.twa,
            dpr: row.dpr,
            longterm: row.longterm,
            forecast: row.forecast,
          },
          boats: [], // TODO
        }
      })
      return res.send(users)
    }).catch(err => {
      console.log(err)
      // onError(res, err)
    })
  });

  app.post("/api/getVesselsForCompany", function(req, res) {
    let companyName = req.body[0].client;
    const token = req['token']
    console.log(token)
    // if (token.userCompany !== companyName && token.userPermission !== "admin") return onUnauthorized(res);
    // let filter = { client: companyName, active: { $ne: false } };
    // // if (!req.body[0].notHired) filter.onHire = 1;

    // if (token.userPermission !== "Logistics specialist" && token.userPermission !== "admin") {
    //   filter.mmsi = [];
    //   for (var i = 0; i < token.userBoats.length; i++) {
    //     filter.mmsi[i] = token.userBoats[i].mmsi;
    //   }
    // }
    // Vesselmodel.find(filter).sort({
    //   nicename: 'asc'
    // }).exec( function(err, data) {
    //   if (err) return onError(res, err);
    //   res.send(data);
    // });
  });

  app.get("/api/getCompanies", function(req, res) {
    const token = req['token']
    if (token.userPermission !== 'admin') return onUnauthorized(res);
    Vesselmodel.find({
      active: { $ne: false }
    }).distinct('client', function(err, data) {
      if (err) return onError(res, err);
      let BusinessData = data + '';
      let arrayOfCompanies = [];
      arrayOfCompanies = BusinessData.split(",");
      res.send(arrayOfCompanies);
    });
  });

  app.post("/api/saveUserBoats", function(req, res) {
    // TODO
    // Maybe change to /api/updateVesselsForUser
    const token = req['token']
    // if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
    // if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);
    // Usermodel.findOneAndUpdate({ _id: req.body._id, active: { $ne: false } }, { boats: req.body.boats },
    //   function(err, data) {
    //     if (err) return onError(res, err);
    //     res.send({ data: "Succesfully saved the permissions" });
    //   });
  });


  function defaultPgLoaderMultiColumn(table, fields = '*', filter = null) {
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
    return function (req, res) {
      admin_server_pool.query(PgQuery).then((data) => {
        if (typeof fields == 'string') return res.send(data.rows);
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

  function defaultPgLoader(table, fields = '*', filter = null) {
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
    return function (req, res) {
      admin_server_pool.query(PgQuery).then(data => {
        if (fields == '*') return res.send(data.rows)
        if (typeof fields == 'string') {
          return res.send(data.rows.map(user => user[fields]));
        }
        const out = [];
        data.rows.forEach(row => {
          const temp = {};
          fields.forEach(key => {
            temp[key] = row[key]
          });
          out.push(data)
        });
        res.send(out);
      }).catch(err => onError(res, err))
    }
  }
};


function initUserSettings(res, user_id) {
  const text = 'INSERT INTO "userSettingsTable"(user_id, timezone, unit, longterm, weather_chart) VALUES($1, $2, $3, $4, $5)';
  const values = [
    user_id, 
    {"type":"vessel","fixedTimeZoneOffset":0,"fixedTimeZoneLoc":"Europe/London"}, 
    {"distance":"km","speed":"km/h","weight":"ton","gps":"DMS"}, 
    {"filterFailedTransfers":1},
    {"Hs":false,"windAvg":false,"V2v transfers":false,"Turbine transfers":false,"Platform transfers":false,"Transit":false,"Vessel transfers":false} 
  ];
  return admin_server_pool.query(text, [values])
}

function initUserPermission(user_id, user_type, opt_permissions = {}) {
  // const text = `INSERT INTO "userSettingsTable"(
  //   user_id, timezone, unit, longterm, weather_chart
  //   ) VALUES($1, $2, $3, $4, $5)`;
  console.log('entered init process');
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
  let values = { ...default_values, ...opt_permissions };

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
  // return admin_server_pool.query(`SELECT * FROM "${table_name}"`)

  const keys = Object.keys(insert_object);
  const joined_keys = keys.map(k => '"' + k + '"').join(', ')
  const joined_values = keys.map((key, i) => '$' + (i + 1)).join(', ')
  const values = keys.map(k => insert_object[k])
  const full_query = `INSERT INTO "${table_name}"(${joined_keys}) VALUES(${joined_values}) RETURNING ${id_name}`
  return admin_server_pool.query(full_query, values)
}

function generateRandomToken() {
  let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
  randomToken = randomToken.replace(/\//gi, '8');
  return randomToken;
}


function loadUserPermissions(user_id = 0) {
  return admin_server_pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
}
function loadUserPreference(user_id = 0) {
  return admin_server_pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
}
