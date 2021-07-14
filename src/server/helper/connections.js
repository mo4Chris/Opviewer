var { Pool } = require('pg')
var pino = require('pino');
var logger = pino()


module.exports = {};

const admin_server_pool = new Pool({
  host: process.env.ADMIN_DB_HOST,
  port: +process.env.ADMIN_DB_PORT,
  database: process.env.ADMIN_DB_DATABASE,
  user: process.env.ADMIN_DB_USER,
  password: process.env.ADMIN_DB_PASSWORD,
  ssl: false
})
admin_server_pool.connect().then(() => {
  logger.info(`Connected to admin database at host ${process.env.ADMIN_DB_HOST}`)
}).catch(err => {
  return logger.fatal(err, "Failed initial connection to admin db!")
})
admin_server_pool.on('error', (err) => {
  logger.fatal(err, 'Unexpected error in connection with admin database!')
})
module.exports.admin = admin_server_pool;
