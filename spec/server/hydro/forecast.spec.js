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
    const DemoProjectId = 777;

    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        permission: DEMO_USER_PERMISSIONS,
      })
    })

    it('should GET project response', () => {
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId}`
      mock.pgRequest(['Great success'])
      const response = GET(url)
      response.expect(expectValidRequest)
    })
    it('should not GET project response that does not belong to this demo user', () => {
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId + 1}`
      mock.pgRequest(['Great success'])
      const response = GET(url)
      response.expect(expectUnAuthRequest)
    })

    it('should GET project list', () => {
      const url = `/api/mo4light/getProjectList`
      mock.pgRequest(['Great success'])
      const response = GET(url)
      response.expect(expectValidRequest)
    })
    fit('should GET projects only which belong to this demo user', async () => {
      const url = `/api/mo4light/getProjectList`
      mock.pgRequest({projects: ['Great success']})
      const response = GET(url)
      // response.expect(expectUnAuthRequest.body)
      const response_data = await response;
      expect(response_data.body.length).toBeGreaterThan(0)
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
