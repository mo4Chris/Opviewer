var pino = require('pino');
const express = require('express')
const { default: axios } = require('axios');

// ############# General setup #############
module.exports = {}
var logger = pino({level: process.env.LOGGING_LEVEL})


function onUnauthorized(res, cause = 'unknown') {
  logger.trace('Performing onUnauthorized')
  const req = res.req;
  logger.warn({
    msg: `Bad request: ${cause}`,
    type: 'BAD_REQUEST',
    cause,
    username: req?.token?.username,
    url: req.url,
  })
  if (cause == 'unknown') {
    res.status(401).send('Unauthorized request')
  } else {
    res.status(401).send(`Unauthorized: ${cause}`)
  }
}
module.exports.onUnauthorized = onUnauthorized;

function onOutdatedToken(res, token, cause = 'Outdated token, please log in again') {
  logger.trace('Performing onOutdatedToken')
  const req = res.req;
  if (token == undefined) return;
  logger.warn({
    msg: `Outdated request: ${cause}`,
    type: 'OUTDATED_REQUEST',
    cause,
    username: token?.username,
    url: req?.url,
  })

  res.status(460).send(cause);
}
module.exports.onOutdatedToken = onOutdatedToken;

/**
 * Returns query as bad request
 *
 * @param {express.Response} res Response
 * @param {any} raw_error Debug information for the cause of the error
 * @param {any} additionalInfo Optional cause for the user on why the request errored.
 * @api public
 */
function onError(res, raw_error, additionalInfo = 'Internal server error') {
  logger.debug('Triggering onError')

  const err_keys = typeof(raw_error)=='object' ? Object.keys(raw_error) : [];
  let err = {};
  try {
    if (typeof(raw_error) == 'string') {
      logger.debug('Got text error: ', raw_error)
      err.message = raw_error;
    } else if (axios.isAxiosError(raw_error)) {
      logger.debug('Got axios error')
      err.message = raw_error.response?.data?.message ?? 'Unspecified axios error';
      err.axios_url = raw_error?.config?.url;
      err.axios_method = raw_error?.config?.method;
      err.axios_data = raw_error?.config?.data;
      err.axios_response_data = raw_error?.response?.data;
      err.axios_status = raw_error.response?.status;
    } else if (err_keys.some(k => k=='schema') && err_keys.some(k => k=='table')) {
      logger.debug('Got postgres error')
      err = raw_error;
    } else {
      logger.debug('Got other error (catchall)')
      err = raw_error;
    }
    err.url = res.req?.url;
    err.method = res.req?.method;
    err.username = res.req?.token?.username;
    err.usertype = res.req?.token?.userPermission;
    err.stack = (new Error()).stack;

    logger.error(err, additionalInfo)
    res.status(500).send(additionalInfo);
  } catch (err) {
    console.error(err)
  }
}
module.exports.onError = onError;

/**
 * Returns query as bad request
 *
 * @param {express.Response} res Response
 * @param {any} cause Optional reason on why the request is considered bad.
 * @api public
 */
function onBadRequest(res, cause = 'Bad request') {
  if (typeof cause == 'object' && cause['errors'] != null) {
    const param = cause['errors']?.[0]?.['param'] ?? 'unknown';
    const msg = cause['errors']?.[0]?.['msg'] ?? 'unknown issue';
    cause = `Invalid value for "${param}": ${msg}`;
  }

  logger.trace('Performing onBadRequest')
  const req = res.req;
  logger.warn({
    msg: `Bad request: ${cause}`,
    type: 'BAD_REQUEST',
    cause,
    username: req?.token?.username ?? 'UNKNOWN',
    url: req.url,
  })
  if (cause == 'Bad request') {
    res.status(400).send('Bad request')
  } else {
    res.status(400).send(cause)
  }
}
module.exports.onBadRequest = onBadRequest;
