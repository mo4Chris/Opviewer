var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
var env = require('./env')
var connections = require('./connections')
var {logger} = require('./logging');
const { toIso8601 } = require("./hydro");
const TokenModel = require('../models/token.d')

module.exports = {};

// ##################################
/**
 * @type {{
 *  vessel_id: number,
 *  mmsi: number,
 *  nicename: string,
 *  active: boolean,
 *  operationsClass: string,
 *  client_ids: number[]
 *  client: string[];
 * }}
 */
let VesselListInstance;


/**
 * Return list of vessel for user
 * @param { TokenModel | {userID: number, client_id: number, permission: any} } token
 * @returns {Promise<VesselListInstance[]>}
 */
async function getVesselsForUser (token) {
  logger.trace(`Getting vessels for user with ID ${token.userID}`)
  if (token?.permission == null) throw new Error('Invalid token');
  if (token.permission.admin) return await module.exports.getVesselsForAdmin(token);
  if (token.permission.user_see_all_vessels_client) return await module.exports.getAllVesselsForClient(token);
  return await module.exports.getAssignedVessels(token.userID);
}
module.exports.getVesselsForUser = getVesselsForUser;


/**
 * Return list of vessel for admin
 * @param { TokenModel | {userID: number, client_id: number, permission: any} } token
 * @returns {Promise<VesselListInstance[]>}
 */
async function getVesselsForAdmin(token) {
  if (!token?.permission?.admin) throw new Error('Unauthorized user, Admin only');

  let vessels = [];
  let PgQuery = `
  SELECT
    "vesselTable"."mmsi",
    "vesselTable".nicename,
    "vesselTable"."client_ids",
    "vesselTable"."active",
    "vesselTable"."operations_class",
    "vesselTable"."vessel_id"
  FROM "vesselTable"`;

  vessels = await connections.admin.query(PgQuery).then(sql_response => {
    const response =  sql_response.rows.map(row => {
      return {
        mmsi: row.mmsi,
        nicename: row.nicename,
        client_ids: row.client_ids,
        active: row.active,
        operationsClass: row.operations_class,
        vessel_id: row.vessel_id,
        client: []
      }
    });
    return response;
  });

  const PgQueryClients = `SELECT
    u."mmsi",
    array_agg(c."client_name")
    from (
      select "vesselTable"."mmsi" mmsi, unnest("vesselTable"."client_ids") id
      from "vesselTable"
    ) u
    join "clientTable" c on c."client_id" = u.id
    group by 1`

  return await connections.admin.query(PgQueryClients).then(sql_client_response => {
    let vesselList = [];
    vessels.forEach(vessel => {
      const clientsArray = sql_client_response.rows.find(element => element?.mmsi == vessel.mmsi);
      vesselList.push({
        mmsi: vessel.mmsi,
        nicename: vessel.nicename,
        client_ids: vessel.client_ids,
        active: vessel.active,
        operationsClass: vessel.operationsClass,
        vessel_id: vessel.vessel_id,
        client: clientsArray?.array_agg ?? [],
      });
    });
    return vesselList;
  });
}
module.exports.getVesselsForAdmin = getVesselsForAdmin;


/**
 * Return list of vessels for client
 * @param { TokenModel | {userID: number, client_id: number, permission: any} } token
 * @returns {Promise<VesselListInstance[]>}
 */
async function getAllVesselsForClient(token) {
  if (!token.permission.user_see_all_vessels_client)  throw new Error('Unauthorized user, not allowed to see all vessels');

  let PgQuery = `
  SELECT
    "vesselTable"."vessel_id",
    "vesselTable"."mmsi",
    "vesselTable"."nicename",
    "vesselTable"."client_ids",
    "vesselTable"."active",
    "vesselTable"."operations_class"
  FROM "vesselTable"
  WHERE $1=ANY("vesselTable"."client_ids")`;

  const values = [token.client_id];

  return connections.admin.query(PgQuery, values).then(sql_response => {
    return sql_response.rows.map(row => {
      return {
        mmsi: row.mmsi,
        nicename: row.nicename,
        client_ids: row.client_ids,
        active: row.active,
        operationsClass: row.operations_class,
        vessel_id: row.vessel_id,
        client: []
      }
    });
  });
}
module.exports.getAllVesselsForClient = getAllVesselsForClient;


/**
 * Return list of vessel for user
 * @param { number } user_id
 * @returns {Promise<VesselListInstance[]>}
 */
