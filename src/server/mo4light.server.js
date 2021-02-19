var {Client, Pool} = require('pg')

const pool = new Client()

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

