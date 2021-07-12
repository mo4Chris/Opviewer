var pino = require('pino');

const LOGGING_LEVEL = process.env.LOGGING_LEVEL ?? 'debug';
process.env.LOGGING_LEVEL = LOGGING_LEVEL;

var logger = pino({level: LOGGING_LEVEL})
module.exports = {}
module.exports.logger = logger;
