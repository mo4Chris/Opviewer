var connections = require('../../helper/connections');
const mock = require('../helper/mocks.server');

let helper;
describe('Hydro helper functions', () => {
  beforeEach(() => {
    helper = require('../../helper/user');
  })

  it('should get vessels for user', async () => {
    const output =[{vessel_id: 1, mmsi: 123456789, nicename: "vessel_1"}]
    mock.pgRequest(output)
    const vessels = await helper.getVesselsForUser(1);
    expect(vessels).toEqual(output);
  })
  it('should not get vessels for user if none are found', async () => {
    const output = [];
    mock.pgRequest(output)
    const vessels = await helper.getVesselsForUser(1);
    expect(vessels).toEqual(null);
  })

  it('should generate random tokens', () => {
    const token = helper.generateRandomToken();
    expect(token).toBeTruthy();
    expect(token.length).toBe(60)
  })

  it('should generate random tokens', () => {
    const token = helper.generateRandomToken();
    expect(token).toBeTruthy();
    expect(token.length).toBe(60)
  })
})
