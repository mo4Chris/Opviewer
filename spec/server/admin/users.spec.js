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
  describe('Admin should', () => {
    const username = 'Test admin';
    const company = 'BMO';

    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
    })

    it('get a user list', async () => {
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
      await response.expect(expectValidRequest)
    })

    it('check if a user is active', async () => {
      mock.pgRequest([{
        active: true,
      }])
      const response = GET('/api/checkUserActive/' + username)
      await response.expect(expectValidRequest)
    })

    it('get a vessel list', async () => {
      mock.pgRequest([{
        mmsi: 123,
      }])
      const response = GET('/api/vesselList')
      await response.expect(expectValidRequest)
    })
  })



  describe('Logistic specialist should', () => {
    const username = 'Test logistics specialist';
    const company = 'BMO';

    beforeEach(() => {
      mock.mailer(app);
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        username: username,
        userCompany: company,
        userBoats: [123456789],
        userPermission: 'Logistics specialist',
        client_id: 1,
        permission: {
          admin: false,
          user_read: true,
          demo: true,
          user_manage: true,
        }
      })
    })

    it('check if a user is active', async () => {
      mock.pgRequest([{
        active: true
      }])
      const response = GET('/api/checkUserActive/' + username)
      await response.expect(expectValidRequest)
    })

    it('get a user list', async () => {
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
      await response.expect(expectValidRequest)
    })
  })



  describe('Marine controller should', () => {
    const username = 'Test vesselmaster';
    const company = 'BMO';

    beforeEach(() => {
      mock.mailer(app);
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        username: username,
        userCompany: company,
        userBoats: [123456789],
        userPermission: 'Marine controller',
        client_id: 1,
        permission: {
          admin: false,
          user_read: true,
        }
      })
    })

    it('check if a user is active', async () => {
      mock.pgRequest([{
        active: true,
      }])
      const response = GET('/api/checkUserActive/' + username)
      await response.expect(expectValidRequest)
    })

    it('get a user list', async () => {
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
      await response.expect(expectValidRequest)
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
