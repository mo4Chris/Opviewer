var bcrypt = require("bcryptjs");
var pino = require('pino');
var env = require('./env')
var connections = require('./connections')
var {logger} = require('./logging')

module.exports = {};

// ##################################
async function getVesselsForUser(user_id = 0) {
  let PgQuery = `
  SELECT "vesselTable"."vessel_id", "vesselTable"."mmsi", "vesselTable"."nicename"
    FROM "vesselTable"
    INNER JOIN "userTable"
    ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")
    WHERE "userTable"."user_id"=$1 AND "userTable"."active"=true`;
  const values = [user_id]
  const data = await connections.admin.query(PgQuery, values);
  if (data.rowCount > 0) {
    return data.rows;
  } else {
    return null;
  }
};
module.exports.getVesselsForUser = getVesselsForUser;


async function createUser({
  username = '',
  user_type = 'Vessel master',
  requires2fa = true,
  vessel_ids = [],
  client_id = null,
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
    client_id
  ]
  logger.info('Starting database insert')
  const sqlresponse = await connections.admin.query(query, values)
  const user_id = sqlresponse.rows[0].user_id;

  logger.info('New user has id ' + user_id)
  logger.debug('Init user permissions')
  initUserPermission(user_id, user_type);
  logger.debug('Init user settings')
  initUserSettings(user_id);
  return password_setup_token;
}
module.exports.createUser = createUser;


function initUserSettings(user_id = 0) {
  const localLogger = logger.child({
    user_id,
    function: "initUserSettings"
  })
  const text = `INSERT INTO "userSettingsTable"
  (user_id, timezone, unit, longterm, weather_chart, dpr)
  VALUES($1, $2, $3, $4, $5, $6)`;
  const values = [+user_id, {type: 'vessel'}, {speed: "knots"}, null, null, null];
  connections.admin.query(text, values).then(() => {
    localLogger.info('Created user settings')
  }).catch((err) => {
    localLogger.error(err.message)
  })
}
module.exports.initUserSettings = initUserSettings;


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

  // TODO: Init via JSON files
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
      permissions.demo = true
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
  connections.admin.query(query, values).then(() => {
    localLogger.info('Created user permissions')
  }).catch((err) => {
    localLogger.error(err)
  })
}
module.exports.initUserPermission = initUserPermission;


async function getPermissionToManageUser(token, username='') {
  logger.info({
    msg: 'Verifying user management permission',
    request_by: token.username,
    username: username
  })
  const permission = token.permission;
  const own_client_id = token.client_id;
  if (permission.admin) return true;
  if (!permission.user_manage) return false;
  const query = `SELECT client_id
    FROM "userTable"
    WHERE "userTable"."username"=$1 AND "userTable"."active"=true`
  const values = [username];
  const sqlresponse = await connections.admin.query(query, values);
  if (sqlresponse.rowCount < 1) throw new Error('No active user found')
  const target_client_id = sqlresponse.rows[0].client_id;
  return target_client_id == own_client_id;
}
module.exports.getPermissionToManageUser = getPermissionToManageUser;


function loadUserPermissions(user_id = 0) {
  const query = 'SELECT * FROM "userPermissionTable" WHERE "user_id"=$1'
  const values = [user_id];
  return connections.admin.query(query, values)
}
module.exports.loadUserPermissions = loadUserPermissions;


function loadUserSettings(user_id = 0) {
  const query = 'SELECT * FROM "userSettingsTable" WHERE "user_id"=$1';
  const values = [user_id]
  return connections.admin.query(query, values)
}
module.exports.loadUserSettings = loadUserSettings;


function generateRandomToken() {
  let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
  randomToken = randomToken.replace(/\//gi, '8');
  return randomToken;
}
module.exports.generateRandomToken = generateRandomToken;
