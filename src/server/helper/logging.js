var pino = require('pino');

module.exports = {};

// TODO set logging level based on env.js
var logger = pino();
module.exports.logger = logger;
