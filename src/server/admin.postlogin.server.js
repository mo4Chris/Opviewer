var {Client, Pool} = require('pg')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var twoFactor = require('node-2fa');
require('dotenv').config({ path: __dirname + '/./../.env' });

const pool = new Client({
    host: process.env.ADMINPGHOST,
    port:process.env.ADMINPGPORT, 
    database: process.env.ADMINPGDATABASE, 
    user: process.env.ADMINPGUSER,
    password: process.env.ADMINPGPASSWORD,
    ssl: false
})

module.exports = function(app, logger) {
  try {
    pool.connect()
    logger.info(`Connected to pg database at host ${pool.host}`)
  } catch (err) {
    logger.fatal(err)
  }
  
};