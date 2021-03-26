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
    console.log('/api/createUser')
    const own_token = req['token'];
    console.log(own_token)
    const own_user_id = own_token['user_id'];
    const own_client_id = own_token['client_id']
    console.log('req.body', req.body)

    const username = req.body.username;
    const requires2fa = req.body.requires2fa;
    const client_id = req.body.client_id;
    const vessel_ids = req.body.vessel_ids;

    if (client_id != own_client_id) return onUnauthorized(res, 'Target client does not match own client')

    console.log('Creating user!')
    createUser({
      username,
      requires2fa,
      client_id,
      vessel_ids
    }).catch(err => {
      console.log(err)
      return onError(res, err, 'Error creating user')
    }).then((password_setup_token) => {
      logger.info(`Created new user with random token ${password_setup_token}`)
      res.send({ data: 'Vessel succesfully added!' });
      // send email
    })
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
  const values = [user_id, 'vessel', {}, {}, {}];
  return admin_server_pool.query(text, [values])
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
