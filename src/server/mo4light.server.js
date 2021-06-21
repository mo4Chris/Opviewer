const ax = require('axios');
const fs = require('fs');
const forecastModel = require('./models/forecast')
var { Pool } = require('pg');
const { validationResult, param } = require('express-validator');

require('dotenv').config({ path: __dirname + '/../../.env' });
// It turns out we only need to import the dotenv file for any calls to process.env in the initialization code,
// as appearantly these variables are available inside the the module.exports callback.

// const baseUrl = 'http://localhost:5000';
let baseUrl = process.env.AZURE_URL ?? 'http://mo4-hydro-api.azurewebsites.net';
let backupUrl = process.env.AZURE_BACKUP_URL ?? 'https://mo4-light.azurewebsites.net';
const bearer  = process.env.AZURE_TOKEN;
const timeout = +process.env.TIMEOUT || 30000;
const http    = ax.default;
const headers = {
  "content-type": "application/json",
  'Authorization': `Bearer ${bearer}`
}

function log(message) {
  const today = new Date()
  const ts = today.toString().slice(16,24) + '.' + today.getMilliseconds();
  console.log(`${ts}: ${message}`)
}

// ################### Constants #######################
const SHARED_DEMO_PROJECT_NAME = 'Sample_Project'




// ################### API endpoints ###################
/**
 * Server file with all the secure endpoints to the azure hydro API
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {Pool} admin_server_pool
 * @api public
 */
