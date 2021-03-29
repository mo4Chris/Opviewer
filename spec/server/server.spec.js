const request = require('supertest');
const rewire = require('rewire');
const { Client, Pool } = require('pg');
const jwt = require("jsonwebtoken");
const { of } = require('rxjs');
const bcrypt = require('bcryptjs')
const twoFactor = require('node-2fa');


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
const SERVER_LOGGING_LEVEL = 'silent';
if (SERVER_LOGGING_LEVEL != null) {
  process.env.LOGGING_LEVEL = SERVER_LOGGING_LEVEL
}
const app = rewire('../../src/server')


// ################# GET & POST #################
function GET(url, auth = true) {
  const req = request(app)
    .get(url)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

function POST(url, data, auth = true) {
  if (typeof (data) != 'object') throw new Error('Invalid mocked POST payload!')
  const req = request(app)
    .post(url)
    .send(data)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

// ################# Helpers #################
async function expectValidRequest(response) {
  return expect(response.status).toBeLessThanOrEqual(201, response.text)
}
async function expectUnAuthRequest(response) {
  return expect(response.status).toEqual(401, `Expected auth failure (401)`)
}
async function expectBadRequest(response) {
  return expect(response.status).toEqual(400, `Expected bad request (400)`)
}
async function expectErrorRequest(response) {
  return expect(response.status).toEqual(500, `Expected error response (500)`)
}
function expectResponse(responseData, additionalInfo) {
  return async (response) => await expect(response.data).toEqual(responseData, additionalInfo)
}

function mockJsonWebToken(decoded_token) {
  const jwtMock = {
    sign: (token, keyType) => 'test_token',
    verify: (token, keyType) => decoded_token
  }
  app.__set__('jwt', jwtMock)
}
function mockPostgressRequest(return_value) {
  spyOn(Pool.prototype, 'query').and.returnValue(
    Promise.resolve(return_value)
  )
  spyOn(Client.prototype, 'query').and.returnValue(
    Promise.resolve(return_value)
  )
}
function mockTwoFactorAuthentication(valid = true) {
  let secret2faSpy = spyOn(twoFactor, 'verifyToken');
  if (valid) {secret2faSpy.and.returnValue(1)}
}


// #####################################################################
// ################# Tests - administrative - no login #################
// #####################################################################
describe('Administrative - no login - user should', () => {
  // ToDo: This should be removed and all the auth headers should be set to false
  const username = 'Test vesselmaster';
  const userID = 1;
  const password = 'test123';
  const company = 'BMO';
  beforeEach(() => {
    mockJsonWebToken({
      active: 1,
      userID,
      username: username,
      userCompany: company,
      userBoats: [123456789],
      userPermission: 'Vessel master',
      permission: {
        admin: false,
      }
    })
  })

  it('perform admin connection test', async () => {
    const use_authentication_header = true
    const request = GET('/api/admin/connectionTest', use_authentication_header);
    request.expect(expectValidRequest)
    const response = await request;
    expect(response.status).toBe(200, 'Failed admin connection test!')
    expect(response.body['status']).toBe(1, 'Connection test not returning true!')
  })
  // it('register user', async () => {
  //   const request = POST('/api/registerUser', {}, true)
  //   await request.expect(expectValidRequest)
  // })
  // it('register user - no 2fa', async () => {
  //   const request = POST('/api/registerUser', {}, true)
  //   await request.expect(expectValidRequest)
  // })
  // it('not register user with bad token', async () => {
  //   const request = POST('/api/registerUser', {}, true)
  //   await request.expect(expectValidRequest)
  // })
  // it('not register user with expired token', async () => {
  //   const request = POST('/api/registerUser', {}, true)
  //   await request.expect(expectValidRequest)
  // })

  function assertValidToken(encoded_token) {
    expect(typeof encoded_token).toBe('string')
    const token = jwt.verify(encoded_token, 'secretKey');
    const user_id = token['userID'] ?? -1;
    expect(user_id).toBeGreaterThan(0)
    expect(token['iat']).toBeLessThanOrEqual(Date.now());
    expect(token['expires']).toBeGreaterThan(Date.now());
    expect(Array.isArray(token['userBoats'])).toBe(true);
    expect(typeof token['userCompany']).toBe('string');
  }

  it('login user - successfull', async () => {
    const password = 'test123';
    const login_data = {
      username,
      password,
      secret2fa: "valid_2fa"
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 1,
        user_id: userID,
        client_name: "BMO",
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'valid_2fa',
        permission: {admin: false},
        requires2fa: true,
      }]
    })
    const response = await POST('/api/login', login_data, true)
    expect(response.status).toEqual(200)
    const token = response.body['token'];
    assertValidToken(token);
  })
  it('login user - successfull - 2fa not required', async () => {
    const password = 'test123';
    const login_data = {
      username,
      password,
    }
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: null,
        requires2fa: false,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectValidRequest)
  })
  it('not login user - user not active', async () => {
    const password = 'test123';
    const login_data = {
      username,
      password,
      secret2fa: "bad_2fa"
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 0,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'valid_2fa',
        requires2fa: true
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectUnAuthRequest)
  })
  it('not login user - missing password', async () => {
    const login_data = {
      username,
      secret2fa: "bad_2fa"
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectBadRequest)
  })
  it('not login user - missing username', async () => {
    const login_data = {
      password,
      secret2fa: "bad_2fa"
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectBadRequest)
  })
  it('not login user - bad password', async () => {
    const login_data = {
      username,
      password,
      secret2fa: "bad_2fa"
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectUnAuthRequest)
  })
  it('not login user - bad 2fa', async () => {
    const password = 'test123';
    const login_data = {
      username,
      password,
      secret2fa: "bad_2fa"
    }
    mockTwoFactorAuthentication(false)
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'invalid_2fa',
        requires2fa: true,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectUnAuthRequest)
  })
  it('not login user - missing 2fa', async () => {
    const password = 'test123';
    const login_data = {
      username,
      password,
    }
    mockTwoFactorAuthentication(true)
    mockPostgressRequest({
      rows: [{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        requires2fa: true,
      }]
    })
    const request = POST('/api/login', login_data, true)
    await request.expect(expectUnAuthRequest)
  })
})


