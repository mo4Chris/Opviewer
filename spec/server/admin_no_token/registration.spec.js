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
  xdescribe('On registration', () => {
    // These are unsecured methods - we do NOT mock the demoUserCheck

    it('it should register', async () => {
      const response = registerDemoUser({})
      await response.expect(expectValidRequest)
    })

    it('it should not register with invalid username', async () => {
      const response = registerDemoUser({
        username: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid password', async () => {
      const response = registerDemoUser({
        password: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid full name', async () => {
      const response = registerDemoUser({
        full_name: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid company', async () => {
      const response = registerDemoUser({
        company: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid job title', async () => {
      const response = registerDemoUser({
        job_title: null
      })
      await response.expect(expectBadRequest)
    })
  })


  describe('On setting password using sign up link', () => {
    // These are unsecured methods - we do NOT mock the demoUserCheck
    beforeEach(() => {
      mock.twoFactor(true)
    })

    it('it should successfully complete the registration', async () => {
      mock.pgRequest([{
        requires2fa: true,
        user_id: 123,
      }])
      const response = doSetPassword({})
      await response.expect(expectValidRequest)
    })
    it('it should register with invalid 2fa - 2fa not required', async () => {
      mock.pgRequest([{
        requires2fa: false,
        user_id: 123,
      }])
      const response = doSetPassword({
        secret2fa: null
      })
      await response.expect(expectValidRequest)
    })

    it('it should not register with invalid registration token', async () => {
      mock.pgRequest([])
      const response = doSetPassword({
        token: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid password', async () => {
      const response = doSetPassword({
        password: null
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with non-matching confirm password', async () => {
      const response = doSetPassword({
        password: 'test123',
        confirmPassword: 'test124'
      })
      await response.expect(expectBadRequest)
    })
    it('it should not register with invalid 2fa - 2fa required', async () => {
      const response = doSetPassword({
        secret2fa: null
      })
      await response.expect(expectBadRequest)
    })
  })

  function registerDemoUser({
    username = 'Test',
    password = 'test123',
    full_name = 'Demo Test User',
    company = 'Testables',
    job_title = 'Tester',
    phone_number = '06-1236456789'
  }) {
    return POST('/api/createDemoUser', {username, password, full_name, company, job_title, phone_number})
  }
  function doSetPassword({
    token = 'Test',
    password = 'test123',
    confirmPassword = 'test123',
    secret2fa = 'Testables',
  }) {
    return POST('/api/setPassword', {passwordToken: token, password, confirmPassword, secret2fa})
  }
}

