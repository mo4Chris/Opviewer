var ax = require('axios');

const baseUrl = process.env.AZURE_URL ?? 'https://mo4-light.azurewebsites.net';
const token   = process.env.AZURE_TOKEN;
const http    = ax.default;
const headers = {
  "content-type": "application/json",
  'Authorization': `Bearer ${token}` 
}

module.exports = function(app, logger) {
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
    logger.error(err.message)
    console.log(err)


    res.status(500).send(additionalInfo);
  }

  app.get('/api/mo4light/getVesselList', (req, res) => {
    const token = req['token'];
    const start = Date.now()
    const client_id = 2;
    pg_get('/vessels', {client_id}).then(async (out, err) => {
      console.log(`Receiving azure vessel list response after ${Date.now() - start}ms`)
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
    pg_get('/projects').then(async (out, err) => {
      console.log(`Receiving azure project response after ${Date.now() - start}ms`)
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
          vessel_id: d.vessel.type
        }
      })
      // ToDo: filter data by token rights
      res.send(project_output)
    }).catch(err => {
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getUsers', (req, res) => {
    const token = req['token'];
    // pg_get('/users').then((out, err) => {
    //   if (err) return onError(res, err, err);
    //   const data = out.data['projects'];
    //   // ToDo: filter data by token rights
    //   res.send(data)
    // }).catch(err => {
    //   onError(res, err, err)
    // })
    return res.send([{
      username: 'Tasty Testy'
    }])
  });

  app.get('/api/mo4light/getClients', (req, res) => {
    // TODO this endpoint might need to be removed / changed
    const token = req['token'];
    pg_get('/clientlist').then((out, err) => {
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
    pg_get('/response/' + project_id).then((out, err) => {
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

  // // app.post('/api/mo4light/weather', (req, res) => {
  // //   const response_id = 1;
  // //   console.log('Retrieving weather!')
  // //   pgGet('/response/' + response_id, '').then(raw => {
  // //     const response = raw.data;
  // //     const P1 = response?.response?.Points_Of_Interest?.P1;
  // //     if (P1) {
  // //       console.log(P1)
  // //       res.send(P1);
  // //     } else {
  // //       res.status(204).send(null);
  // //     }
  // //   }, err => {
  // //     onError(res, err);
  // //   }).catch(err => {
  // //     onError(res, err);
  // //   })
  // // })
  app.post('/api/mo4light/weather', (req, res) => {
    const project_id = req.params.project_id;
    const token = req['token'];
    return res.send([]);
    // pg_get('/response/' + project_id).then((out, err) => {
    //   if (err) return onError(res, err, err);
    //   const metocean = out.data
    //   const weather = {
    //     timeStamp: metocean?.Time,
    //     Hs: metocean?.Wave?.Parametric?.Hs,
    //     Hmax: metocean?.Wave?.Parametric?.Hmax,
    //     Tz: metocean?.Wave?.Parametric?.Tz,
    //     Tp: metocean?.Wave?.Parametric?.Tp,
    //     waveDir: metocean?.Wave?.Parametric?.MeanDirection,
    //     wavePeakDir: metocean?.Wave?.Parametric?.PeakDirection,
    //     windSpeed: metocean?.Wind?.Speed,
    //     windGust: metocean?.Wind?.Gust,
    //     windDir: metocean?.Wind?.Direction,
    //   }
    //   const spectrum = metocean?.Wave?.Spectral;
    //   res.send({weather, spectrum})
    // }).catch(err => {
    //   onError(res, err, `Failed to get response for project with id ${project_id}`)
    // })
  })
  //     const metocean = data.rows[0]?.response?.Points_Of_Interest?.P1?.MetoceanData;
  //     const spectrum = metocean?.Wave?.Spectral;
  //     return res.send(spectrum);

  function pg_get(endpoint, data) {
    const url = baseUrl + endpoint;
    if (!data) return http.get(url, {headers});
    return http.get(url, {data, headers});
  }
  
  function pg_post(endpoint, data) {
    const url = baseUrl + endpoint;
    return http.post(url, data, {headers})
  }
};

