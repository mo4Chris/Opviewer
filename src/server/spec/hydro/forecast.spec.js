const mock = require('../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest, expectResponse } = require('../helper/validate.server');

// #####################################################################
// ################# Tests - administrative - no login #################
// #####################################################################

/**
 * Performs all login tests
 *
 * @param {Express.Application} app
 * @param {(url: string, auth?: boolean) => request.Test} GET
 * @param {(url: string, data: any, auth?: boolean) => request.Test} POST
 * @param {(url: string, data: any, auth?: boolean) => request.Test} PUT
 * @api public
 */
module.exports = (app, GET, POST, PUT) => {
  describe('User without forecast permission', () => {
    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
    })

    // it('should return an error when loading projects', () => {
    //   mock.mockDemoCheckerMiddelWare(app)
      // mock.jsonWebToken(app, {
      //   permission: NO_FORECAST_USER_PERMISSIONS,
      // })
    // })

    it('should not GET project list', async () => {
      // TODO: get this out of demo user
      const url = `/api/mo4light/getProjectList`
      mock.mockForecastApiRequest({projects: [CLIENT_PROJECT_1, CLIENT_PROJECT_2]});
      mock.jsonWebToken(app, {
        permission: NO_FORECAST_USER_PERMISSIONS,
      });
      const response = GET(url)
      // await response.expect(expectUnAuthRequest);
      await response.expect(expectBadRequest);
    })
  })

  describe('Demo user', () => {
    const DemoProjectId = DEMO_PROJECT.id;

    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        permission: DEMO_USER_PERMISSIONS,
        demo_project_id: DemoProjectId
      })
    })

    it('should GET project', () => {
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = `/api/mo4light/getProject`
      const payload = {project_name: DEMO_PROJECT.name}
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT]})
      const response = POST(url, payload)
      return response.expect(expectValidRequest)
    })
    it('should GET project response', () => {
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId}`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT]})
      const response = GET(url)
      return response.expect(expectValidRequest)
    })
    it('should not GET project response that does not belong to this demo user', async () => {
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = `/api/mo4light/getResponseForProject/${DemoProjectId + 1}`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT]})
      const response = GET(url)
      await response.expect(expectUnAuthRequest)
    })
    it('should GET projects only which belong to this demo user', async () => {
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = `/api/mo4light/getProjectList`
      mock.mockForecastApiRequest({projects: [DEMO_PROJECT, CLIENT_PROJECT_1]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(1)
    })

    it('should GET generic vessels', async () => {
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = `/api/mo4light/getVesselList`
      mock.mockForecastApiRequest({vessels: [GENERIC_VESSEL, CLIENT_VESSEL, OTHER_CLIENT_VESSEL]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(1)
    })
    it('should PUT projects', async () => {
      mock.mockForecastApiRequest({
        id: DemoProjectId,
        display_name: 'Good little project'
      })
      mock.pgRequest([{demo_project_id: DemoProjectId}])
      const url = '/api/mo4light/projectSettings';
      const project_name = 'test_project_1'
      const response = await PUT(url, {
        project_name,
        project_settings: {
          display_name: 'New fancy name'
        }
      })
      expect(response.status).toBe(200)
      const output = response.body.data;
      expect(output).toBe('Successfully saved project!')
    });
    it('should not PUT generic demo project', async () => {
      mock.mockForecastApiRequest({display_name: 'Good little project'})
      mock.pgRequests([
        [{demo_project_id: DemoProjectId}]
      ])
      const url = '/api/mo4light/projectSettings';
      const project_name = 'Sample_Project'
      const response = await PUT(url, {
        project_name,
        project_settings: {}
      }).catch(err => {
        console.log('err', err)
      })
      expectUnAuthRequest(response)
    });
  })

  describe('Client user', () => {
    beforeEach(() => {
      mock.mockDemoCheckerMiddelWare(app)
      mock.jsonWebToken(app, {
        client_id: CLIENT_CLIENT_ID,
        permission: CLIENT_USER_PERMISSIONS,
      })
    })

    // PROJECTS
    it('should GET project list', async () => {
      const url = `/api/mo4light/getProjectList`
      mock.mockForecastApiRequest({projects: [CLIENT_PROJECT_1, CLIENT_PROJECT_2]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(2)
    })
    it('should GET generic & own client vessels', async () => {
      const url = `/api/mo4light/getVesselList`
      mock.mockForecastApiRequest({vessels: [GENERIC_VESSEL, CLIENT_VESSEL, OTHER_CLIENT_VESSEL]})
      const response = GET(url)
      const response_data = await response;
      expect(response_data.body.length).toEqual(2)
      expect(response_data.body[0]).toEqual({
        id: 'generic_vessel',
        nicename: 'Generic test vessel',
        type: 'CTV',
        length: 10,
        width: 2,
        draft: 2,
        gm: 10,
        client_id: GENERIC_VESSEL_CLIENT_ID,
        analysis_types: ['Standard']
      })
    })
    it('should GET project', () => {
      const url = `/api/mo4light/getProject`
      const payload = {project_name: CLIENT_PROJECT_1.name}
      mock.mockForecastApiRequest(CLIENT_PROJECT_1)
      const response = POST(url, payload)
      return response.expect(expectValidRequest)
    })
    it('should not GET project from other client', () => {
      const url = `/api/mo4light/getProject`
      const payload = {project_name: OTHER_CLIENT_PROJECT.name}
      mock.mockForecastApiRequest(OTHER_CLIENT_PROJECT)
      const response = POST(url, payload)
      return response.expect(expectUnAuthRequest)
    })
    it('should not GET project with empty payload', () => {
      const url = `/api/mo4light/getProject`
      const payload = {}
      mock.mockForecastApiRequest(CLIENT_PROJECT_1)
      const response = POST(url, payload)
      return response.expect(expectBadRequest)
    })

    // Project related
    it('should GET project locations', async () => {
      const url = '/api/forecastProjectLocations'
      const projects = [DEMO_PROJECT, CLIENT_PROJECT_1, CLIENT_PROJECT_2, OTHER_CLIENT_PROJECT]
      mock.mockForecastApiRequest({projects})
      const response = GET(url);
      const data = await response;
      const locs = data.body;
      expect(locs.length).toEqual(2);
      expect(locs[0]).toEqual({
        nicename: CLIENT_PROJECT_1.display_name,
        lon: CLIENT_PROJECT_1.longitude,
        lat: CLIENT_PROJECT_1.latitude,
        id:  CLIENT_PROJECT_1.id
      })
    })
    it('should save project settings', () => {
      const url = '/api/mo4light/projectSettings';
      const update_obj = {
        display_name: 'TEST123'
      }
      const data = {
        project_name: CLIENT_PROJECT_1.name,
        project_settings: update_obj
      }
      mock.mockForecastApiRequest(CLIENT_PROJECT_1)
      const response = PUT(url, data)
      return response.expect(expectValidRequest)
    })
    it('should not save project settings for other clients', () => {
      const url = '/api/mo4light/projectSettings';
      const update_obj = {
        display_name: 'TEST123'
      }
      const data = {
        project_name: OTHER_CLIENT_PROJECT.name,
        project_settings: update_obj
      }
      mock.mockForecastApiRequest(OTHER_CLIENT_PROJECT)
      const response = PUT(url, data)
      return response.expect(expectUnAuthRequest)
    })

    // RESPONSE
    it('should GET response', () => {
      const url = `/api/mo4light/getResponseForProject/${CLIENT_PROJECT_1.id}`;
      const CLIENT_PROJECTS = [CLIENT_PROJECT_1, CLIENT_PROJECT_2];
      mock.mockForecastApiRequests([
        {data: {projects: CLIENT_PROJECTS}, response_code: 200},
        {data: CLIENT_RESPONSE_1, response_code: 200},
      ]);
      const response = GET(url);
      return response.expect(expectValidRequest);
    })
    it('should not GET response for other project', () => {
      const url = `/api/mo4light/getResponseForProject/${OTHER_CLIENT_RESPONSE.project_id}`;
      const CLIENT_PROJECTS = [CLIENT_PROJECT_1, CLIENT_PROJECT_2];
      mock.mockForecastApiRequests([
        {data: {projects: CLIENT_PROJECTS}, response_code: 200},
        {data: CLIENT_RESPONSE_1, response_code: 200},
      ]);
        // [CLIENT_PROJECTS, CLIENT_RESPONSE_1]);
      const response = GET(url);
      return response.expect(expectUnAuthRequest);
    })

    // Weather - TODO

    // ADMIN - NO ACCESS
    it('should not GET clients', () => {
      const url = `/api/mo4light/getClients`
      mock.mockForecastApiRequest({clients: [{name: 'test'}]})
      const response = GET(url)
      return response.expect(expectUnAuthRequest)
    })

    it('should not PUT generic demo project', async () => {
      mock.mockForecastApiRequest({display_name: 'Good little project'})
      mock.pgRequests([
        [{demo_project_id: CLIENT_PROJECT_1.id}]
      ])
      const url = '/api/mo4light/projectSettings';
      const project_name = 'Sample_Project'
      const response = await PUT(url, {
        project_name,
        project_settings: {}
      }).catch(err => {
        console.log('err', err)
      })
      expectUnAuthRequest(response)
    });
  })
}

const GENERIC_CLIENT_ID = 4;
const GENERIC_VESSEL_CLIENT_ID = 1;
const CLIENT_CLIENT_ID = 6;
const OTHER_CLIENT_ID = 7;
const DEMO_USER_PERMISSIONS = {
  admin: false,
  user_read: true,
  user_manage: false,
  demo: true,
  dpr: {
    read: false
  },
  longterm: false,
  forecast: {
    read: true,
    write: true,
  }
}
const CLIENT_USER_PERMISSIONS = {
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
const NO_FORECAST_USER_PERMISSIONS = {
  admin: false,
  user_read: true,
  user_manage: false,
  dpr: {
    read: true
  },
  longterm: false,
  forecast: {
    read: false,
    write: false,
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
  activation_end_date: "3021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
  analysis_types: ['Standard'],
}
const CLIENT_PROJECT_1 = {
  id: 13,
  name: 'project_client_1',
  display_name: 'Client Project 1',
  client_id: CLIENT_CLIENT_ID,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_end_date: "3021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
  analysis_types: ['Standard']
}
const CLIENT_PROJECT_2 = {
  id: 14,
  name: 'project_client_2',
  display_name: 'Client Project 2',
  client_id: CLIENT_CLIENT_ID,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_end_date: "3021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
  analysis_types: ['Standard']
}
const OTHER_CLIENT_PROJECT = {
  id: 15,
  name: 'project_other_client',
  display_name: 'Other Client Project',
  client_id: OTHER_CLIENT_ID,
  longitude: 1,
  latitude: 2,
  water_depth: 20,
  maximum_duration: 180,
  activation_start_date: "2020-02-10T09:44:17.881913+00:00",
  activation_end_date: "3021-02-10T09:44:17.881913+00:00",
  client_preferences: {},
  vessel_id: 1,
  analysis_types: ['Standard']
}
const GENERIC_VESSEL = {
  id: 'generic_vessel',
  display_name: 'Generic test vessel',
  type: 'CTV',
  length: 10,
  width: 2,
  draft: 2,
  gm: 10,
  client_id: GENERIC_VESSEL_CLIENT_ID,
  analysis_types: ['Standard']
}
const CLIENT_VESSEL = {
  id: 'client_vessel',
  display_name: 'Specific client test vessel',
  type: 'CTV',
  length: 100,
  width: 20,
  draft: 20,
  gm: 100,
  client_id: CLIENT_CLIENT_ID,
  analysis_types: ['Standard']
}
const OTHER_CLIENT_VESSEL = {
  id: 'client_vessel',
  display_name: 'Specific client test vessel',
  type: 'CTV',
  length: 100,
  width: 20,
  draft: 20,
  gm: 100,
  client_id: OTHER_CLIENT_ID,
  analysis_types: ['Standard']
}

const CLIENT_RESPONSE_1 = {
  id: 101,
  client_id: CLIENT_CLIENT_ID,
  project_id: CLIENT_PROJECT_1.id,
  response: {},
  client_preferences: {}
}
const OTHER_CLIENT_RESPONSE = {
  id: 103,
  client_id: OTHER_CLIENT_ID,
  project_id: OTHER_CLIENT_PROJECT.id,
  response: {},
  client_preferences: {}
}

