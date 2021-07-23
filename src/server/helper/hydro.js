var { logger } = require('./logging')
const { admin, hydro } = require('./connections')
const moment = require('moment-timezone');
const env = require('./env');
const fs = require('fs')
const TokenModel = require('../models/token.d')


// #################### Default values ####################
const DEFAULT_WEATHER_PROVIDER_NAME   = env.DEFAULT_WEATHER_PROVIDER_NAME;
const DEFAULT_FORECAST_CLIENT_NAME    = env.DEMO_CLIENT_NAME;

module.exports = {
  DEFAULT_WEATHER_PROVIDER_NAME,
  DEFAULT_FORECAST_CLIENT_NAME: DEFAULT_FORECAST_CLIENT_NAME
};


/**
 * Loads in weather provider information corresponding to a provider id
 *
 * @param {number} provider_id Id of the provider
 * @api public
 * @returns {Promise<{id: number, name: string, display_name: string}>}
 */
async function getWeatherProvider(provider_id) {
  logger.debug({provider_id}, 'Loading weather provided')
  const out = await hydro.GET('/metocean_providers')
  const providers = out.data['metocean_providers'];
  return providers.find(provider => provider?.id == provider_id) ?? null
}
module.exports.getWeatherProvider = getWeatherProvider;


/**
 * Return the project belonging to a demo user
 * @param {TokenModel} token User token
 * @returns {Promise<any[]>} Project list
 */
async function getDemoProject(token) {
  logger.debug('Getting demo project')
  const query = `SELECT "demo_project_id" FROM "userTable" WHERE "user_id"=$1`
  const user = await admin.query(query, [token.userID])
  if (user.rowCount == 0) throw new Error('User not found')
  const demo_project_id = user.rows[0].demo_project_id;
  if (demo_project_id == null) throw new Error('Invalid project id');

  logger.info(`Getting demo project with id ${demo_project_id}`)
  // TODO: this is overkill. We can be much more conservative here
  const out = await hydro.GET('/projects')
  if (!Array.isArray(out.data['projects'])) throw new Error('Received invalid projects list')

  logger.trace('Successfully loaded projects')
  const data = out.data['projects'].filter(_project => {
    return checkProjectPermission(token, _project)
  });

  const project_output = data.map(_project => {
    return {
      id: _project.id,
      name: _project.name,
      nicename: _project.display_name,
      client_id: _project.client_id,
      longitude: _project.longitude,
      latitude: _project.latitude,
      water_depth: _project.water_depth,
      maximum_duration: _project.maximum_duration,
      activation_start_date: _project.activation_start_date,
      activation_end_date: _project.activation_end_date,
      client_preferences: _project.client_preferences,
      metocean_provider: _project.metocean_provider,
      analysis_types: _project.analysis_types,
      vessel_id: _project.vessel_id
    }
  })
  return project_output;
}
module.exports.getDemoProject = getDemoProject;


/**
 * @param {TokenModel} token User token
 * @returns {Promise<any[]>} Project list
 */
async function getProjectList(token) {
  logger.debug('Getting project list')
  if (token.permission.demo) {
    logger.info('Demo user -> getting demo project')
    const project_output = await module.exports.getDemoProject(token);
    logger.trace('Sending demo project')
    return project_output;
  }

  logger.debug('User is not demo')
  // TODO use active project list instead
  const endpoint = token.permission.admin ? '/projects': `/projects/${token.client_id}`
  logger.debug(`Using endpoint ${endpoint}`)
  const out = await hydro.GET(endpoint);
  const data = out.data['projects'].filter(d => checkProjectPermission(token, d));
  const project_output = []

  const curr = moment.now()
  for (let pidx in data) {
    const _project = data[pidx];
    const _activation_end_num = moment(_project.activation_end_date).valueOf();
    project_output.push({
      id: _project.id,
      active: _activation_end_num > curr,
      name: _project.name,
      nicename: _project.display_name,
      client_id: _project.client_id,
      longitude: _project.longitude,
      latitude: _project.latitude,
      water_depth: _project.water_depth,
      vessel_id: _project.vessel_id,
      maximum_duration: _project.maximum_duration,
      activation_start_date: _project.activation_start_date,
      activation_end_date: _project.activation_end_date,
      client_preferences: _project.client_preferences,
      analysis_types: _project.analysis_types,
      metocean_provider: _project.metocean_provider,
    })
  }
  return project_output;
}
module.exports.getProjectList = getProjectList;


