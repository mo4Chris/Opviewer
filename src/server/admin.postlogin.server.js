var { Client, Pool } = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
// require('dotenv').config({ path: __dirname + '/./../.env' });

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
  mailTo = (subject, body, recipient='webmaster@mo4.online') => {}
) {
  pool.connect().then(() => {
    logger.info(`Connected to admin database at host ${process.env.ADMIN_DB_HOST}`)
  }).catch(err => {
    return logger.fatal(err, "Failed initial connection to admin db!")
  })
  pool.on('error', (err) => {
    logger.fatal(err, 'Unexpected error in connection with admin database!')
  })


  // ############## ENDPOINTS ############

  app.get('/api/mo4admin/getClients', (req, res) => {
    const token = req['token'];
    const perm = token['permission'];
    if (!perm.admin) return onUnauthorized(res);
    defaultPgLoader('clients')(req, res);
  });

  app.get('/api/vesselList', (req, res) => {
    const token = req.token;
    const is_admin = token?.permission?.admin ?? false;
    const client_id = token?.client_id;
    console.log('client_id', client_id)
    let query, values;
    if (is_admin) {
      query = `SELECT *
        FROM "vesselTable"`
      values = [];
    } else {
      query = `SELECT *
        FROM "vesselTable"
        WHERE $1 == ANY("vesselTable"."client_ids")`
      values = [client_id];
    }
    pool.query(query, values).then(sqlresponse => {
      res.send(sqlresponse.rows);
    }).catch(err => onError(res, err));
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
  app.post('/api/createUser',  async (req, res) => {
    // TODO: verify client ID
    // TODO: verify if vessels belong to client
    // TODO: verify if token is acceptable)
    const own_token = req['token'];
    const own_user_id = +own_token.user_id;
    const own_vessel_ids = own_token.userBoats;
    const own_client_id = +own_token.client_id;
    const own_permissions = own_token.permission;
    const username = req.body.username;
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

    // Check if user is admin
    const is_admin = own_permissions?.['admin'] ?? false
    logger.trace('Verfying client')
    // TODO: If a user is associated with multiple clients this wont do
    if (!is_admin && (client_id != own_client_id)) return onUnauthorized(res, 'Target client does not match own client')
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

    // This part is now solved in an await statement to reduce its complexity
    let password_setup_token = '';
    try {
      password_setup_token = await createUser({
        username,
        requires2fa,
        client_id,
        vessel_ids,
        user_type
      })
    } catch (err) {
      if (err.constraint == 'Unique usernames') return onUnauthorized(res, 'User already exists')
      return onError(res, err, 'Error creating user')
    }
    logger.info(`Successfully created new user with random token ${password_setup_token}`)
    // send email
    const SERVER_ADDRESS = process.env.SERVER_ADDRESS;
    const link = `${SERVER_ADDRESS}/set-password;token=${password_setup_token};user=${username}`;
    const html = 'An account for the dataviewer has been created for this email. To activate your account <a href="' + link + '">click here</a> <br>' +
      'If that does not work copy the link below <br>' + link;
    mailTo('Registered user', html, username);
    logger.info({msg: 'Succesfully created user ', username, created_by: own_user_id})
    return res.send({ data: `User ${username} succesfully added!` });
  });


  app.post("/api/resetPassword", function(req, res) {
    const token = req['token']
    logger.info('Password reset requested for user' + token.username)
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
    if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);

    let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
    randomToken = randomToken.replace(/\//gi, '8');
    const user_id = token["userID"];
    const username = token["username"];
    const SERVER_ADDRESS = process.env.SERVER_ADDRESS

    // TODO: verify this works
    const query = `UPDATE "userTable"
      SET token=$1
      WHERE "user_id"=$2`
    const values = [randomToken, user_id]
    pool.query(query, values).then(sqlresponse => {
      const link = SERVER_ADDRESS + "/setPassword;token=" + randomToken + ";user=" + username;
      let html = `Your password has been reset. To use your account again, please
        <a href="${link}">click here</a> <br>
        If that doesnt work copy the link below <br> ${link}`;
        mailTo('Password reset', html, username);
        res.send({ data: "Succesfully reset the password" });
    }).catch(err => onError(res, err));
  });

  app.post("/api/setUserActive", function(req, res) {
    const token = req['token']
    const permission = token['permission'];
    const is_admin = permission.admin
    if (!is_admin && !permission.user_manage) return onUnauthorized(res);
    // if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
    if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);
    const username = req.body.username;
    let query, values;
    if (is_admin) {
      query = `UPDATE "userTable"
        SET "active"=false
        WHERE "userTable"."username"=$1`
      values = [username];
    } else {
      query = `UPDATE "userTable"
        SET "active"=false
        WHERE "userTable"."username"=$1 AND client_id==$2`
      values = [username, token['client_id']];
    }
    logger.info({
      msg: 'User (re)-activated',
      manager_user_id: token['userID'],
      username: username
    })
    pool.query(query, values).then(sqldata => {
      res.send({ data: "Succesfully deactivated this user" });
    }).catch(err => onError(res, err))
  });

  app.post("/api/setUserInactive", function(req, res) {
    const token = req['token']
    const permission = token['permission'];
    const is_admin = permission.admin
    if (!is_admin && !permission.user_manage) return onUnauthorized(res);
    // if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") return onUnauthorized(res);
    if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) return onUnauthorized(res);
    // TODO: verify company
    const username = req.body.username;
    let query, values;
    if (is_admin) {
      query = `UPDATE "userTable"
        SET "active"=false
        WHERE "userTable"."username"=$1`
      values = [username];
    } else {
      query = `UPDATE "userTable"
        SET "active"=false
        WHERE "userTable"."username"=$1 AND client_id==$2`
      values = [username, token['client_id']];
    }
    logger.info({
      msg: 'User deactivated',
      manager_user_id: token['userID'],
      username: username
    })
    pool.query(query, values).then(sqldata => {
      res.send({ data: "Succesfully deactivated this user" });
    }).catch(err => onError(res, err))
  });

  app.post("/api/sendFeedback", function(req, res) {
    const token = req['token'];
    const user = token['username'];
    const feedback = req.body.message;
    const client = user['userCompany']
    const page = req.body.page;
    logger.info({
      msg: 'Received feedback',
      client: client,
      user: user,
      feedback: feedback,
      page: page
    })
    const html = `Feedback has been given by: ${user} on page ${page}.<br><br>
      Feedback message: ${feedback}`;
    const WEBMASTER_MAIL = process.env.WEBMASTER_MAIL;
    mailTo('Feedback ' + client, html, WEBMASTER_MAIL);
    res.send({ data: 'Feedback has been sent', status: 200 });
  });

  app.get('/api/loadUserSettings', function(req, res) {
    const token = req['token']
    const user_id = token['userID']
    const query = `SELECT * FROM "userSettingsTable" WHERE "user_id"=$1`
    const values = [user_id];
    pool.query(query, values).then(sqldata => {
      res.send(sqldata.rows[0])
    }).catch(err => onError(res, err))
  });

  app.post('/api/saveUserSettings', function(req, res) {
    const token = req['token']
    let newSettings = req.body;
    const user_id = token['userID'];
    const query = `INSERT INTO "userSettingsTable"("user_id", "unit", "dpr", "longterm", "weather_chart", "timezone")
      VALUES($1, $2, $3, $4, $5, $6)
      ON CONFLICT ("user_id")
        DO UPDATE
          SET unit=$2,
           dpr=$3,
           longterm=$4,
           weather_chart=$5,
           timezone=$6
        WHERE "userSettingsTable"."user_id"=$1`
    const values = [
      user_id,
      newSettings['unit'],
      newSettings['dpr'],
      newSettings['longterm'],
      newSettings['weather_chart'],
      newSettings['timezone'],
    ];
    pool.query(query, values).then(sqldata => {
      res.send({status: 1});
    }).catch(err => onError(res, err))
  });

  app.get("/api/checkUserActive/:user", function(req, res) {
    // Currently any user can check if any other user is active...
    // Also, this really should be a post request
    const token = req['token'];
    if (!token.permission.user_read) return onUnauthorized(res);
    const query = 'SELECT "active" FROM "userTable" where username=$1';
    const values = [req.params.user]
    pool.query(query, values).then(sql_response => {
      const data = sql_response.rows[0];
      const out = data.active;
      res.send(out);
    }).catch(err => {
      onError(res, err, 'user not found')
    })
  });

  app.post("/api/get2faExistence", function (req, res) {
    // TODO: Seems like this can be integrated in another endpoint

    return res.send({secret2fa: ""})

    const token = req['token'];
    if (!token.permission.user_read) return onUnauthorized(res);
    let userEmail = req.body.userEmail;
    const query = `SELECT "secret2fa", "requires2fa"
    FROM "userTable"
    WHERE username=$1 AND "active"=1
    `
    const values = [userEmail];
    pool.query(query, [values]).then(sql_response => {
      const data = sql_response.rows[0];
      const out = data.secret2fa;
      if (!out.requires2fa || out.secret2fa == null) return res.send({secret2fa: ""})
      res.send({secret2fa: out.secret2fa})
    }).catch(err => {
      onError(res, err, 'user not found')
    })
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
    const token = req.token;
    const permission = token.permission;
    const is_admin = token?.permission?.admin ?? false;
    if (!is_admin && !permission.user_read) return onUnauthorized(res)

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
    pool.query(query, value).then(sqldata => {
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
    }).catch(err => onError(res, err))
  });

  app.post("/api/getUserByUsername", function(req, res) {
    const token = req.token;
    const permission = token.permission;
    const is_admin = token?.permission?.admin ?? false;
    const client_id = token.client_id;
    if (!is_admin && !permission.user_read) return onUnauthorized(res)

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
      value = [req.body.username, client_id]
    }
    pool.query(query, value).then(sqldata => {
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
      onError(res, err)
    })
  });

  app.get("/api/getCompanies", function(req, res) {
    const token = req.token;
    if (!token.permission.admin) return onUnauthorized(res);
    const query = `SELECT "client_id", "client_name", "client_permissions"
      FROM "clientTable"`
    pool.query(query).then((data) => {
      return res.send(data.rows);
    }).catch(err => onError(res, err, 'Failed to get clients!'))
  });

  app.post("/api/updateUserPermissions", function(req, res) {
    // TODO: verify working as intended
    const token = req.token;
    const permission = token['permission'];
    if (!permission.admin && !permission.user_manage) return onUnauthorized(res);

    const target_permission = req.body.permission;
    const may_not_change_target = target_permission.admin || target_permission.user_type == 'Logistics specialist'
    if (may_not_change_target) return onUnauthorized(res, 'Vessels for target cannot be changed!')

    const company = req.body.userCompany;
    const user_id = token['userID'];
    const same_company = token['userCompany'] == company;
    if (!permission.admin && !same_company) return onUnauthorized(res, 'Different company!');

    const vessel_ids = req.body['boats'].map(vessel => vessel.vessel_id)
    const query = `
      UPDATE "userTable"
      SET "vessel_ids"=$2
      WHERE "userTable"."user_id" = $1
    `
    const values = [user_id, vessel_ids];
    pool.query(query, values).then(() => {
      res.send({data: "Succesfully saved the permissions"})
    }).catch(err => onError(res, err))
  });

  // ############################################################
  // ##################### HELPER FUNCTIONS #####################
  // ############################################################

  async function createUser({
    username = '',
    user_type = 'Vessel master',
    requires2fa = true,
    vessel_ids = [],
    client_id = null
  }) {
    if (!(client_id > 0)) { throw Error('Invalid client id!') }
    if (!(username?.length > 0)) { throw Error('Invalid username!') }

    logger.info(`Creating new user ${username}`)
    const password_setup_token = generateRandomToken();
    const valid_vessel_ids = Array.isArray(vessel_ids); // && (vessel_ids.length > 0);
    const query = `INSERT INTO "userTable"(
      "username",
      "requires2fa",
      "active",
      "vessel_ids",
      "token",
      "client_id"
    ) VALUES($1, $2, $3, $4, $5, $6) RETURNING "userTable"."user_id"`
    const values = [
      username,
      Boolean(requires2fa) ?? true,
      true,
      valid_vessel_ids ? vessel_ids : null,
      password_setup_token,
      client_id,
    ]
    logger.info('Starting database insert')
    const sqlresponse = await pool.query(query, values)
    const user_id = sqlresponse.rows[0].user_id;

    logger.info('New user has id ' + user_id)
    logger.debug('Init user permissions')
    initUserPermission(user_id, user_type);
    logger.debug('Init user settings')
    initUserSettings(user_id);
    return password_setup_token;
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
    pool.query(text, values).then(() => {
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
        break
      case 'Client representative':
        permissions.dpr.sov_commercial = 'read';
        permissions.dpr.sov_input = 'read';
        break
      case 'Forecast demo':
        permissions.dpr.read = false;
        break
    }
    const query = `
      INSERT INTO "userPermissionTable"(
        "user_id", "admin", "user_read", "user_write", "user_manage", "twa",
        "dpr", "longterm", "user_type", "forecast"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `
    const values = [user_id, permissions.admin, permissions.user_read, permissions.user_write,
      permissions.user_manage, permissions.twa, permissions.dpr, permissions.longterm,
      permissions.user_type, permissions.forecast];
    pool.query(query, values).then(() => {
      localLogger.info('Created user permissions')
    }).catch((err) => {
      localLogger.error(err)
    })
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
      pool.query(PgQuery).then(data => {
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





function loadUserPermissions(user_id = 0) {
  return pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
}
function loadUserPreference(user_id = 0) {
  return pool.query('SELECT * FROM "userPermissionTable" WHERE "user_id"==$(1)', [user_id])
}