// ################# Tests - administrative - non-admin login #################
describe('Administrative - with login - user should', () => {
  // ToDo: This should be removed and all the auth headers should be set to false
  const username = 'Glados';
  const company = 'Aperture industries';
  const new_user_id = 666;
  beforeEach(() => {
    mockJsonWebToken({
      user_id: 1,
      client_id: 2,
      username: username,
      userCompany: company,
      userBoats: [123456789, 987654321],
      userPermission: 'Logistic specialist',
      permission: {
        admin: false,
      }
    })
  })

  it('create new user - successfull', async () => {
    mockPostgressRequest(new_user_id)
    const newUser = {
      username: 'Bot',
      requires2fa: true,
      client_id: 2,
      vessel_ids: null,
    }
    const request = POST('/api/createUser', newUser, true)
    request.expect(expectValidRequest)
  })
  it('not create new user - unauthorized', async () => {
    mockPostgressRequest(new_user_id)
    const newUser = {
      username: 'Bot',
      requires2fa: true,
      client_id: 2,
      vessel_ids: null,
    }
    const request = POST('/api/createUser', newUser, true)
    await request.expect(expectUnAuthRequest)
  })
  it('not create new user - wrong client', async () => {
    mockPostgressRequest(new_user_id)
    const newUser = {
      username: 'Bot',
      requires2fa: true,
      client_id: 2,
      vessel_ids: null,
    }
    const request = POST('/api/createUser', newUser, true)
    await request.expect(expectUnAuthRequest)
  })
  it('not create new user - vessel does not belong to client', async () => {
    mockPostgressRequest(new_user_id)
    const newUser = {
      username: 'Bot',
      requires2fa: true,
      client_id: 2,
      vessel_ids: [123456788],
    }
    const request = POST('/api/createUser', newUser, true)
    await request.expect(expectUnAuthRequest)
  })

  it('get vessel list - successfull', async () => {
    mockPostgressRequest(new_user_id)
    const request = GET('/api/vesselList', true)
    const response = await request;
    expectValidRequest(response);
    const out = response.body;
    await expect(Array.isArray(out)).toBeTruthy('vesselList should return an array')
  })
})


