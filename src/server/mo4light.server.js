var {Client, Pool} = require('pg')

const pool = new Client()


module.exports = function(app, logger) {
  try {
    pool.connect()
    logger.info(`Connected to pg database at host ${pool.host}`)
  } catch (err) {
    logger.fatal(err)
  }
  

  app.get('/api/mo4light/getClients', 
    defaultPgLoader('clients')
  );

  app.get('/api/mo4light/getUsers',
    defaultPgLoader('users')
  );

  app.get('/api/mo4light/getVesselList', 
    defaultPgLoader('vessels', ['type', 'id'])
  );

  app.get('/api/mo4light/getProjectList', 
    defaultPgLoader('projects', '*')
  );

  app.get('/api/mo4light/getResponseForProject/:project_id', (req, res) => {
      const id = req.params.project_id;
      cb = defaultPgLoader('responses', '*', `project_id=${id}`);
      return cb(req, res);
    }
  )

  app.get('/api/mo4light/getProjectsForClient/:client_id', (req, res) => {
    const client_id = req.params.client_id;
    let PgQuery = `SELECT * from projects where id=${client_id}`;
    pool.query(PgQuery).then((data, err) => {
      if (err) {
        logger.error(err);
        res.send(err);
      } else {
        res.send(data.rows)
      }
    })
  });

  app.get('/api/mo4light/getProjectById/:id', (req, res) => {
    const id = req.params.id;
    let PgQuery = `SELECT * from projects where id=${id}`;
    pool.query(PgQuery).then((data, err) => {
      if (err) {
        logger.error(err);
        res.send(err);
      } else {
        res.send(data.rows)
      }
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
      PgQuery = `SELECT ${fields} from ${table}`;
    } else {
      const fieldList = fields.join(', ');
      PgQuery = `SELECT ${fieldList} from ${table}`;
    }
    if (filter) {
      PgQuery = `${PgQuery} where ${filter}`
    }
    return function(req, res) {
      pool.query(PgQuery).then((data, err) => {
        if (err) {
          logger.error(err);
          res.send(err);
        } else {
          if (fields == '*') {
            res.send(data.rows)
          } else if (typeof fields == 'string') {
            res.send(data.rows.map(user => user[fields]));
          } else {
            out = [];
            data.rows.forEach(row => {
              data = {};
              fields.forEach(key => {
                data[key] = row[key]
              });
              out.push(data)
            });
            res.send(out);
          }
        }
      }).catch(err => {
        logger.error(err);
        res.send([]);
      })
    }
  }
};