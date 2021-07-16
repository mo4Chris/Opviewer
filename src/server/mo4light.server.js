const forecastModel = require('./models/forecast')
var { Pool } = require('pg');
const { validationResult, param } = require('express-validator');
const { hydro } = require('./helper/connections');
const helper = require('./helper/hydro')
const env = require('./helper/env')

require('dotenv').config({ path: __dirname + '/../../.env' });
// It turns out we only need to import the dotenv file for any calls to process.env in the initialization code,
// as appearantly these variables are available inside the the module.exports callback.


function log(message) {
  const today = new Date()
  const ts = today.toString().slice(16,24) + '.' + today.getMilliseconds();
  console.log(`${ts}: ${message}`)
}

// ################### API endpoints ###################
/**
 * Server file with all the secure endpoints to the azure hydro API
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @api public
 */
module.exports = function(app, logger) {
  app.get('/api/mo4light/getVesselList', (req, res) => {
    const token = req['token'];
    const start = Date.now()
    log('Starting azure vessel request')
    pg_get('/vessels').then(async (out, err) => {
      log(`Receiving azure vessel list after ${Date.now() - start}ms`)
      if (err) return res.onError(err, err);
      const datas = out.data['vessels'].filter(d => helper.checkForecastVesselPermission(token, d));;
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
    helper.getProjectList(token).then(async projects => {
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
      return helper.getDemoProject(token).then(async (projects) => {
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
      if (!helper.checkProjectPermission(token, project)) return res.onUnauthorized()
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
        const projects = await helper.getProjectList(token);
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
    logger.debug('Getting project forecast locations')
    const token = req['token'];
    helper.getProjectList(token).then(data => {
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

    if (project_name == env.SHARED_DEMO_PROJECT_NAME && !is_admin) return res.onUnauthorized('Only admin can make changes sample project')

    localLogger.info('Getting project')
    const html_response = await pg_get('/project/' + project_name);
    localLogger.debug('Received HTML response')
    const updated_project = html_response.data;
    if (!helper.checkProjectPermission(token, updated_project)) return res.onUnauthorized()

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
    const project_id = req.params['project_id'];
    const token = req['token'];
    return res.onError(null, 'Endpoint still needs to be implemented')
  })


  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_get(endpoint, data) {
    return hydro.GET(endpoint, data);
  }
  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_post(endpoint, data) {
    return hydro.POST(endpoint, data);
  }
  /**
   * Server file with all the secure endpoints to the azure hydro API
   *
   * @param {string} endpoint Main application
   * @param {any} data
   * @api public
   */
  function pg_put(endpoint, data) {
    // TODO: get rid of this;
    return hydro.PUT(endpoint, data);
  }
}