async function getAssignedVessels(user_id) {
  logger.debug('Getting assigned vessels')
  let PgQuery = `
  SELECT
  "vesselTable"."vessel_id",
  "vesselTable"."mmsi",
  "vesselTable".nicename,
  "vesselTable"."client_ids",
  "vesselTable"."active",
  "vesselTable"."operations_class"
    FROM "vesselTable"
    INNER JOIN "userTable"
    ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")
    WHERE "userTable"."user_id"=$1`;
  const values = [user_id]
  const sql_response = await connections.admin.query(PgQuery, values);
  return sql_response.rows.map(row => {
    return {
      mmsi: row.mmsi,
      nicename: row.nicename,
      client_ids: row.client_ids,
      active: row.active,
      operationsClass: row.operations_class,
      vessel_id: row.vessel_id,
      client: []
    }
  });
}
module.exports.getAssignedVessels = getAssignedVessels;


/**
 * Return list of vessels for client
 * @param { TokenModel | {userID: number, client_id: number, permission: any} } token
 * @param { string } username
 * @returns {Promise<VesselListInstance[]>}
 */
async function getAllVesselsForClientByUsername(token, username) {
  const permission = token?.permission;
  const has_permission = permission?.admin || permission?.user_see_all_vessels_client;
  if (!has_permission) throw new Error('Unauthorized user, not allowed to see all vessels');

  let clientID = token.client_id;
  if (permission.admin) {
    let PgQueryClientID = `
      SELECT "client_id"
      FROM "userTable"
      WHERE "username"= $1
    `;
    const clientIDValues = [username];
    clientID = await connections.admin.query(PgQueryClientID, clientIDValues).then(sql_response => {
      if (sql_response.rowCount < 1) throw new Error('Client id not found!')
      return sql_response.rows[0].client_id;
    });
  }

  let PgQuery = `
  SELECT
    "vesselTable"."mmsi",
    "vesselTable".nicename,
    "vesselTable"."vessel_id",
    "vesselTable"."active",
    "vesselTable"."operations_class"
  FROM "vesselTable"
  WHERE $1=ANY("vesselTable"."client_ids")`;
  const values = [clientID];
  return connections.admin.query(PgQuery, values).then(sql_response => {
    return sql_response.rows.map(v => {
      return {
        mmsi: v.mmsi,
        nicename: v.nicename,
        vessel_id: v.vessel_id,
        active: v.active,
        operationsClass: v.operations_class,
        client_ids: [clientID],
        client: []
      }
    });
  });
}
module.exports.getAllVesselsForClientByUsername = getAllVesselsForClientByUsername;


/**
 *
 * @param {{
 * username: string,
 * user_type: string,
 * requires2fa: boolean,
 * vessel_ids: number[],
 * client_id: number
 * }} param0
 * @returns
 */
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
  const password_setup_token = module.exports.generateRandomToken();
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
  module.exports.initUserPermission(user_id, user_type);
  logger.debug('Init user settings')
  module.exports.initUserSettings(user_id);
  return password_setup_token;
}
module.exports.createUser = createUser;


/**
 * Creates a new demo user
 * @param {{
 * username: string,
 * requires2fa?: boolean,
 * client_id: number,
 * vessel_ids: number[],
 * user_type: string,
 * password: string,
 * demo_project_id: number
 * }} param0
 * @returns
 */
async function createDemoUser({
  username = '',
  requires2fa = false,
  client_id = null,
  vessel_ids = [],
  user_type = 'demo',
  password = null,
  demo_project_id = null
}) {
  const expireDate = new Date();
  const formattedExpireDate = toIso8601(new Date(expireDate.setMonth(expireDate.getMonth() + 1)))
  if (!(client_id > 0)) { throw Error('Invalid client id!') }
  if (!(username?.length > 0)) { throw Error('Invalid username!') }

  logger.info(`Creating new user ${username}`)
  const password_setup_token = null;
  if (password !== null && password !== '') password = bcrypt.hashSync(password, 10)
  const valid_vessel_ids = Array.isArray(vessel_ids); // && (vessel_ids.length > 0);
  const query = `INSERT INTO public."userTable"(
    username,
    requires2fa,
    secret2fa,
    active,
    vessel_ids,
    password,
    token,
    client_id,
    demo_project_id,
    demo_expiration_date
  ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING "userTable"."user_id"`
  const values = [
    username,
    Boolean(requires2fa) ?? true,
    null,
    true,
    valid_vessel_ids ? vessel_ids : null,
    password,
    password_setup_token,
    client_id,
    demo_project_id,
    formattedExpireDate
  ]

  const sqlresponse = await connections.admin.query(query, values)
  const user_id = sqlresponse.rows[0].user_id;

  logger.info('New user has id ' + user_id)
  logger.debug('Init user permissions')
  module.exports.initUserPermission(user_id, user_type, {demo: true});
  logger.debug('Init user settings')
  module.exports.initUserSettings(user_id);
  return;
}
module.exports.createDemoUser = createDemoUser;


/**
 * Initializes user settings for a new user
 * @param {number} user_id
 * @returns {Promise<void>}
 */
