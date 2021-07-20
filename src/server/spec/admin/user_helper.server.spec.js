var connections = require('../../helper/connections');
const mock = require('../helper/mocks.server');
var helper = require('../../helper/user');

describe('User helper functions', () => {
  it('should get vessels for user', async () => {
    const output =[{
      vessel_id: 1,
      mmsi: 123456789,
      nicename: "vessel_1",
      active: true,
      operations_class: "CTV",
      client_ids: []
    }]
    mock.pgRequest(output)
    const vessels = await helper.getVesselsForUser({
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: false,
      }
    });
    expect(vessels).toEqual(output);
  })

  it('should get vessels for admin', async () => {
    const spy1 = spyOn(helper, 'getVesselsForAdmin').and.returnValue(Promise.resolve([]))
    const spy2 = spyOn(helper, 'getAllVesselsForClient').and.returnValue(Promise.resolve([]))
    const spy3 = spyOn(helper, 'getAssignedVessels').and.returnValue(Promise.resolve([]))
    const vessels = await helper.getVesselsForUser({
      userID: 1,
      client_id: 1,
      permission: {
        admin: true,
        user_see_all_vessels_client: false,
      }
    });
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
  })

  it('should get vessels for client', async () => {
    const spy1 = spyOn(helper, 'getVesselsForAdmin').and.returnValue(Promise.resolve([]))
    const spy2 = spyOn(helper, 'getAllVesselsForClient').and.returnValue(Promise.resolve([]))
    const spy3 = spyOn(helper, 'getAssignedVessels').and.returnValue(Promise.resolve([]))
    const vessels = await helper.getVesselsForUser({
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: true,
      }
    });
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
  })

  it('should get vessels for normal user', async () => {
    const spy1 = spyOn(helper, 'getVesselsForAdmin').and.returnValue(Promise.resolve([]))
    const spy2 = spyOn(helper, 'getAllVesselsForClient').and.returnValue(Promise.resolve([]))
    const spy3 = spyOn(helper, 'getAssignedVessels').and.returnValue(Promise.resolve([]))
    const vessels = await helper.getVesselsForUser({
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: false,
      }
    });
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  })

  it('should not get vessels for user if none are found', async () => {
    const output = [];
    mock.pgRequest(output)
    const vessels = await helper.getVesselsForUser({
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: false,
      }
    });
    expect(vessels).toEqual([]);
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