/**
 * Tests for project access permission
 *
 * @param {TokenModel} userToken User token
 * @param {any} project Forecast project
 * @api public
 * @returns {Boolean}
 */
function checkProjectPermission(userToken, project) {
  const perm = userToken?.permission;
  if (perm.admin) return true;
  if (perm.demo && project.id == userToken.demo_project_id) return true;
  if (!perm.forecast.read) return false;
  if (project.name == env.SHARED_DEMO_PROJECT_NAME) return true;
  return project.client_id == userToken.client_id;
}
module.exports.checkProjectPermission = checkProjectPermission;


/**
 * Tests for vessel access permission
 *
 * @param {TokenModel} userToken User token
 * @param {any} vessel Forecast vessel
 * @api public
 * @returns {Boolean}
 */
function checkForecastVesselPermission(userToken, vessel) {
  const perm = userToken?.permission
  if (perm.admin) return true;
  if (!perm?.forecast?.read) return false;
  const client_match = vessel.client_id == userToken.client_id;
  const generic_match = vessel.client_id == env.GENERIC_VESSEL_CLIENT_ID;
  return client_match || generic_match;
}
module.exports.checkForecastVesselPermission = checkForecastVesselPermission;


async function createProject(client_id = -1, metocean_provider_id = -1) {
  if (client_id < 1) client_id = await module.exports.getDefaultForecastClientId();
  if (metocean_provider_id < 1) metocean_provider_id = await module.exports.getDefaultMetoceanProviderId();
  logger.info(`Creating new project with client id = ${client_id}`)
  const currentTime = Date.now()
  const currentDate = new Date(currentTime);
  const activation_start_date = toIso8601(currentDate);
  const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
  const activation_end_date = toIso8601(nextMonth);
  const project_name = `demo_${currentTime}`
  const project_preferences = getDefaultProjectPreferences();
  const project_insert = {
    "name": project_name,
    "display_name": "Demo project",
    "consumer_id": 2,
    "client_id": client_id,
    "vessel_id": 1,
    "activation_start_date": activation_start_date,
    "activation_end_date": activation_end_date,
    "maximum_duration": 60,
    "latitude": 52,
    "longitude": 3,
    "water_depth": 20,
    "client_preferences": project_preferences,
    "analysis_types": ["Standard"],
    "metocean_provider_id": metocean_provider_id,
  }
  const project = await hydro.POST('/project/' + project_name, project_insert).catch(err => {
    logger.error(err?.response?.data?.message ?? `Unspecified error: status code ${err?.response?.status}`)
    throw err
  });
  if (project?.status != 201) {
    logger.error(project.data)
    throw new Error('Issue creating new project')
  }
  logger.info('Created project with id ' + project?.data?.id)
  return project.data.id;
}
module.exports.createProject = createProject;

async function getDefaultForecastClientId() {
  logger.debug('Getting default forecast client ID')
  const query = `SELECT "forecast_client_id" FROM "clientTable" WHERE "client_name"=$1`
  const values = [DEFAULT_FORECAST_CLIENT_NAME];
  const out = await admin.query(query, values);
  const default_client_id = out.rows[0]?.forecast_client_id;
  if (default_client_id == null) throw new Error('Failed to find default forecast client id')
  return default_client_id;
}
module.exports.getDefaultForecastClientId = getDefaultForecastClientId;


async function getDefaultMetoceanProviderId() {
  logger.debug('Getting default metocean provider ID')
  const out = await hydro.GET('/metocean_providers');
  const providers = out.data.metocean_providers;
  const demo_provider = providers.find(p => p?.name == DEFAULT_WEATHER_PROVIDER_NAME) ?? providers[0];
  return demo_provider.id;
}
module.exports.getDefaultMetoceanProviderId = getDefaultMetoceanProviderId;


function getDefaultProjectPreferences() {
  const raw_json = fs.readFileSync(__dirname + '/../templates/project_preferences.json').toString();
  return JSON.parse(raw_json);
}
module.exports.getDefaultProjectPreferences = getDefaultProjectPreferences;


/**
 * Casts Date to the iso8601 format
 * @param {Date} d Date object
 * @returns
 */
function toIso8601(d) {
  return d.toISOString().slice(0, 23) + '+00:00';
}
module.exports.toIso8601 = toIso8601;
