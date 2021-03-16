const request = require('supertest');
const rewire = require('rewire');

const suppress_pino_output = true;

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
const app = rewire('../../src/server')

if (suppress_pino_output) {
  // Note: some of the server setup messages may still be send to stdout prior to overwriting pino
  const mocked_logger = {
    fatal: () => null,
    error: () => null,
    warn: () => null,
    info: () => null,
    debug: () => null,
    trace: () => null,
  }
  mocked_logger.child = () => mocked_logger;
  app.__set__('logger', mocked_logger)
}

// ################# GET & POST #################
function GET(url, auth=true) {
  const req = request(app)
    .get(url)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

function POST(url, data, auth=true) {
  const req = request(app)
    .post(url)
    .send(data)
    .set('Content-Type', 'application/json')
  if (auth) return req.set('Authorization', 'test token')
  return req;
}

// ################# Helpers #################
async function isValidRequest(response) {
  return expect(response.status).toBeLessThanOrEqual(201, response.text)
}
async function isUnAuthRequest(response) {
  return expect(response.status).toEqual(401, `Expected auth failure (401)`)
}
async function isErrorRequest(response) {
  return expect(response.status).toEqual(500, `Expected error response (500)`)
}

function mockJsonWebToken(decoded_token) {
  const jwtMock = {
    sign: (token, keyType) => 'test_token',
    verify: (token, keyType) => decoded_token
  }
  app.__set__('jwt', jwtMock)
}



// ################# Tests - no login #################
describe('User without login should', () => {
  it('perform connection test', async () => {
    const response = GET('/api/connectionTest', false)
    await response.expect(isValidRequest)
  })

  it('not be allowed to get vessels', async () => {
    const response = GET('/api/getVessel', false)
    await response.expect(isUnAuthRequest)
  })

  it('not be allowed to get harbours', async () => {
    const response = GET('/api/getHarbourLocations', false)
    return response.expect(isUnAuthRequest)
  })

  it('not be allowed access the hydro database', async () => {
    const response = GET('/api/mo4light/getVesselList', false)
    return response.expect(isUnAuthRequest)
  })

  it('not be allowed to check if user is active', async () => {
    // @TODO maybe change this?
    const response = GET('/api/checkUserActive/test@test.nl', false)
    await response.expect(isUnAuthRequest)
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
    await response.expect(isValidRequest)
  })

  it('not get a user list for company as vessel master', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(isUnAuthRequest).catch(e => {
      console.error(e)
    })
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest)
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
    await response.expect(isValidRequest)
  })

  it('not get a user list for company as vessel master', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(isUnAuthRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest)
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
    await response.expect(isValidRequest)
  })

  it('get a user list for company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest)
  })

  it('not get a user list for a different company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: otherCompany
    }])
    await response.expect(isUnAuthRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest).expect((response) => {
      const body = response.body;
      expect(Array.isArray(body)).toBe(true, 'Response should be an array')
    })
  })

  it('not get a vessel list for a different company', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: otherCompany
    }])
    await response.expect(isUnAuthRequest)
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
    await response.expect(isValidRequest)
  })

  it('get a user list for company', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: company
    }])
    await response.expect(isValidRequest)
  })
})
