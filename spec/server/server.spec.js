const request = require('supertest');


process.env.TEST_MODE = '1';

const app = require('../../src/server')

const username = process.env.USER ?? 'masterctv@bmo-offshore.com';
const password = process.env.PASSWORD ?? 'hanspasswordtocheck';

let serverApiTestKey

function GET(url, auth=true) {
  const req = request(app)
    .get(url)
    .set('Content-Type', 'application/json')
  if (auth) {
    if (!serverApiTestKey) return null
    return req.set('Authorization', serverApiTestKey)
  }
  return req;
}
function POST(url, data, auth=true) {
  const req = request(app)
    .post(url)
    .send(data)
    .set('Content-Type', 'application/json')
  if (auth) {
    if (!serverApiTestKey) return null
    return req.set('Authorization', serverApiTestKey)
  }
  return req;
}

async function isValidRequest(response) {
  return expect(response.status).toBeLessThanOrEqual(201, 'Got non-200 response code')
}
async function isUnAuthRequest(response) {
  return expect(response.status).toEqual(401, `Expected auth failure (401)`)
}
async function isErrorRequest(response) {
  return expect(response.status).toEqual(500, `Expected error response (500)`)
}

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
    const response = GET('/api/checkUserActive/' + username, false)
    await response.expect(isUnAuthRequest)
  })
})

describe('Authenticated user should', () => {
  beforeAll( async () => {
    const response = await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send({
        username: username,
        password: password
      }).catch(err => {
        throw Error('Failed to set up initial jwt token!')
      })
    if (response.status != 200) throw Error('Failed to set up initial jwt token!')
    const body = response.body;
    serverApiTestKey = body["token"]
  })

  it('check if a user is active', async () => {
    const response = GET('/api/checkUserActive/' + username)
    await response.expect(isValidRequest)
  })

  it('not get a user list for company as vessel master', async () => {
    const response = POST('/api/getUsersForCompany', [{
      client: 'BMO'
    }])
    await response.expect(isUnAuthRequest)
  })

  it('get a vessel list', async () => {
    const response = POST('/api/getVesselsForCompany', [{
      client: 'BMO'
    }])
    await response.expect(isValidRequest)
  })

})
