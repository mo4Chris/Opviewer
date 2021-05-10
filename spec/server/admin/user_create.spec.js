const mock = require('../../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../../helper/validate.server');

/**
 * Performs all user creation tests
 *
 * @param {Express.Application} app
 * @param {(url: string, auth?: boolean) => request.Test} GET
 * @param {(url: string, data: any, auth?: boolean) => request.Test} POST
 * @api public
 */
module.exports = (app, GET, POST) => {
  // ################# Tests - administrative - non-admin login #################
  describe('Administrative - with login - user should', () => {
    // ToDo: This should be removed and all the auth headers should be set to false
    const username = 'Glados';
    const company = 'Aperture industries';
    const new_user_id = 666;
    const client_id = 2;
    beforeEach(() => {
      mock.mailer(app);
      mock.jsonWebToken(app, {
        userID: 1,
        client_id,
        username: username,
        userCompany: company,
        userBoats: [123456789, 987654321],
        userPermission: 'Logistic specialist',
        permission: {
          admin: false,
          user_type: 'Logistic specialist',
          user_read: true,
          demo: true,
          user_manage: true,
        }
      })
      mock.mockDemoCheckerMiddelWare(app)
    })

    it('create new user - successfull - admin', async () => {
      mock.jsonWebToken(app, {
        userID: 1,
        client_id: 2,
        username: username,
        userCompany: company,
        userBoats: null,
        userPermission: 'admin',
        permission: {
          admin: true,
          user_type: 'admin'

        }
      })
      mock.pgRequest([new_user_id])
      const newUser = {
        username: 'Bot',
        requires2fa: true,
        client_id: 2,
        vessel_ids: null,
      }
      const request = POST('/api/createUser', newUser, true)
      await request.expect(expectValidRequest)
    })
    it('create new user - successfull', async () => {
      mock.pgRequest([new_user_id])
      const newUser = {
        username: 'Bot',
        requires2fa: true,
        client_id: 2,
        vessel_ids: [123456789, 987654321],
      }
      const request = POST('/api/createUser', newUser, true)
      await request.expect(expectValidRequest)
    })
    it('not create new user - cannot assign all vessels to new user as user w/ limited vessels', async () => {
      mock.pgRequest([new_user_id])
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
      mock.pgRequest([new_user_id])
      const newUser = {
        username: 'Bot',
        requires2fa: true,
        client_id: 5,
        vessel_ids: [123456789, 987654321],
      }
      const request = POST('/api/createUser', newUser, true)
      await request.expect(expectUnAuthRequest)
    })
    it('not create new user - vessel does not belong to client', async () => {
      mock.pgRequest([new_user_id])
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
      mock.pgRequest([new_user_id])
      const request = GET('/api/vesselList', true)
      const response = await request;
      expectValidRequest(response);
      const out = response.body;
      await expect(Array.isArray(out)).toBeTruthy('vesselList should return an array')
    })

    it('reset password', () => {
      // Note user is logistic specialist
      const reset_username = 'forgot@my.email'
      mock.pgRequest([{
        username: reset_username,
        client_id,
      }])
      const request = POST("/api/resetPassword", {username, reset_username})
      return request.expect(expectValidRequest)
    })
  })
}
