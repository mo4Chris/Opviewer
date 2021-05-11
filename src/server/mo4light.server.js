const ax = require('axios');
const fs = require('fs');

require('dotenv').config({ path: __dirname + '/../../.env' });
// It turns out we only need to import the dotenv file for any calls to process.env in the initialization code,
// as appearantly these variables are available inside the the module.exports callback.

// const baseUrl = 'http://localhost:5000';
let baseUrl = process.env.AZURE_URL ?? 'http://mo4-hydro-api.azurewebsites.net';
let backupUrl = process.env.AZURE_BACKUP_URL ?? 'https://mo4-light.azurewebsites.net';
const bearer  = process.env.AZURE_TOKEN;
const timeout = +process.env.TIMEOUT || 60000;
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

/**
 * Server file with all the secure endpoints to the azure hydro API
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {(subject: string, body: string, recipient: string) => void} mailTo
 * @api public
 */
module.exports = function(app, logger, mailTo) {
  if (bearer == null) {
    logger.fatal('Azure connection token not found!')
    process.exit(1)
  }
  logger.info(`Connecting to hydro database at ${baseUrl}`)
  pg_get('').then((data, err) => {
    if (err) return useBackupUrl(err);
    logger.info(`Successfully connected to hydro API at ${baseUrl}`)
  }).catch(useBackupUrl)

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

  app.get('/api/mo4light/getVesselList', (req, res) => {
    const token = req['token'];
    const start = Date.now()
    const client_id = 2;
    log('Starting azure vessel request')
    pg_get('/vessels', {client_id}).then(async (out, err) => {
      log(`Receiving azure vessel list after ${Date.now() - start}ms`)
      if (err) return onError(res, err, err);
      const datas = out.data['vessels'].filter(d => checkVesselPermission(token, d));;
      const data_out = datas.map(data => {
        return {
          id: data.id,
          nicename: data.display_name,
          type: data.type,
          length: data.length,
          width: data.width,
          draft: data.draft,
          gm: data.gm,
          client_id: data.client_id
        }
      });
      // ToDo: filter data by token rights
      res.send(data_out)
    }).catch(err => {
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getProjectList', (req, res) => {
    const token = req['token'];
    const start = Date.now()
    log('Start azure project list request')
    pg_get('/projects').then(async (out, err) => {
      log(`Receiving azure project list after ${Date.now() - start}ms`)
      if (err) return onError(res, err, err);
      const data = out.data['projects'].filter(d => checkProjectPermission(token, d));
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
          vessel_id: d.vessel_id
        }
      })
      // ToDo: filter data by token rights
      res.send(project_output)
    }).catch(err => {
      res.onError(err)
    })
  });

  app.post('/api/mo4light/getProject', (req, res) => {
    const token = req['token'];
    const project_name = req.body.project_name;
    if (typeof(project_name) != 'string') return res.onBadRequest('project_name missing')
    const start = Date.now()
    log('Start azure project list request')
    pg_get('/project/' + project_name).then(async (out, err) => {
      log(`Receiving azure project list after ${Date.now() - start}ms`)
      if (err) return onError(res, err, err);
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
        activation_end_date: project.activation_start_date,
        client_preferences: project.client_preferences,
        vessel_id: project.vessel_id
      }]
      res.send(project_output)
    }).catch(err => {
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getClients', (req, res) => {
    // TODO this endpoint might need to be removed / changed
    const start = Date.now()
    const token = req['token'];
    log('Start azure client request')
    pg_get('/clientlist').then((out, err) => {
      log(`Receiving azure clients response after ${Date.now() - start}ms`)
      if (err) return onError(res, err, err);
      const data = out.data['clients'];
      // ToDo: filter data by token rights
      res.send(data)
    }).catch(err => {
      console.log(err)
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getResponseForProject/:project_id', (req, res) => {
    const project_id = req.params.project_id;
    const token = req['token'];
    const start = Date.now()
    log('Start azure response request')
    pg_get('/response/' + project_id).then((out, err) => {
      log(`Receiving azure motion response after ${Date.now() - start}ms`)
      if (err) return onError(res, err, err);
      const data = out.data;
      res.send(data)
    }).catch(err => {
      console.log('err', err.data)
      onError(res, err, `Failed to get response for project with id ${project_id}`)
    })
  })

  app.get('/api/mo4light/getProjectsForClient/:client_id', (req, res) => {
    const token = req['token'];
    if (!token.permission.admin) return res.onUnauthorized('Admin only')
    const client_id = req.params.client_id;
    pg_get('/clients/' + client_id).then((out, err) => {
      if (err) return onError(res, err, err);
      const data = out.data['projects']; // Already admin only
      res.send(data)
    }).catch(err => {
      onError(res, err, err)
    })
  });

  app.get('/api/forecastProjectLocations', async (req, res) => {
    const token = req['token'];
    pg_get('/projects').then(async (out, err) => {
      if (err) return onError(res, err, err);
      const data = out.data['projects'].filter(d => checkProjectPermission(token, d));
      const project_output = data.map(d => {
        return {
          name: d.name,
          lon: d.longitude,
          lat: d.latitude
        }
      })
      // ToDo: filter data by token rights
      res.send(project_output)
    })
  })

  app.put('/api/mo4light/projectSettings', async (req, res) => {
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
    // TODO: verify project belongs to client
    localLogger.info('Getting project')
    const html_response = await pg_get('/project/' + project_name);
    const updated_project = html_response.data;

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
    if (is_admin) {
      update_if_not_null('name')
      update_if_not_null('activation_start_date')
      update_if_not_null('activation_end_date')
    }
    localLogger.debug('Double encrypting client preference')
    updated_project['client_preferences'] = JSON.stringify(updated_project['client_preferences'])

    localLogger.debug('Forwarding request to hydro API')
    pg_put('/project/' + project_name, updated_project).then((out, err) => {
      if (err) return res.onError(err, 'Failed to store project settings');
      localLogger.info('Save succesfull')
      return res.send({data: 'Successfully saved project!'})
    }).catch(res.onError)
  })

  app.post('/api/mo4light/weather', (req, res) => {
    const project_id = req.params.project_id;
    const token = req['token'];
    return onError(res, null, 'Endpoint still needs to be implemented')
  })

  app.get('/api/mo4light/ctvForecast', async (req, res) => {
    const token = req['token'];
    const forecast = loadLocalJson('src/server/spectrum.json')
    res.send(forecast)
  })


  function checkProjectPermission(userToken, project) {
    const perm = userToken?.permission
    if (perm.admin) return true;
    return perm?.forecast.read
      && project.client_id == userToken.client_id
  }
  function checkVesselPermission(userToken, vessel) {
    const perm = userToken?.permission
    if (perm.admin) return true;
    return perm?.forecast.read
      && vessel.client_id == userToken.client_id
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
    // console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    // // console.log(http)
    // console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
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
};


function loadLocalJson(filename = 'src/server/spectrum.json') {
  const rawdata = fs.readFileSync(filename)
  const str = rawdata.toString()
  return JSON.parse(str)
}

