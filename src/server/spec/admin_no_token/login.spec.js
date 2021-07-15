const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mock = require('../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../helper/validate.server');

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
  describe('Administrative - no login - user should', () => {
    // ToDo: This should be removed and all the auth headers should be set to false
    const username = 'test@test123.com';
    const userID = 1;
    const password = 'test123';
    const company = 'BMO';

    beforeEach(() => {
      mock.mailer();
      mock.jsonWebToken(app, {
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
      mock.pgRequest([true]);
      const request = GET('/api/admin/connectionTest', use_authentication_header);
      request.expect(expectValidRequest)
      const response = await request;
      expect(response.status).toBe(200, 'Failed admin connection test!')
      await expect(response.body['status']).toBe(1, 'Connection test not returning true!')
    })

    // ================= SET PASSWORD ==================
    it('set password for user', async () => {
      const user_requires_2fa = true;
      const valid_user_registration_form = {
        passwordToken: "some_valid_token",
        password: 'val1dP@ssw0rd',
        confirmPassword: 'val1dP@ssw0rd',
        secret2fa: 'some_valid_2fa_code',
        confirm2fa: '123456',
      }
      mock.twoFactor(true);
      mock.pgRequest([{
          username: 'test123',
          requires2fa: user_requires_2fa,
          secret2fa: ''
        }])
      const request = POST("/api/setPassword", valid_user_registration_form, false)
      await request.expect(expectValidRequest)
    })
    it('not set password with missing 2fa', async () => {
      const user_requires_2fa = true;
      const invalid_user_registration_form = {
        passwordToken: "some_valid_token",
        password: 'val1dP@ssw0rd',
        confirmPassword: 'val1dP@ssw0rd',
        secret2fa: null,
      }
      mock.pgRequest([{
          username: 'test123',
          requires2fa: user_requires_2fa,
          secret2fa: ''
        }])
      const request = POST("/api/setPassword", invalid_user_registration_form, false)
      await request.expect(expectBadRequest);
    })
    it('not set password with bad / used token', async () => {
      const valid_user_registration_form = {
        passwordToken: "some_valid_token",
        password: 'val1dP@ssw0rd',
        confirmPassword: 'val1dP@ssw0rd',
        secret2fa: 'valid2fa',
      }
      mock.pgRequest([])
      const request = POST("/api/setPassword", valid_user_registration_form, false)
      await request.expect(expectBadRequest);
    })

    // ============= REGISTRATION ==================
    it('get registration information for a valid token', async () => {
      const registration_token = 'valid_token';
      const request_data = {
        username,
        registration_token,
      }
      mock.pgRequest([{
        username: username,
        requires2fa: true
      }])
      const response = POST('/api/getRegistrationInformation', request_data, false)
      await response.expect(expectValidRequest);
    })
    it('not get registration information for an invalid token', async () => {
      const registration_token = 'Invalid token';
      const request_data = {
        username,
        registration_token,
      }
      mock.pgRequest([])
      const response = POST('/api/getRegistrationInformation', request_data, false)
      await response.expect(expectBadRequest);
    })


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
      mock.twoFactor(true)
      mock.pgRequest([{
        active: 1,
        user_id: userID,
        client_name: "BMO",
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'valid_2fa',
        permission: {admin: false},
        requires2fa: true,
      }])
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
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: null,
        requires2fa: false,
      }])
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
      mock.twoFactor(true)
      mock.pgRequest([{
          active: 0,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'valid_2fa',
        requires2fa: true
      }])
      const request = POST('/api/login', login_data, true)
      await request.expect(expectUnAuthRequest)
    })
    it('not login user - missing password', async () => {
      const login_data = {
        username,
        secret2fa: "bad_2fa"
      }
      mock.twoFactor(true)
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }])
      const request = POST('/api/login', login_data, true)
      await request.expect(expectBadRequest)
    })
    it('not login user - missing username', async () => {
      const login_data = {
        password,
        secret2fa: "bad_2fa"
      }
      mock.twoFactor(true)
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }])
      const request = POST('/api/login', login_data, true)
      await request.expect(expectBadRequest)
    })
    it('not login user - bad password', async () => {
      const login_data = {
        username,
        password,
        secret2fa: "bad_2fa"
      }
      mock.twoFactor(true)
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync('invalid password', 10),
        secret2fa: 'valid_2fa',
        requires2fa: true,
      }])
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
      mock.twoFactor(false)
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        secret2fa: 'invalid_2fa',
        requires2fa: true,
      }])
      const request = POST('/api/login', login_data, true)
      await request.expect(expectUnAuthRequest)
    })
    it('not login user - missing 2fa', async () => {
      const password = 'test123';
      const login_data = {
        username,
        password,
      }
      mock.twoFactor(true)
      mock.pgRequest([{
        active: 1,
        userID,
        username,
        password: bcrypt.hashSync(password, 10),
        requires2fa: true,
      }])
      const request = POST('/api/login', login_data, true)
      await request.expect(expectUnAuthRequest)
    })
  })
}
