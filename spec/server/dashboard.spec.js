const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mock = require('./../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('./../helper/validate.server');

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
  describe('VM should', () => {
    const username = 'Test vesselmaster';
    const company = 'BMO';


    beforeEach(() => {
      mock.mailer(app)();
      mock.jsonWebToken(app, {
        username: username,
        userCompany: company,
        userBoats: [123456789],
        userPermission: 'Vessel master',
        client_id: 1,
        permission: {
          admin: false,
          user_read: false,
        }
      })
    })

    it('not get a user list', async () => {
      mock.pgRequest([{
        active: true,
        userID: 1,
        username: username,
        client_name: company,
        client_id: 1,
        vessel_ids: [1],
        permission: {}
      }])
      const response = GET('/api/getUsers')
      await response.expect(expectUnAuthRequest).catch(e => {
        console.error(e)
      })
    })

    it('get a vessel list', async () => {
      mock.pgRequest([{
        mmsi: 123,
      }])
      const response = GET('/api/vesselList')
      await response.expect(expectValidRequest)
    })

  })
}