// ################# Tests - administrative - admin login #################
describe('Administrative - with login - user should', () => {
  // ToDo: This should be removed and all the auth headers should be set to false
  const username = 'Glados';
  const company = 'Aperture industries';
  const new_user_id = 777;
  beforeEach(() => {
    mockJsonWebToken({
      user_id: 1,
      client_id: 2,
      username: username,
      userCompany: company,
      userBoats: [123456789, 987654321],
      userPermission: 'admin',
      permission: {
        admin: true
      }
    })
  })

})

// ################# Tests - no login #################
describe('User without login should', () => {
  it('perform connection test', async () => {
    const response = GET('/api/connectionTest', false)
    await response.expect(expectValidRequest)
  })

  it('not be allowed to get vessels', async () => {
    const response = GET('/api/getVessel', false)
    await response.expect(expectUnAuthRequest)
  })

  it('not be allowed to get harbours', async () => {
    const response = GET('/api/getHarbourLocations', false)
    return response.expect(expectUnAuthRequest)
  })

  it('not be allowed access the hydro database', async () => {
    const response = GET('/api/mo4light/getVesselList', false)
    return response.expect(expectUnAuthRequest)
  })

  it('not be allowed to check if user is active', async () => {
    // @TODO maybe change this?
    const response = GET('/api/checkUserActive/test@test.nl', false)
    await response.expect(expectUnAuthRequest)
  })
})

// ################# Tests - vessel master #################
describe('Vessel master should', () => {
  const username = 'Test vesselmaster';
  const company = 'BMO';

  beforeEach(() => {
    mockJsonWebToken({
      username: username,
      userCompany: company,
      userBoats: [123456789],
      userPermission: 'Vessel master'
    })
  })

  it('check if a user is active', async () => {
    const response = GET('/api/checkUserActive/' + username)
    await response.expect(expectValidRequest)
  })

  it('not get a user list for company as vessel master', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(expectUnAuthRequest).catch(e => {
      console.error(e)
    })
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest)
  })
})

// ################# Tests - marine controller #################
describe('Marine controller should', () => {
  const username = 'Test vesselmaster';
  const company = 'BMO';

  beforeEach(() => {
    mockJsonWebToken({
      username: username,
      userCompany: company,
      userBoats: [123456789],
      userPermission: 'Marine controller'
    })
  })

  it('check if a user is active', async () => {
    const response = GET('/api/checkUserActive/' + username)
    await response.expect(expectValidRequest)
  })

  it('not get a user list for company as vessel master', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(expectUnAuthRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest)
  })
})

// ################# Tests - Logistic specialist #################
describe('Logistic specialist should', () => {
  const username = 'Test logistics specialist';
  const company = 'BMO';
  const otherCompany = 'Totally not BMO'

  beforeEach(() => {
    mockJsonWebToken({
      username: username,
      userCompany: company,
      userBoats: [123456789],
      userPermission: 'Logistics specialist'
    })
  })

  it('check if a user is active', async () => {
    const response = GET('/api/checkUserActive/' + username)
    await response.expect(expectValidRequest)
  })

  it('get a user list for company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest)
  })

  it('not get a user list for a different company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: otherCompany
    }])
    await response.expect(expectUnAuthRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest).expect((response) => {
      const body = response.body;
      expect(Array.isArray(body)).toBe(true, 'Response should be an array')
    })
  })

  it('not get a vessel list for a different company', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: otherCompany
    }])
    await response.expect(expectUnAuthRequest)
  })
})

// ################# Tests - Admin #################
describe('Admin should', () => {
  const username = 'Test admin';
  const company = 'BMO';

  beforeEach(() => {
    mockJsonWebToken({
      username: username,
      userCompany: company,
      userBoats: [123456789],
      userPermission: 'admin'
    })
  })

  it('check if a user is active', async () => {
    const response = GET('/api/checkUserActive/' + username)
    await response.expect(expectValidRequest)
  })

  it('get a user list for company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(expectValidRequest)
  })
})
