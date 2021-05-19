const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mock = require('../../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../../helper/validate.server');

// #####################################################################
// ################# Tests - administrative - no login #################
// #####################################################################

/**
 * Performs all login tests
 *
 * @param {Express.Application} app
 * @param {(url: string, auth?: boolean) => request.Test} GET
 * @param {(url: string, data: any, auth?: boolean) => request.Test} POST
 * @api public
 */
module.exports = (app, GET, POST) => {
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

}
