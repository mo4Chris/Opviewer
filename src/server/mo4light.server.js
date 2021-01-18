var {Client, Pool} = require('pg')

const pool = new Client()

function defaultPgLoader(table, fields = '*') {
  let PgQuery = '';
  if (fields == '*') {
    PgQuery = `SELECT * from ${table}`;
  } else if (typeof fields == 'string') {
    PgQuery = `SELECT ${fields} from ${table}`;
  } else {
    const fieldList = fields.join(', ');
    PgQuery = `SELECT ${fieldList} from ${table}`;
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
          console.log(data)
          out = {};
          fields.forEach(key => {
            out[key] = data.rows.map(elt => elt[key])
          });
          res.send(out);
        }
      }
    }).catch(err => {
      logger.error(err);
      res.send(err);
    })
  }
}

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
    defaultPgLoader('users', 'username')
  );

  app.get('/api/mo4light/getVesselList', 
    defaultPgLoader('vessels', 'type')
  );

  app.get('/api/mo4light/connectionTest', 
    defaultPgLoader('clients', ['name', 'id'])
  )
};