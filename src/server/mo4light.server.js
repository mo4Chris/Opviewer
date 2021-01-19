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
    defaultPgLoader('users', 'username')
  );

  app.get('/api/mo4light/getVesselList', 
    defaultPgLoader('vessels', ['type', 'id'])
  );

  app.get('/api/mo4light/getProjectList', 
    defaultPgLoader('projects', ['name', 'id', 'consumer_id'])
  );

  app.get('/api/mo4light/getProjectById/:id', (req, res) => {
    const id = req.params.id.split(",").filter(function(el) { return el != null && el != '' });
    let PgQuery = `SELECT * from projects where id=${id}`
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
        console.log(`Error parsing ${PgQuery}`)
        logger.error(err);
        res.send([]);
      })
    }
  }
};