var nodemailer = require('nodemailer');
var { Pool } = require('pg')
var mongo = require("mongoose");
var pino = require('pino');
const ax = require('axios');

// ############# General setup #############
module.exports  = {}
var logger      = pino({level: process.env.LOGGING_LEVEL})
const timeout   = +process.env.TIMEOUT || 30000;
const http      = ax.default;
const bearer    = process.env.AZURE_TOKEN;
const headers   = {
  "content-type": "application/json",
  'Authorization': `Bearer ${bearer}`
}

// ############# MAIL #################
module.exports.mailer = nodemailer.createTransport({
  // @ts-ignore
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: (+process.env.EMAIL_PORT == 465),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ############# mongoDB #################
mongo.set('useFindAndModify', false);
mongo.connect(process.env.DB_CONN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err, response) {
  if (err) return logger.fatal(err);
  logger.info('Connected to mongo database');
})
module.exports.mongo = mongo;

// ############# Admin DB #################
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


// ############# Hydro API: GET / POST / PUT / DELETE #################
let baseUrl   = process.env.AZURE_URL ?? 'http://mo4-hydro-api.azurewebsites.net';
let backupUrl = process.env.AZURE_BACKUP_URL ?? 'https://mo4-light.azurewebsites.net';

if (bearer == null) {
  logger.fatal('Azure connection token not found!')
  process.exit(1)
}
logger.info(`Connecting to hydro database at ${baseUrl}`)
pg_get('').then((data, err) => {
  if (err) return useBackupUrl(err);
  logger.info(`Successfully connected to hydro API at ${baseUrl}`)
}).catch(useBackupUrl)

/**
 * Performs a GET query to the azure hydro API
 *
 * @param {string} endpoint Endpoint at the hydro API
 * @param {any} data Optional data to send with the GET request
 * @api public
 */
  function pg_get(endpoint, data) {
  logger.debug('Performing GET request:' + endpoint)
  const url = baseUrl + endpoint;
  if (!data) return http.get(url, {headers});
  return http.get(url, {data, headers, timeout});
}

/**
 * Performs a POST query to the azure hydro API
 *
 * @param {string} endpoint Endpoint at the hydro API
 * @param {any} data Body to send with the POST request
 * @api public
 */
function pg_post(endpoint, data) {
  logger.debug('Performing POST request:' + endpoint)
  const url = baseUrl + endpoint;
  return http.post(url, data, {headers, timeout})
}

/**
 * Performs a PUT query to the azure hydro API
 *
 * @param {string} endpoint
 * @param {any} data Body to send with the PUT request
 * @api public
 */
function pg_put(endpoint, data) {
  logger.debug('Performing PUT request:' + endpoint)
  const url = baseUrl + endpoint;
  return http.post(url, data, {headers, timeout})
}

/**
 * Performs a DELETE query to the azure hydro API
 *
 * @param {string} endpoint
 * @api public
 */
function pg_delete(endpoint) {
  logger.debug('Performing DELETE request:' + endpoint)
  const url = baseUrl + endpoint;
  return http.delete(url, {headers, timeout})
}

/**
 * Uses backup URL
 *
 * @param {Error} err Error triggering the use of the backup url
 * @api public
 */
 function useBackupUrl(err) {
  logger.warn(err, 'Failed to connect to hydro API - using backup')
  baseUrl = backupUrl;
  pg_get('').then((data, err) => {
    if (err) return logger.fatal('Failed to connect to backup API')
    logger.info(`Successfully connected to backup API at ${baseUrl}`)
  }).catch(err => logger.fatal('Failed to connect to backup API'))
}
module.exports.hydro = {
  GET: pg_get,
  POST: pg_post,
  PUT: pg_put,
  DELETE: pg_delete
}
