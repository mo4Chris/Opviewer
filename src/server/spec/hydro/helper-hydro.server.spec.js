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
})