async function initUserSettings(user_id = 0) {
  const localLogger = logger.child({
    user_id,
    function: "initUserSettings"
  })
  const text = `INSERT INTO "userSettingsTable"
  (user_id, timezone, unit, longterm, weather_chart, dpr)
  VALUES($1, $2, $3, $4, $5, $6)`;
  const values = [+user_id, {type: 'vessel'}, {speed: "knots"}, null, null, null];
  return connections.admin.query(text, values).then(() => {
    localLogger.info('Created user settings')
  }).catch((err) => {
    localLogger.error(err.message)
  })
}
module.exports.initUserSettings = initUserSettings;

/**
 * Intializes user permissions
 * @param {number} user_id
 * @param {string} user_type
 * @param {any} opt_permissions
 * @returns {Promise<void>}
 */
async function initUserPermission(user_id = 0, user_type, opt_permissions = {}) {
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
      permissions.forecast.changeLimits = true;
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
  return connections.admin.query(query, values).then(() => {
    localLogger.info('Created user permissions')
  }).catch((err) => {
    localLogger.error(err)
  })
}
module.exports.initUserPermission = initUserPermission;


/**
 * Returns true/false if user has permissions to manage the requested user
 * @param { TokenModel } token
 * @param {string} username
 * @returns {Promise<boolean>}
 */
async function getPermissionToManageUser(token, username='') {
  logger.info({
    msg: 'Verifying user management permission',
    request_by: token.username,
    username: username
  })
  const own_permission = token.permission;
  const own_client_id = token.client_id;
  if (own_permission.admin) return true;
  if (!own_permission.user_manage) return false;
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


/**
 * Loads user permissions
 * @param {number} user_id
 * @returns
 */
function loadUserPermissions(user_id = 0) {
  const query = 'SELECT * FROM "userPermissionTable" WHERE "user_id"=$1'
  const values = [user_id];
  return connections.admin.query(query, values)
}
module.exports.loadUserPermissions = loadUserPermissions;


/**
 * Loads user settings
 * @param {number} user_id
 * @returns
 */
function loadUserSettings(user_id = 0) {
  const query = 'SELECT * FROM "userSettingsTable" WHERE "user_id"=$1';
  const values = [user_id]
  return connections.admin.query(query, values)
}
module.exports.loadUserSettings = loadUserSettings;



/**
 * Returns a random token using bcrypt
 * @returns {string}
 */
function generateRandomToken() {
  let randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
  randomToken = randomToken.replace(/\//gi, '8');
  return randomToken;
}
module.exports.generateRandomToken = generateRandomToken;


/**
 * Return the ID belonging to a user
 * @param {string} username Username
 * @returns {Promise<number>}
 */
async function getIdForUser(username) {
  const userQuery = `SELECT "user_id" FROM userTable where "username"=$1`
  const target_user_response = await connections.admin.query(userQuery, [username])
  if (target_user_response.rowCount < 1) throw new Error('Target user not found!')
  const target_user_id = target_user_response.rows[0].user_id;
  return target_user_id;
}
module.exports.getIdForUser = getIdForUser;


/**
 * Verifies login
 * @param {any} req
 * @param {any} user
 * @param {any} res
 * @returns {boolean}
 */
function validateLogin(req, user, res) {
  const userData = req.body;
  if (!user.active) { res.onUnauthorized('User is not active, please contact your supervisor'); return false }
  if (!user.password || user.password == '') {
    res.onUnauthorized('Account needs to be activated before loggin in, check your email for the link');
    return false;
  }
  if (!bcrypt.compareSync(userData.password, user.password)) {
    res.onUnauthorized('Password is incorrect');
    return false;
  }
  logger.trace(user)
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const isLocalHost = ip == '::1' || ip === '';
  const secret2faValid = (user.secret2fa?.length > 0) && (twoFactor.verifyToken(user.secret2fa, userData.confirm2fa) != null)
  const requires2fa = (user.requires2fa == null) ? true : Boolean(user.requires2fa);
  logger.debug({ "msg": "2fa status", "requires2fa": requires2fa, "2fa_valid": secret2faValid, "isLocalhost": isLocalHost })
  if (!isLocalHost && !secret2faValid && requires2fa) {
    res.onUnauthorized('2fa is incorrect');
    return false
  }
  return true;
}
module.exports.validateLogin = validateLogin;



/**
 * Returns default iid number
 * @returns {Promise<number>};
 */
async function getDefaulClientId() {
  logger.debug('Getting default client ID')
  const query = `SELECT "client_id" FROM "clientTable" WHERE "client_name"=$1`
  const values = [env.DEMO_CLIENT_NAME];
  const out = await connections.admin.query(query, values)
  const default_client_id = out.rows[0]?.client_id;
  if (default_client_id == null) throw new Error('Failed to find default client id')
  return default_client_id;
}
module.exports.getDefaulClientId = getDefaulClientId;
