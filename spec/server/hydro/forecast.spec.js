const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mock = require('../../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest, expectResponse } = require('../../helper/validate.server');

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
  describe('User without forecast permission', () => {
    it('should return an error when loading projects', () => {
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        permission: NO_FORECAST_USER_PERMISSIONS,
      })
    })
  })

  describe('Demo user', () => {
    const DemoProjectId = DEMO_PROJECT.id;

    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        permission: DEMO_USER_PERMISSIONS,
      })
    })

    it('should GET project response', () => {
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId}`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT]})
      const response = GET(url)
      response.expect(expectValidRequest)
    })
    it('should not GET project response that does not belong to this demo user', () => {
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId + 1}`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT]})
      const response = GET(url)
      response.expect(expectUnAuthRequest)
    })

    it('should GET project list', async () => {
      // TODO: get this out of demo user
      const url = `/api/mo4light/getProjectList`
      mock.mockForecastApiRequest({projects: [CLIENT_PROJECT_1, CLIENT_PROJECT_2]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(2)
    })
    it('should GET projects only which belong to this demo user', async () => {
      const url = `/api/mo4light/getProjectList`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT, CLIENT_PROJECT_1]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(1)
    })
  })
}

const DEMO_USER_PERMISSIONS = {
  admin: false,
  user_read: true,
  user_manage: false,
  dpr: {
    read: false
  },
  longterm: false,
  forecast: {
    read: true,
    write: true,
  }
}

const NO_FORECAST_USER_PERMISSIONS = {
  admin: false,
  user_read: true,
  user_manage: false,
  dpr: {
    read: true
  },
  longterm: false,
  forecast: {
    read: true,
    write: true,
  }
}

const DEMO_PROJECT = {
  id: 12,
  name: 'demo_12345',
  display_name: 'Test Project',
  client_id: 3,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_stop_date: "2021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
}
const CLIENT_PROJECT_1 = {
  id: 12,
  name: 'demo_12345',
  display_name: 'Test Project',
  client_id: 1,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_stop_date: "2021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
}
const CLIENT_PROJECT_2 = {
  id: 12,
  name: 'demo_12345',
  display_name: 'Test Project',
  client_id: 1,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_stop_date: "2021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
}
