const mock = require('../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../helper/validate.server');

/**
 * Performs all user creation tests
 *
 * @param {object} app
 * @param {(url: string, auth?: boolean) => request.Test} GET
 * @param {(url: string, data: any, auth?: boolean) => request.Test} POST
 * @api public
 */
module.exports = (app, GET, POST) => {
  // ################# Tests - administrative - non-admin login #################
  describe('UserCreate - with login - user should', () => {
    // ToDo: This should be removed and all the auth headers should be set to false
    const username = 'Glados@aperture.com';
    const company = 'Aperture industries';
    const new_user_id = 666;
    beforeEach(() => {
      mock.mailer();
      mock.mockDemoCheckerMiddelWare(app)
    })

    describe('create new user', () => {
      it('successfully - admin', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Admin',
          permission: {
            admin: true,
          }
        })
        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          requires2fa: true,
          client_id: OWN_CLIENT_ID,
          vessel_ids: null,
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectValidRequest)
      })
      it('successfull - Logistics specialist', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Logistics specialist',
          permission: {
            admin: false,
            user_type: 'Logistics specialist',
            user_read: true,
            demo: true,
            user_manage: true,
            user_see_all_vessels_client: true,
          }
        })

        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          user_type: 'Vessel master',
          requires2fa: true,
          client_id: OWN_CLIENT_ID,
          vessel_ids: [OWN_VESSEL_1, OWN_VESSEL_2],
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectValidRequest)
      })
      it('unsuccessfully - cannot assign all vessels to new user as user w/ limited vessels', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Logistics specialist',
          permission: {
            admin: false,
            user_type: 'Logistics specialist',
            user_read: true,
            demo: true,
            user_manage: true,
            user_see_all_vessels_client: false,
          }
        })
        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          requires2fa: true,
          client_id: OWN_CLIENT_ID,
          vessel_ids: null,
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectUnAuthRequest)
      })
      it('not create new user - wrong client', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Logistics specialist',
          permission: {
            admin: false,
            user_type: 'Logistics specialist',
            user_read: true,
            demo: true,
            user_manage: true,
            user_see_all_vessels_client: false,
          }
        })
        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          requires2fa: true,
          client_id: OTHER_CLIENT_ID,
          vessel_ids: [OWN_VESSEL_1, OWN_VESSEL_2],
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectUnAuthRequest)
      })
      it('not create new user - wrong client', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Logistics specialist',
          permission: {
            admin: false,
            user_type: 'Logistics specialist',
            user_read: true,
            demo: true,
            user_manage: true,
            user_see_all_vessels_client: false,
          }
        })
        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          requires2fa: true,
          client_id: OTHER_CLIENT_ID,
          vessel_ids: [OWN_VESSEL_1, OWN_VESSEL_2],
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectUnAuthRequest)
      })
      it('not create new user - target with admin permissions whilst account is not admin', async () => {
        mock.jsonWebToken(app, {
          userID: 1,
          client_id: OWN_CLIENT_ID,
          username: username,
          userCompany: company,
          userBoats: [OWN_VESSEL_1, OWN_VESSEL_2],
          userPermission: 'Logistics specialist',
          permission: {
            admin: false,
            user_type: 'Logistics specialist',
            user_read: true,
            demo: true,
            user_manage: true,
            user_see_all_vessels_client: true,
          }
        })
        mock.pgRequest([new_user_id])
        const newUser = {
          username: 'Bot@bot.com',
          requires2fa: true,
          user_type: 'admin',
          client_id: OWN_CLIENT_ID,
          vessel_ids: [OTHER_VESSEL],
        }
        const request = POST('/api/createUser', newUser, true)
        await request.expect(expectUnAuthRequest)
      })
    })

    describe('', () => {
      beforeEach(() => {
        mock.jsonWebToken(app, {});
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
        // Note user is Logistics specialist
        const reset_username = 'forgot@my.email'
        mock.pgRequest([{
          username: reset_username,
          client_id: OWN_CLIENT_ID,
        }])
        const request = POST("/api/resetPassword", {username, reset_username})
        return request.expect(expectValidRequest)
      })
    })
  })
}

const ADMIN_CLIENT_ID = 1;
const OWN_CLIENT_ID = 2;
const OTHER_CLIENT_ID = 5;
const OWN_VESSEL_1 = 123456789;
const OWN_VESSEL_2 = 987654321;
const OTHER_VESSEL = 121212121;
