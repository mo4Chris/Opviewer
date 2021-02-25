var {Client, Pool} = require('pg')
var ax = require('axios');


const pool = new Client()
const baseUrl = 'https://mo4-light.azurewebsites.net';
const http = ax.default;
const token = process.env.AZURE_TOKEN;
const headers = {
  'Authorization': `Bearer ${token}` 
}

module.exports = function(app, logger) {
  try {
    pool.connect()
    logger.info(`Connected to pg database at host ${pool.host}`)
  } catch (err) {
    logger.fatal(err)
  }

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
  

  app.get('/api/mo4light/getClients', 
    defaultPgLoader('clients')
  );

  app.get('/api/mo4light/getUsers',
    defaultPgLoader('users')
  );

  app.get('/api/mo4light/getVesselList', 
    defaultPgLoader('vessels')
  );

  app.get('/api/mo4light/getProjectList', 
    defaultPgLoader('projects', '*')
  );

  app.get('/api/mo4light/getResponseForProject/:project_id', (req, res) => {
      const id = req.params.project_id;
      const cb = defaultPgLoader('responses', '*', `project_id=(${id})`);
      return cb(req, res);
    }
  )

  app.get('/api/mo4light/getProjectsForClient/:client_id', (req, res) => {
    const client_id = req.params.client_id;
    let PgQuery = `SELECT * from projects where (client_id=${client_id})`;
    pool.query(PgQuery).then((data, err) => {
      if (err) return onError(res, err);
      res.send(data.rows)
    }, (err) => {
      onError(res, err);
    })
  });

  app.get('/api/mo4light/getProjectById/:id', (req, res) => {
    const id = req.params.id;
    let PgQuery = `SELECT * from projects where (id=${id})`;
    pool.query(PgQuery).then((data, err) => {
      if (err) return onError(res, err);
      res.send(data.rows)
    }, (err) => {
      onError(res, err);
    })
  });

  app.get('/api/mo4light/connectionTest', 
    defaultPgLoader('projects', '*')
  )

  // app.post('/api/mo4light/weather', (req, res) => {
  //   const response_id = 1;
  //   console.log('Retrieving weather!')
  //   pgGet('/response/' + response_id, '').then(raw => {
  //     const response = raw.data;
  //     const P1 = response?.response?.Points_Of_Interest?.P1;
  //     if (P1) {
  //       console.log(P1)
  //       res.send(P1);
  //     } else {
  //       res.status(204).send(null);
  //     }
  //   }, err => {
  //     onError(res, err);
  //   }).catch(err => {
  //     onError(res, err);
  //   })
  // })
  app.post('/api/mo4light/weather', (req, res) => {
    const response_id = req.body.response_id;
    if (!(response_id>0)) return onError(res, `Invalid request id ${response_id}`, 'Invalid request id')
    let PgQuery = `SELECT * from responses where (id=${response_id})`;
    pool.query(PgQuery).then(data => {
      const metocean = data.rows[0]?.response?.Points_Of_Interest?.P1?.MetoceanData;
      const weather = {
        source: 'Metocean',
        timeStamp: metocean?.Time,
        Hs: metocean?.Wave?.Parametric?.Hs,
        Hmax: metocean?.Wave?.Parametric?.Hmax,
        Tz: metocean?.Wave?.Parametric?.Tz,
        Tp: metocean?.Wave?.Parametric?.Tp,
        waveDir: metocean?.Wave?.Parametric?.MeanDirection,
        wavePeakDir: metocean?.Wave?.Parametric?.PeakDirection,
        windSpeed: metocean?.Wind?.Speed,
        windGust: metocean?.Wind?.Gust,
        windDir: metocean?.Wind?.Direction,
      }
      return res.send(weather);
    }).catch(err => {
      onError(res, err)
    });
  })
  app.post('/api/mo4light/spectrum', (req, res) => {
    const response_id = req.body.response_id;
    if (!(response_id>0)) return onError(res, `Invalid request id ${response_id}`, 'Invalid request id')
    let PgQuery = `SELECT * from responses where (id=${response_id})`;
    pool.query(PgQuery).then(data => {
      const metocean = data.rows[0]?.response?.Points_Of_Interest?.P1?.MetoceanData;
      const spectrum = metocean?.Wave?.Spectral;
      return res.send(spectrum);
    }).catch(err => {
      onError(res, err)
    });
  })

  function pgGet(endpoint) {
    const url = baseUrl + endpoint;
    return http.get(url, {headers})
  }

  function pgPost(endpoint, data) {
    const url = baseUrl + endpoint;
    return http.post(url, data, {headers})
  }
  
  function defaultPgLoader(table, fields = '*', filter=null) {
    let PgQuery = '';
    if (fields == '*') {
      PgQuery = `SELECT * from ${table}`;
    } else if (typeof fields == 'string') {
      PgQuery = `SELECT (${fields}) from ${table}`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT (${fieldList}) from ${table}`;
    }
    if (filter) {
      PgQuery = `${PgQuery} where ${filter}`
    }
    return function(req, res) {
      pool.query(PgQuery).then((data, err) => {
        if (err) return onError(res, err);
        if (fields == '*') {
          res.send(data.rows)
        } else if (typeof fields == 'string') {
          res.send(data.rows.map(user => user[fields]));
        } else {
          const out = [];
          data.rows.forEach(row => {
            data = {};
            fields.forEach(key => {
              data[key] = row[key]
            });
            out.push(data)
          });
          res.send(out);
        }
      }, err => {
        onError(res, err);
      })
    }
  }
};

