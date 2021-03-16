var ax = require('axios');

const baseUrl = process.env.AZURE_URL ?? 'https://mo4-light.azurewebsites.net';
const token   = process.env.AZURE_TOKEN;
const http    = ax.default;
const headers = {
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
    logger.error(err)
    res.status(500).send(additionalInfo);
  }

  app.get('/api/mo4light/getVesselList', (req, res) => {
    const token = req['token'];
    const client_id = token['client_id'];
    pg_get('/vessel?client_id=' + client_id).then((data, err) => {
      if (err) return onError(res, err);
      console.log(data);
      res.send([]);
    }).catch(err => {
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getProjectList', (req, res) => {
    const token = req['token'];
    const client_id = token['client_id'];
    pg_get('/project?client_id=' + client_id).then((data, err) => {
      if (err) return onError(res);
      console.log(data);
      res.send([]);
    }).catch(err => {
      onError(res, err)
    })
  });

  app.get('/api/mo4light/getUsers', (req, res) => {
    // TODO this endpoint might need to be removed / changed
    // const token = req['token'];
    // const client_id = token['client_id'];
    // pg_get('/vessel?client_id=' + client_id).then((data, err) => {
    //   if (err) return onError(res);
    //   console.log(data);
    // })
    return res.send([{
      username: 'Tasty Testy'
    }])
  });

  app.get('/api/mo4light/getClients', (req, res) => {
    // TODO this endpoint might need to be removed / changed
    // const token = req['token'];
    // const client_id = token['client_id'];
    // pg_get('/vessel?client_id=' + client_id).then((data, err) => {
    //   if (err) return onError(res);
    //   console.log(data);
    // })
    return res.send([{
      username: 'Tasty Testy'
    }])
  });

  // app.get('/api/mo4light/getProjectList', 
  //   defaultPgLoader('projects', '*')
  // );

  // app.get('/api/mo4light/getResponseForProject/:project_id', (req, res) => {
  //     const id = req.params.project_id;
  //     const cb = defaultPgLoader('responses', '*', `project_id=(${id})`);
  //     return cb(req, res);
  //   }
  // )

  // app.get('/api/mo4light/getProjectsForClient/:client_id', (req, res) => {
  //   const client_id = req.params.client_id;
  //   let PgQuery = `SELECT * from projects where (client_id=${client_id})`;
  //   pool.query(PgQuery).then((data, err) => {
  //     if (err) return onError(res, err);
  //     res.send(data.rows)
  //   }, (err) => {
  //     onError(res, err);
  //   })
  // });

  // app.get('/api/mo4light/getProjectById/:id', (req, res) => {
  //   const id = req.params.id;
  //   let PgQuery = `SELECT * from projects where (id=${id})`;
  //   pool.query(PgQuery).then((data, err) => {
  //     if (err) return onError(res, err);
  //     res.send(data.rows)
  //   }, (err) => {
  //     onError(res, err);
  //   })
  // });

  // app.get('/api/mo4light/connectionTest', 
  //   defaultPgLoader('projects', '*')
  // )

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
  // app.post('/api/mo4light/weather', (req, res) => {
  //   const response_id = req.body.response_id;
  //   if (!(response_id>0)) return onError(res, `Invalid request id ${response_id}`, 'Invalid request id')
  //   let PgQuery = `SELECT * from responses where (id=${response_id})`;
  //   pool.query(PgQuery).then(data => {
  //     const metocean = data.rows[0]?.response?.Points_Of_Interest?.P1?.MetoceanData;
  //     const weather = {
  //       source: 'Infoplaza',
  //       timeStamp: metocean?.Time,
  //       Hs: metocean?.Wave?.Parametric?.Hs,
  //       Hmax: metocean?.Wave?.Parametric?.Hmax,
  //       Tz: metocean?.Wave?.Parametric?.Tz,
  //       Tp: metocean?.Wave?.Parametric?.Tp,
  //       waveDir: metocean?.Wave?.Parametric?.MeanDirection,
  //       wavePeakDir: metocean?.Wave?.Parametric?.PeakDirection,
  //       windSpeed: metocean?.Wind?.Speed,
  //       windGust: metocean?.Wind?.Gust,
  //       windDir: metocean?.Wind?.Direction,
  //     }
  //     return res.send(weather);
  //   }).catch(err => {
  //     onError(res, err)
  //   });
  // })
  // app.post('/api/mo4light/spectrum', (req, res) => {
  //   const response_id = req.body.response_id;
  //   if (!(response_id>0)) return onError(res, `Invalid request id ${response_id}`, 'Invalid request id')
  //   let PgQuery = `SELECT * from responses where (id=${response_id})`;
  //   pool.query(PgQuery).then(data => {
  //     const metocean = data.rows[0]?.response?.Points_Of_Interest?.P1?.MetoceanData;
  //     const spectrum = metocean?.Wave?.Spectral;
  //     return res.send(spectrum);
  //   }).catch(err => {
  //     onError(res, err)
  //   });
  // })


  function pg_get(endpoint) {
    const url = baseUrl + endpoint;
    return http.get(url, {headers})
  }
  
  function pg_post(endpoint, data) {
    const url = baseUrl + endpoint;
    return http.post(url, data, {headers})
  }
};