module.exports = function(app, logger, admin_server_pool) {
  if (bearer == null) {
    logger.fatal('Azure connection token not found!')
    process.exit(1)
  }
  logger.info(`Connecting to hydro database at ${baseUrl}`)
  pg_get('').then((data, err) => {
    if (err) return useBackupUrl(err);
    logger.info(`Successfully connected to hydro API at ${baseUrl}`)
  }).catch(useBackupUrl)

  app.get('/api/mo4light/getVesselList', (req, res) => {
    const token = req['token'];
    const start = Date.now()
    const client_id = 2; // TODO - not sure if this is already fixed
    log('Starting azure vessel request')
    pg_get('/vessels', {client_id}).then(async (out, err) => {
      log(`Receiving azure vessel list after ${Date.now() - start}ms`)
      if (err) return res.onError(err, err);
      const datas = out.data['vessels'].filter(d => checkVesselPermission(token, d));;
      const data_out = datas.map(data => {
        return {
          id: data.id,
          nicename: data.display_name,
          analysis_types: data.analysis_types,
          type: data.type,
          length: data.length,
          width: data.width,
          draft: data.draft,
          gm: data.gm,
          client_id: data.client_id
        }
      });
      res.send(data_out)
    }).catch(res.onError)
  });

  app.get('/api/mo4light/getProjectList', forecastModel.checkForecastRead, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors)

    const token = req['token'];
    getProjectList(token).then(async projects => {
      logger.trace(`Query returned ${projects?.lenght ?? 0} projects`)
      res.send(projects)
    }).catch(res.onError)
  });

  app.post('/api/mo4light/getProject', (req, res) => {
    const token = req['token'];
    const project_name = req.body.project_name;

    if (typeof(project_name) != 'string') return res.onBadRequest('project_name missing')
    const start = Date.now()
    if (token.permission.demo) {
      return getDemoProject(token).then(async (projects) => {
        const project = projects.find(p => p.name == project_name);
        if (project == null) return res.onUnauthorized()
        logger.info(project)
        res.send([project])
      }).catch(res.onError)
    }

    log('Start azure project list request')
    pg_get('/project/' + project_name).then(async (out, err) => {
      log(`Receiving azure project list after ${Date.now() - start}ms`)
      if (err) return res.onError(err, err);
      const project = out.data;
      if (!checkProjectPermission(token, project)) return res.onUnauthorized()
      const project_output = [{
        id: project.id,
        name: project.name,
        nicename: project.display_name,
        client_id: project.client_id,
        longitude: project.longitude,
        latitude: project.latitude,
        water_depth: project.water_depth,
        maximum_duration: project.maximum_duration,
        activation_start_date: project.activation_start_date,
        activation_end_date: project.activation_end_date,
        client_preferences: project.client_preferences,
        analysis_types: project.analysis_types,
        vessel_id: project.vessel_id,
        metocean_provider: project.metocean_provider,
      }]
      res.send(project_output)
    }).catch(res.onError)
  });

  app.get('/api/mo4light/getClients', (req, res) => {
    // TODO this endpoint might need to be removed / changed
    const start = Date.now()
    const token = req['token'];
    if (!token.permission.admin) return res.onUnauthorized()
    log('Start azure client request')
    pg_get('/clientlist').then((out, err) => {
      log(`Receiving azure clients response after ${Date.now() - start}ms`)
      if (err) return res.onError(err, err);
      const data = out.data['clients'];
      res.send(data)
    }).catch(res.onError)
  });

  app.get('/api/mo4light/getResponseForProject/:project_id',
    forecastModel.checkForecastRead,
    param('project_id').isInt(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.onBadRequest(errors)

      const project_id = req.params.project_id;
      const token = req['token'];
      const start = Date.now()
      log('Start azure response request')

      const is_admin = token.permission?.admin;
      if (!is_admin) {
        const projects = await getProjectList(token);
        const has_permission = projects.some(p => p.id == project_id)
        if (!has_permission) return res.onUnauthorized()
      }

      // At this point we are confident the client is authorized to access the resource
      pg_get('/response/' + project_id).then((out, err) => {
        log(`Receiving azure motion response after ${Date.now() - start}ms`)
        if (err) return res.onError(err, err);
        const data = out.data;
        res.send(data)
      }).catch(err => {
        if (err.response.status == 404) return res.status(404).send('Response not found')
        res.onError(err, `Failed to get response for project with id ${project_id}`)
      })
  })

  app.get('/api/mo4light/getProjectsForClient/:client_name', (req, res) => {
    res.onBadRequest('Endpoint not yet implemented')
    // const token = req['token'];
    // if (!token.permission.admin) return res.onUnauthorized('Admin only')
    // const client_id = req.params.client_id;
    // pg_get('/client/' + client_id).then((out, err) => {
    //   if (err) return res.onError(err, err);
    //   const data = out.data['projects']; // Already admin only
    //   res.send(data)
    // }).catch(err => {
    //   res.onError(err)
    // })
  });

  app.get('/api/forecastProjectLocations', async (req, res) => {
    const token = req['token'];
    getProjectList(token).then(data => {
      const project_output = data.map(d => {
        return {
          nicename: d.nicename,
          lon: d.longitude,
          lat: d.latitude
        }
      })
      res.send(project_output)
    }).catch(res.onError)
  })

  app.put('/api/mo4light/projectSettings', forecastModel.checkForecastRead, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.onBadRequest(errors)

    const project_name = req.body.project_name;
    const received_settings = req.body.project_settings;
    const localLogger = logger.child({
      project_name
    })
    localLogger.info('Incoming project save request')
    if (typeof(received_settings) != 'object') return res.onBadRequest('Invalid settings')
    if (typeof(project_name) != 'string') return res.onBadRequest('project_name must be string')

    const token = req['token'];
    const is_admin = token.permission.admin;

    if (project_name == SHARED_DEMO_PROJECT_NAME && !is_admin) return res.onUnauthorized('Only admin can make changes sample project')

    localLogger.info('Getting project')
    const html_response = await pg_get('/project/' + project_name);
    localLogger.debug('Received HTML response')
    const updated_project = html_response.data;
    if (!checkProjectPermission(token, updated_project)) return res.onUnauthorized()

    localLogger.info('Done getting project - performing update')
    const update_if_not_null = (fld) => {
      if (received_settings[fld] != null) {
        logger.debug(`Setting ${fld} to ${received_settings[fld]}`)
        updated_project[fld] = received_settings[fld];
      }
    }
    update_if_not_null('display_name')
    update_if_not_null('latitude')
    update_if_not_null('longitude')
    update_if_not_null('water_depth')
    update_if_not_null('vessel_id')
    update_if_not_null('client_preferences')
    update_if_not_null('analysis_types')
    if (is_admin) {
      update_if_not_null('name')
      update_if_not_null('activation_start_date')
      update_if_not_null('activation_end_date')
    }
    localLogger.debug('Double encrypting client preference')
    updated_project['client_preferences'] = JSON.stringify(updated_project['client_preferences'])
    updated_project['metocean_provider_id'] = received_settings?.metocean_provider?.id ?? updated_project?.metocean_provider?.id;
    updated_project['metocean_provider'] = null;

    localLogger.debug('Forwarding request to hydro API')
    pg_put('/project/' + project_name, updated_project).then((out, err) => {
      if (err) return res.onError(err, 'Failed to store project settings');
      localLogger.info('Save succesfull')
      return res.send({data: 'Successfully saved project!'})
    }).catch(res.onError)
  })

  app.get('/api/mo4light/metoceanProviders', (req, res) => {
    const permission = req['token'].permission;
    if (!permission.forecast.read) return res['onUnauthorized']()
    pg_get('/metocean_providers').then(out => {
      const providers = out.data.metocean_providers;
      res.send(providers)
    })
  })

  app.post('/api/mo4light/weather', (req, res) => {
    const project_id = req.params.project_id;
    const token = req['token'];
    return res.onError(null, 'Endpoint still needs to be implemented')
  })

  /**
   * @param {object} token
   * @returns object[]
   */
  async function getProjectList(token) {
    const start = Date.now()
    log('Start azure project list request')

    if (token.permission.demo) {
      const project_output = await getDemoProject(token);
      log(`Receiving azure demo project after ${Date.now() - start}ms`)
      logger.trace('Sending demo project')
      return project_output;
    }

    const endpoint = token.permission.admin ? '/projects': `/projects/${token.client_id}`
    const out = await pg_get(endpoint)
    log(`Receiving azure project list after ${Date.now() - start}ms`)
    const data = out.data['projects'].filter(d => checkProjectPermission(token, d));
    const project_output = []

    for (let pidx in data) {
      const _project = data[pidx];
      project_output.push({
        id: _project.id,
        name: _project.name,
        nicename: _project.display_name,
        client_id: _project.client_id,
        longitude: _project.longitude,
        latitude: _project.latitude,
        water_depth: _project.water_depth,
        vessel_id: _project.vessel_id,
        maximum_duration: _project.maximum_duration,
        activation_start_date: _project.activation_start_date,
        activation_end_date: _project.activation_start_date,
        client_preferences: _project.client_preferences,
        analysis_types: _project.analysis_types,
        metocean_provider: _project.metocean_provider,
      })
    }
    return project_output;
  }

  function checkProjectPermission(userToken, project) {
    logger.debug('Checking user permissions')
    const perm = userToken?.permission
    if (perm.admin) return true;
    if (perm.demo && project.id == userToken.demo_project_id) return true;
    return perm?.forecast.read
      && project.client_id == userToken.client_id
  }
  function checkVesselPermission(userToken, vessel) {
    const GENERIC_VESSEL_CLIENT_ID = 1;

    const perm = userToken?.permission
    if (perm.admin) return true;
    const client_match = vessel.client_id == userToken.client_id;
    const generic_match = vessel.client_id == GENERIC_VESSEL_CLIENT_ID;
    return perm?.forecast.read && (client_match || generic_match)
  }


  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_get(endpoint, data) {
    logger.debug('Performing GET request:' + endpoint)
    const url = baseUrl + endpoint;
    if (!data) return http.get(url, {headers});
    return http.get(url, {data, headers, timeout});
  }
  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_post(endpoint, data) {
    logger.debug('Performing POST request:' + endpoint)
    const url = baseUrl + endpoint;
    return http.post(url, data, {headers, timeout})
  }
  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_put(endpoint, data) {
    logger.debug('Performing PUT request:' + endpoint)
    const url = baseUrl + endpoint;
    return http.put(url, data, {headers, timeout})
  }
  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {Error} err Error triggering the use of the backup url
   * @api public
   */
  function useBackupUrl(err) {
    logger.warn(err, 'Failed to connect to hydro API - using backup')
    baseUrl = backupUrl;
    pg_get('').then((data, err) => {
      if (err) return logger.fatal('Failed to connect to backup API')
      logger.info(`Successfully connected to backup API at ${baseUrl}`)
    }).catch(err => logger.fatal('Failed to connect to backup API'))
  }

  async function getDemoProject(token) {
    const GENERIC_PROJECT_ID = 5;

    logger.debug('Getting demo project')
    const query = `SELECT "demo_project_id" FROM "userTable" WHERE "user_id"=$1`
    const user = await admin_server_pool.query(query, [token.userID])
    if (user.rowCount == 0) throw new Error('User not found')
    const demo_project_id = user.rows[0].demo_project_id;
    if (demo_project_id == null) throw new Error('Invalid project id');

    logger.info(`Getting demo project with id ${demo_project_id}`)
    const out = await pg_get('/projects')
    if (!Array.isArray(out.data['projects'])) throw new Error('Received invalid projects list')

    logger.trace('Successfully loaded projects')
    const data = out.data['projects'].filter(d => {
      return d.id == demo_project_id || d.id == GENERIC_PROJECT_ID
    });
    const project_output = data.map(d => {
      return {
        id: d.id,
        name: d.name,
        nicename: d.display_name,
        client_id: d.client_id,
        longitude: d.longitude,
        latitude: d.latitude,
        water_depth: d.water_depth,
        maximum_duration: d.maximum_duration,
        activation_start_date: d.activation_start_date,
        activation_end_date: d.activation_start_date,
        client_preferences: d.client_preferences,
        metocean_provider: d.metocean_provider,
        analysis_types: d.analysis_types,
        vessel_id: d.vessel_id
      }
    })
    return project_output;
  }

  /**
   * Loads in weather provider information corresponding to a provider id
   *
   * @param {number} provider_id Id of the provider
   * @api public
   * @returns {Promise<{id: number, name: string, display_name: string}>}
   */
  async function getWeatherProvider(provider_id) {
    logger.debug({provider_id}, 'Loading weather provided')
    const out = await pg_get('/metocean_providers')
    const providers = out.data['metocean_providers'];
    return providers.find(provider => provider.id == provider_id)
  }
};


function loadLocalJson(filename = 'src/server/spectrum.json') {
  const rawdata = fs.readFileSync(filename)
  const str = rawdata.toString()
  return JSON.parse(str)
}

