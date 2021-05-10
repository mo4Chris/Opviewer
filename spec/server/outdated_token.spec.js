const request = require('supertest');
const rewire = require('rewire');
const mock = require('../helper/mocks.server')

module.exports = (app) => {
  function GET(url, auth = true) {
    const req = request(app)
      .get(url)
      .set('Content-Type', 'application/json')
    if (auth) return req.set('Authorization', 'test token')
    return req;
  }

  async function assertOutdatedResponse(response) {
    return expect(response.status).toEqual(460, `Expected outdated token (460)`)
  }

  describe('Expect outdated token', () => {
    it('should return 460 - outdated token', async () => {
      mock.pgRequest([{
        mmsi: 123,
      }])
      const response = GET('/api/vesselList')
      await assertOutdatedResponse(response)
    })
  })
}
