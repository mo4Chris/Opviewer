const { hydro } = require('../../helper/connections');
const mock = require('../helper/mocks.server');

let helper;
describe('Hydro helper functions', () => {
  beforeEach(() => {
    helper = require('../../helper/hydro');
  })

  it('should GET weather providers', async () => {
    const data = {
      metocean_providers: [{name: 'a', id: 1}, {name: 'b', id: 2}]
    }
    mock.mockForecastApiRequest(data);
    expect(await helper.getWeatherProvider(1)).toEqual({name: 'a', id: 1})
    expect(await helper.getWeatherProvider(2)).toEqual({name: 'b', id: 2})
    expect(await helper.getWeatherProvider(3)).toEqual(null)
  })

  it('should GET demo project', async () => {
    const data = {projects: [{
      id: 1,
      name: 'alfa',
      display_name: 'Alpha',
      client_id: 1,
      longitude: 3,
      latitude: 50,
      water_depth: 20,
      maximum_duration: 2,
      activation_start_date: '100',
      activation_end_date: '123',
      client_preferences: null,
      metocean_provider: 'DTN',
      analysis_types: ['CTV'],
      vessel_id: 1
    }]};
    mock.mockForecastApiRequest(data);
    mock.pgRequest([{
      demo_project_id: 1
    }])
    const token = {
      userID: 1,
      client_id: 1,
      permission: {admin: false, demo: true},
      demo_project_id: 1
    }
    const projects = await helper.getDemoProject(token);
    expect(projects.length).toEqual(1)
    expect(projects[0]).toEqual({
      id: 1,
      name: 'alfa',
      nicename: 'Alpha',
      client_id: 1,
      longitude: 3,
      latitude: 50,
      water_depth: 20,
      maximum_duration: 2,
      activation_start_date: '100',
      activation_end_date: '123',
      client_preferences: null,
      metocean_provider: 'DTN',
      analysis_types: [ 'CTV' ],
      vessel_id: 1
    })
  })

  it('should convert datenum to iso 8601', () => {
    const test_date = new Date(Date.UTC(2021, 0, 1, 0, 0, 0));
    expect(helper.toIso8601(test_date)).toEqual('2021-01-01T00:00:00.000+00:00')
  })

  it('should load default project preferences', () => {
    const prefs = helper.getDefaultProjectPreferences();
    expect(prefs).toBeTruthy();
    expect(typeof prefs).toEqual('object');
  })

  it('should get default weather provider id', async () => {
    mock.mockForecastApiRequest({metocean_providers: [{
      name: 'baloni',
      id: 1
    }, {
      name: helper.DEFAULT_WEATHER_PROVIDER_NAME,
      id: 2
    }]})
    const id = await helper.getDefaultMetoceanProviderId();
    expect(id).toEqual(2);
  })

  it('should get default forecast client id', async () => {
    mock.pgRequest([{forecast_client_id: 2}])
    const id = await helper.getDefaultForecastClientId();
    expect(id).toEqual(2);
  })

  describe('- checkProjectPermission:', () => {
    const project1 = {
      id: 1,
      client_id: 1,
      name: 'project_1'
    };
    const project2 = {
      id: 2,
      client_id: 2,
      name: 'project_2'
    }
    const project3 = {
      id: 3,
      client_id: 3,
      name: 'Sample_Project'
    };

    it('should return true as admin', () => {
      const token = {permission: {
        admin: true
      }}
      expect(helper.checkProjectPermission(token, project1)).toBe(true);
      expect(helper.checkProjectPermission(token, project2)).toBe(true);
      expect(helper.checkProjectPermission(token, project3)).toBe(true);
    })

    it('should return false without forecast read permission', () => {
      const token = {permission: {
        admin: false,
        forecast: {read: false}
      }}
      expect(helper.checkProjectPermission(token, project1)).toBe(false);
      expect(helper.checkProjectPermission(token, project2)).toBe(false);
      expect(helper.checkProjectPermission(token, project3)).toBe(false);
    })

    it('should return projects belonging to client', () => {
      const token = {
        permission: {
          admin: false,
          forecast: {read: true}
        },
        client_id: 1,
        demo_project_id: null
      }
      expect(helper.checkProjectPermission(token, project1)).toBe(true);
      expect(helper.checkProjectPermission(token, project2)).toBe(false);
      expect(helper.checkProjectPermission(token, project3)).toBe(true);
    })

    it('should return demo project', () => {
      const token = {
        permission: {
          admin: false,
          demo: true,
          forecast: {read: true}
        },
        client_id: 1,
        demo_project_id: 2
      }
      expect(helper.checkProjectPermission(token, project1)).toBe(true);
      expect(helper.checkProjectPermission(token, project2)).toBe(true);
      expect(helper.checkProjectPermission(token, project3)).toBe(true);
    })
  })

  describe('- checkForecastVesselPermission:', () => {
    // const generic_client_id = 1;
    const vessel_1 = {
      id: 1,
      client_id: 1,
      name: 'vessel_1'
    };
    const vessel_2 = {
      id: 2,
      client_id: 2,
      name: 'vessel_2'
    }
    const vessel_3 = {
      id: 3,
      client_id: 3,
      name: 'vessel_3'
    };

    it('should return true as admin', () => {
      const token = {permission: {
        admin: true
      }}
      expect(helper.checkForecastVesselPermission(token, vessel_1)).toBe(true);
      expect(helper.checkForecastVesselPermission(token, vessel_2)).toBe(true);
      expect(helper.checkForecastVesselPermission(token, vessel_3)).toBe(true);
    })

    it('should return false without forecast read permission', () => {
      const token = {permission: {
        admin: false,
        forecast: {read: false}
      }}
      expect(helper.checkForecastVesselPermission(token, vessel_1)).toBe(false);
      expect(helper.checkForecastVesselPermission(token, vessel_2)).toBe(false);
      expect(helper.checkForecastVesselPermission(token, vessel_3)).toBe(false);
    })

    it('should return projects belonging to client', () => {
      const token = {
        permission: {
          admin: false,
          forecast: {read: true}
        },
        client_id: 3,
      }
      expect(helper.checkForecastVesselPermission(token, vessel_1)).toBe(true);
      expect(helper.checkForecastVesselPermission(token, vessel_2)).toBe(false);
      expect(helper.checkForecastVesselPermission(token, vessel_3)).toBe(true);
    })
  })
})
