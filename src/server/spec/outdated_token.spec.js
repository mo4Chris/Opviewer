const request = require('supertest');
const rewire = require('rewire');
const mock = require('./helper/mocks.server')
const jwt = require('jsonwebtoken')

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
    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
    })

    it('should return 460 - outdated token', async () => {
      mock.pgRequest([{
        mmsi: 123,
      }])
      spyOn(jwt, 'verify').and.returnValue({
        'userID': '12',
      });
      const response = await GET('/api/vesselList')
      await assertOutdatedResponse(response)
    })
  })
}
