var ax = require('axios');
require('dotenv').config({ path: __dirname + '/../../.env' });
// It turns out we only need to import the dotenv file for any calls to process.env in the initialization code,
// as appearantly these variables are available inside the the module.exports callback.

const baseUrl = process.env.AZURE_URL ?? 'http://mo4-hydro-api.azurewebsites.net';
const token   = process.env.AZURE_TOKEN;
const http    = ax.default;
const headers = {
  "content-type": "application/json",
  'Authorization': `Bearer ${token}`
}

function log(message) {
  const today = new Date()
  const ts = today.toString().slice(16,24) + '.' + today.getMilliseconds();
  console.log(`${ts}: ${message}`)
}

module.exports = function(app, logger) {
  if (token == null) {
    logger.fatal('Azure connection token not found!')
    process.exit(1)
  }
  pg_get('').then((data, err) => {
    if (err) return logger.fatal('Failed to connect to hydro API')
    logger.info(`Successfully connected to hydro API at ${baseUrl}`)
  })

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
      const datas = out.data['vessels'];
      const data_out = datas.map(data => {
        return {
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
      const data = out.data['projects'];
      const project_output = data.map(d => {
        return {
          id: d.id,
          name: d.name,
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
      const data = out.data
      res.send(data)
    }).catch(err => {
      onError(res, err, `Failed to get response for project with id ${project_id}`)
    })
  })

  app.get('/api/mo4light/getProjectsForClient/:client_id', (req, res) => {
    const client_id = req.params.client_id;
    pg_get('/clients/' + client_id).then((out, err) => {
      if (err) return onError(res, err, err);
      const data = out.data['clients'];
      // ToDo: filter data by token rights
      res.send(data)
    }).catch(err => {
      onError(res, err, err)
    })
  });

  app.put('/api/mo4light/projectSettings', (req, res) => {
    const project_name = req.body.project_name;
    const settings = req.body.project_settings
    const token = req['token'];
    const is_admin = token.permission.admin;
    // TODO: verify project belongs to client
    pg_put('/project/' + project_name).then((out, err) => {
      if (err) return onError(res, err, 'Failed to store project settings');

    })
  })

  app.post('/api/mo4light/weather', (req, res) => {
    const project_id = req.params.project_id;
    const token = req['token'];
    return onError(res, null, 'Endpoint still needs to be implemented')
  })

  function pg_get(endpoint, data) {
    const url = baseUrl + endpoint;
    if (!data) return http.get(url, {headers});
    return http.get(url, {data, headers});
  }

  function pg_post(endpoint, data) {
    const url = baseUrl + endpoint;
    return http.post(url, data, {headers})
  }

  function pg_put(endpoint, data) {
    const url = baseUrl + endpoint;
    return http.put(url, data, {headers})
  }
};

