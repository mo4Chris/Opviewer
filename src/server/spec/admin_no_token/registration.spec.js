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
  describe('On registration', () => {
    // These are unsecured methods - we do NOT mock the demoUserCheck
    const demo_client_id = 4;
    const demo_forecast_client_id = 5;
    const primary_metocean_provider_id = 1;
    const client_info_vals = [{client_id: demo_client_id}]; // Returns demo client
    const user_exists_vals = []; // User does not exist
    const create_project_response = {id: 3};
    const create_user_vals = [{user_id: 2}]
    const create_user_permission_vals = []
    const create_user_settings_vals = []
    const get_default_forecast_client_vals = [{forecast_client_id: demo_forecast_client_id}]
    const get_default_metocean_provider_response = {
      metocean_providers: [{
        id: primary_metocean_provider_id,
        name: 'infoplaza'
      }]
    }

    let mailSpy;
    beforeEach(() => {
      mock.pgRequests([
        client_info_vals,
        user_exists_vals,
        get_default_forecast_client_vals,
        create_user_vals,
        create_user_permission_vals,
        create_user_settings_vals
      ])
      mock.mockForecastApiRequests([
        {data: get_default_metocean_provider_response, response_code: 200},
        {data: create_project_response, response_code: 201},
      ]);
      mailSpy = mock.mailer(() => {})
    })

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

    it('it should not register invalid user types', async () => {
      const response = registerDemoUser({
        user_type: 'Bad user type'
      })
      await response.expect(expectBadRequest)
      const out = await response;
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
        user_id: 123
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
        secret2fa: undefined
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
    username = 'Test@test.com',
    user_type = 'demo',
    password = 'teSt#123',
    full_name = 'Demo Test User',
    company = 'Testables',
    job_title = 'Tester',
    phone_number = '061236456789',
    requires2fa = 1,
    vessel_ids = [],
  }) {
    const out = {username, user_type, password, full_name, company, job_title, vessel_ids,
      requires2fa, phoneNumber: phone_number,
    }
    return POST('/api/createDemoUser', out)
  }
  function doSetPassword({
    token = 'Test',
    password = 'Test123!',
    confirmPassword = 'Test123!',
    secret2fa = 'Testablesforever',
    confirm2fa = '123456',
  }) {
    return POST('/api/setPassword', {
      passwordToken: token,
      password,
      confirmPassword,
      secret2fa,
      confirm2fa
    });
  }
}

