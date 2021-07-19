const base = require('dotenv').config({
  path: __dirname + '/./../../../.env'
});
if (base.error) {
  throw base.error
}

const SERVER_ADDRESS    = process.env.IP_USER?.split(",")?.[0]  ?? 'forecasting.mo4.online';
const WEBMASTER_MAIL    = process.env.EMAIL                     ?? 'webmaster@mo4.online';
const SERVER_PORT       = process.env.SERVER_PORT               ?? 8080;
const DB_CONN           = process.env.DB_CONN;
const LOGGING_LEVEL     = process.env.LOGGING_LEVEL             ?? 'debug'
const AZURE_URL         = process.env.AZURE_URL                 ?? 'http://mo4-hydro-api.azurewebsites.net';
const AZURE_BACKUP_URL  = process.env.AZURE_BACKUP_URL          ?? 'https://mo4-light.azurewebsites.net'
const AZURE_TOKEN       = process.env.AZURE_TOKEN;


const SHARED_DEMO_PROJECT_NAME  = process.env.SHARED_DEMO_PROJECT_NAME  ?? 'Sample_Project';
const GENERIC_VESSEL_CLIENT_ID  = process.env.GENERIC_VESSEL_CLIENT_ID  ?? 1; // ToDo: replace this!
const DEMO_CLIENT_NAME          = process.env.DEMO_CLIENT_NAME          ?? 'Demo';

if (!AZURE_TOKEN) throw new Error('No valid azure token found!')
if (!DB_CONN) throw new Error('No valid admin DB connection string found!')

module.exports = {
  SERVER_ADDRESS,
  WEBMASTER_MAIL,
  SERVER_PORT,
  DB_CONN,
  LOGGING_LEVEL,
  AZURE_URL,
  AZURE_BACKUP_URL,
  AZURE_TOKEN,
  SHARED_DEMO_PROJECT_NAME,
  GENERIC_VESSEL_CLIENT_ID,
  DEMO_CLIENT_NAME,
}
