const rewire = require('rewire');
const request = require('supertest');
const mock = require('../helper/mocks.server')
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../helper/validate.server');
const testUserCreate = require('./admin/user_create.spec')
const testLogin = require('./admin_no_token/login.spec')

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

testUserCreate(app, GET, POST);
testLogin(app, GET, POST);



// // ################# Tests - administrative - admin login #################
// describe('Administrative - with login - user should', () => {
//   // ToDo: This should be removed and all the auth headers should be set to false
//   const username = 'Glados';
//   const company = 'Aperture industries';
//   const new_user_id = 777;
//   beforeEach(() => {
//     mock.mailer(app)();
//     mock.jsonWebToken(app, {
//       user_id: 1,
//       client_id: 2,
//       username: username,
//       userCompany: company,
//       userBoats: [123456789, 987654321],
//       userPermission: 'admin',
//       permission: {
//         admin: true
//       }
//     })
//   })

// })

// // ################# Tests - no login #################
// describe('User without login should', () => {
//   it('perform connection test', async () => {
//     const response = GET('/api/connectionTest', false)
//     await response.expect(expectValidRequest)
//   })

//   it('not be allowed to get vessels', async () => {
//     const response = GET('/api/getVessel', false)
//     await response.expect(expectUnAuthRequest)
//   })

//   it('not be allowed to get harbours', async () => {
//     const response = GET('/api/getHarbourLocations', false)
//     return response.expect(expectUnAuthRequest)
//   })

//   it('not be allowed access the hydro database', async () => {
//     const response = GET('/api/mo4light/getVesselList', false)
//     return response.expect(expectUnAuthRequest)
//   })

//   it('not be allowed to check if user is active', async () => {
//     // @TODO maybe change this?
//     const response = GET('/api/checkUserActive/test@test.nl', false)
//     await response.expect(expectUnAuthRequest)
//   })
// })

// // ################# Tests - vessel master #################
// describe('Vessel master should', () => {
//   const username = 'Test vesselmaster';
//   const company = 'BMO';

//   beforeEach(() => {
//     mock.mailer(app)();
//     mock.jsonWebToken(app, {
//       username: username,
//       userCompany: company,
//       userBoats: [123456789],
//       userPermission: 'Vessel master',
//       client_id: 1,
//       permission: {
//         admin: false,
//         user_read: false,
//       }
//     })
//   })

//   xit('no be able to check if a user is active', async () => {
//     mock.pgRequest([{
//       active: true,
//     }])
//     const response = GET('/api/checkUserActive/' + username)
//     await response.expect(expectUnAuthRequest)
//   })

//   it('not get a user list', async () => {
//     mock.pgRequest([{
//       active: true,
//       userID: 1,
//       username: username,
//       client_name: company,
//       client_id: 1,
//       vessel_ids: [1],
//       permission: {}
//     }])
//     const response = GET('/api/getUsers')
//     await response.expect(expectUnAuthRequest).catch(e => {
//       console.error(e)
//     })
//   })

//   it('get a vessel list', async () => {
//     mock.pgRequest([{
//       mmsi: 123,
//     }])
//     const response = GET('/api/vesselList')
//     await response.expect(expectValidRequest)
//   })
// })

// // ################# Tests - marine controller #################
// describe('Marine controller should', () => {
//   const username = 'Test vesselmaster';
//   const company = 'BMO';

//   beforeEach(() => {
//     mock.mailer(app)();
//     mock.jsonWebToken(app, {
//       username: username,
//       userCompany: company,
//       userBoats: [123456789],
//       userPermission: 'Marine controller',
//       client_id: 1,
//       permission: {
//         admin: false,
//         user_read: true,
//       }
//     })
//   })

//   it('check if a user is active', async () => {
//     mock.pgRequest([{
//       active: true,
//     }])
//     const response = GET('/api/checkUserActive/' + username)
//     await response.expect(expectValidRequest)
//   })

//   it('get a user list', async () => {
//     mock.pgRequest([{
//       active: true,
//       userID: 1,
//       username: username,
//       client_name: company,
//       client_id: 1,
//       vessel_ids: [1],
//       permission: {}
//     }])
//     const response = GET('/api/getUsers')
//     await response.expect(expectValidRequest)
//   })

//   it('get a vessel list', async () => {
//     mock.pgRequest([{
//       mmsi: 123,
//     }])
//     const response = GET('/api/vesselList')
//     await response.expect(expectValidRequest)
//   })
// })

// // ################# Tests - Logistic specialist #################
// describe('Logistic specialist should', () => {
//   const username = 'Test logistics specialist';
//   const company = 'BMO';
//   const otherCompany = 'Totally not BMO'

//   beforeEach(() => {
//     mock.mailer(app)();
//     mock.jsonWebToken(app, {
//       username: username,
//       userCompany: company,
//       userBoats: [123456789],
//       userPermission: 'Logistics specialist',
//       client_id: 1,
//       permission: {
//         admin: false,
//         user_read: true,
//         demo: true,
//         user_manage: true,
//       }
//     })
//   })

//   it('check if a user is active', async () => {
//     mock.pgRequest([{
//       active: true
//     }])
//     const response = GET('/api/checkUserActive/' + username)
//     await response.expect(expectValidRequest)
//   })

//   it('get a user list', async () => {
//     mock.pgRequest([{
//       active: true,
//       userID: 1,
//       username: username,
//       client_name: company,
//       client_id: 1,
//       vessel_ids: [1],
//       permission: {}
//     }])
//     const response = GET('/api/getUsers')
//     await response.expect(expectValidRequest)
//   })

//   it('get a vessel list', async () => {
//     mock.pgRequest([{
//       mmsi: 123,
//     }])
//     const response = GET('/api/vesselList')
//     await response.expect(expectValidRequest).expect((response) => {
//       const body = response.body;
//       expect(Array.isArray(body)).toBe(true, 'Response should be an array')
//     })
//   })
// })

// // ################# Tests - Admin #################
// describe('Admin should', () => {
//   const username = 'Test admin';
//   const company = 'BMO';

//   beforeEach(() => {
//     mock.mailer(app)();
//     mock.jsonWebToken(app, {
//       username: username,
//       userCompany: company,
//       userBoats: [123456789],
//       userPermission: 'admin',
//       client_id: 1,
//       permission: {
//         admin: true,
//         user_read: true,
//         demo: true,
//         user_manage: true,
//       }
//     })
//   })

//   it('check if a user is active', async () => {
//     mock.pgRequest([{
//       active: true,
//     }])
//     const response = GET('/api/checkUserActive/' + username)
//     await response.expect(expectValidRequest)
//   })

//   it('get a user list', async () => {
//     mock.pgRequest([{
//       active: true,
//       userID: 1,
//       username: username,
//       client_name: company,
//       client_id: 1,
//       vessel_ids: [1],
//       permission: {}
//     }])
//     const response = GET('/api/getUsers')
//     await response.expect(expectValidRequest)
//   })

//   it('get a vessel list', async () => {
//     mock.pgRequest([{
//       mmsi: 123,
//     }])
//     const response = GET('/api/vesselList')
//     await response.expect(expectValidRequest)
//   })
// })
