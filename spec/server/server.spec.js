const rewire = require('rewire');
const glob = require('glob')
const request = require('supertest');

// This test suite runs unit tests for the server file. Since we use
// rewire to mock token verification, there is no need for user
// credentials. Supertest automatically configures the server connection
// for us (to a random port).
//
// Usage:
// npm run server-test
//
// ToDo:
//  - Mock the actual database requests / use the test database
//  - verifyToken currently updates the lastActive field for user
//    which is currently failing silently


// ################# Setup #################
const app = rewire('../../src/server.js')
const SERVER_LOGGING_LEVEL = 'debug';
if (SERVER_LOGGING_LEVEL != null) {
  process.env.LOGGING_LEVEL = SERVER_LOGGING_LEVEL
}


// ################# GET & POST #################
/**
 * Mocks GET requests
 *
 * @param {string} url
 * @param {boolean} auth
 */
function GET(url, auth = true) {
  const req = request(app)
    .get(url)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

/**
 * Mocks POST requests
 *
 * @param {string} url Endpoint, not including URL
 * @param {any} data Data stored in the request body
 * @param {boolean} auth
 */
 function POST(url, data, auth = true) {
  if (typeof (data) != 'object') throw new Error('Invalid mocked POST payload!')
  const req = request(app)
    .post(url)
    .send(data)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

/**
 * Mocks PUT requests
 *
 * @param {string} url Endpoint, not including URL
 * @param {any} data Data stored in the request body
 * @param {boolean} auth
 */
function PUT(url, data, auth = true) {
  if (typeof (data) != 'object') throw new Error('Invalid mocked POST payload!')
  const req = request(app)
    .put(url)
    .send(data)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

// Interate through all the test classes, skipping this one.
const files = glob.sync(__dirname + '/**/*spec.js')
files.forEach(file => {
  if (file == __filename) return;
  const testClass = require(file);
  if (typeof testClass == 'function') {
    testClass(app, GET, POST, PUT)
  }
})
