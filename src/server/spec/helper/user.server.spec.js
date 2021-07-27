const helper = require('../../helper/user');
const mock = require('./mocks.server');
const TokenModel = require('../../models/token.d');

describe('User helper', () => {

  it('should get vessels for user - admin', () => {
    const adminSpy = spyOn(helper, 'getVesselsForAdmin')
    const clientSpy = spyOn(helper, 'getAllVesselsForClient')
    const userSpy = spyOn(helper, 'getAssignedVessels')
    let token = {
      userID: 1,
      client_id: 1,
      permission: {
        admin: true,
        user_see_all_vessels_client: true
      }
    }
    helper.getVesselsForUser(token);
    expect(adminSpy).toHaveBeenCalled();
    expect(clientSpy).not.toHaveBeenCalled();
    expect(userSpy).not.toHaveBeenCalled();
  })
  it('should get vessels for user - logistic specialist', () => {
    const adminSpy = spyOn(helper, 'getVesselsForAdmin')
    const clientSpy = spyOn(helper, 'getAllVesselsForClient')
    const userSpy = spyOn(helper, 'getAssignedVessels')
    let token = {
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: true
      }
    }
    helper.getVesselsForUser(token);
    expect(adminSpy).not.toHaveBeenCalled();
    expect(clientSpy).toHaveBeenCalled();
    expect(userSpy).not.toHaveBeenCalled();
  })
  it('should get vessels for user - other', () => {
    const adminSpy = spyOn(helper, 'getVesselsForAdmin')
    const clientSpy = spyOn(helper, 'getAllVesselsForClient')
    const userSpy = spyOn(helper, 'getAssignedVessels')
    let token = {
      userID: 1,
      client_id: 1,
      permission: {
        admin: false,
        user_see_all_vessels_client: false
      }
    }
    helper.getVesselsForUser(token);
    expect(adminSpy).not.toHaveBeenCalled();
    expect(clientSpy).not.toHaveBeenCalled();
    expect(userSpy).toHaveBeenCalled();
  })


  it('should get vessels for admin', async () => {
    mock.pgRequests([
      [{ // Vessel query
        mmsi: 123456789,
        nicename: 'Test vessel',
        client_ids: [2, 3],
        active: true,
        operations_class: 'CTV',
        vessel_id: 2,
      }],
      [{ // Client query
        mmsi: 123456789,
        array_agg: ['Aperture']
      }]
    ]);
    const token = {
      userID: 1,
      client_id: 1,
      permission: {admin: true},
    }
    const result = await helper.getVesselsForAdmin(token);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [2, 3],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: ['Aperture']
    }])
  })
  it('should not get vessels for admin - not admin', async () => {
    const token = {
      userID: 1,
      client_id: 1,
      permission: {admin: false},
    }
    try {
      await helper.getVesselsForAdmin(token);
      fail('Should have thrown an error')
    } catch (err) {
      expect(err.message).toMatch('Unauthorized user')
    }
  })
  it('should not get vessels for admin - no valid clients', async () => {
    mock.pgRequests([
      [{ // Vessel query
        mmsi: 123456789,
        nicename: 'Test vessel',
        client_ids: [2, 3],
        active: true,
        operations_class: 'CTV',
        vessel_id: 2,
      }],
      [{ // Client query
        mmsi: 123456780,
        array_agg: ['Aperture']
      }]
    ]);
    const token = {
      userID: 1,
      client_id: 1,
      permission: {admin: true},
    }
    const result = await helper.getVesselsForAdmin(token);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [2, 3],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: []
    }])
  })
  it('should get vessels for admin - bad client value', async () => {
    mock.pgRequests([
      [{ // Vessel query
        mmsi: 123456789,
        nicename: 'Test vessel',
        client_ids: [2, 3],
        active: true,
        operations_class: 'CTV',
        vessel_id: 2,
      }],
      [{ // Client query
        mmsi: 123456789,
        array_agg: null
      }]
    ]);
    const token = {
      userID: 1,
      client_id: 1,
      permission: {admin: true},
    }
    const result = await helper.getVesselsForAdmin(token);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [2, 3],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: []
    }])
  })


  it('should get all vessels for client', async () => {
    mock.pgRequests([
      [{ // Vessel query
        mmsi: 123456789,
        nicename: 'Test vessel',
        client_ids: [2, 3],
        active: true,
        operations_class: 'CTV',
        vessel_id: 2,
      }]
    ]);
    const token = {
      userID: 1,
      client_id: 2,
      permission: {user_see_all_vessels_client: true},
    }
    const result = await helper.getAllVesselsForClient(token);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [2, 3],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: []
    }])
  })
  it('should not get all vessels for client - no permission', async () => {
    const token = {
      userID: 1,
      client_id: 2,
      permission: {user_see_all_vessels_client: false},
    }
    try {
      await helper.getVesselsForAdmin(token);
      fail('Should have thrown an error')
    } catch (err) {
      expect(err.message).toMatch('Unauthorized user')
    }
  })


  it('should get assigned vessels', async () => {
    mock.pgRequests([
      [{ // Vessel query
        mmsi: 123456789,
        nicename: 'Test vessel',
        client_ids: [2, 3],
        active: true,
        operations_class: 'CTV',
        vessel_id: 2,
      }]
    ]);
    const token = {
      userID: 1,
      client_id: 2,
      permission: {user_see_all_vessels_client: false},
    }
    const result = await helper.getAssignedVessels(token.userID);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [2, 3],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: []
    }])
  })


  it('should getAllVesselsForClientByUsername - not admin', async () => {
    const token = {userID: 0, client_id: 5, permission: {admin: false, user_see_all_vessels_client: true}}
    const username = 'test@test.nl';
    mock.pgRequest([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      vessel_id: 2,
      active: true,
      operations_class: 'CTV',
    }])
    const result = await helper.getAllVesselsForClientByUsername(token, username);
    expect(result).toEqual([{
      mmsi: 123456789,
      nicename: 'Test vessel',
      client_ids: [5],
      active: true,
      operationsClass: 'CTV',
      vessel_id: 2,
      client: []
    }])
  })
  it('not should getAllVesselsForClientByUsername - no permission', async () => {
    const token = {userID: 0, client_id: 1, permission: {admin: false, user_see_all_vessels_client: false}}
    const username = 'test@test.nl';
    try {
      await helper.getAllVesselsForClientByUsername(token, username);
      fail('Should have errored')
    } catch (err) {
      expect(err).toBeTruthy();
    }
  })


  it('should create user', async () => {
    const data = {
      username: 'a', user_type: 'b', requires2fa: true,
      vessel_ids: [1], client_id: 1,
    }
    mock.pgRequest([{
      user_id: 777
    }]);
    spyOn(helper, 'initUserPermission').and.callFake((userID, type) => {
      expect(userID).toEqual(777);
      expect(type).toEqual('b');
    })
    spyOn(helper, 'initUserSettings')
    spyOn(helper, 'generateRandomToken').and.returnValue('abc');
    const out = await helper.createUser(data);
    expect(out).toEqual('abc')
  })


  it('should create demo user', async () => {
    const data = {
      username: 'a', user_type: 'demo', requires2fa: true,
      vessel_ids: [], client_id: 1, password: 'abc', demo_project_id: 1
    }
    mock.pgRequest([{
      user_id: 777
    }]);
    spyOn(helper, 'initUserPermission').and.callFake((userID, type) => {
      expect(userID).toEqual(777);
      expect(type).toEqual('demo');
    })
    spyOn(helper, 'initUserSettings')
    spyOn(helper, 'generateRandomToken').and.returnValue('abc');
    await helper.createDemoUser(data);
  })


  it('should init user settings', async () => {
    mock.pgRequest([]).and.callFake((sql, values) => {
      expect(values[0]).toEqual(100);
      return Promise.resolve(null);
    });
    const promise = await helper.initUserSettings(100);
    expect(promise).toBeFalsy();
  })


  it('should init user permission - demo', async () => {
    mock.pgRequest([]).and.callFake((sql, values) => {
      expect(values[0]).toEqual(100)
      expect(values[1]).toEqual(false) // admin permission
      return Promise.resolve(null);
    });
    const promise = await helper.initUserPermission(100, 'demo');
    expect(promise).toBeFalsy();
  })


  describe('should get permission to manage user', () => {
    let token;
    let requestSpy;
    beforeEach(() => {
      token = {
        userID: 2,
        userBoats: [],
        client_id: 2,
        userCompany: "string",
        userPermission: "Vessel master",
        permission: {
          admin: false,
          user_manage: false,
        },
        username: "test@test.nl",
        hasCampaigns: false,
        expires: 1234567,
        demo_project_id: null,
        iat: 123456
      }
      requestSpy = mock.pgRequest([{
        client_id: 3,
      }])
    })

    it('- admin', async () => {
      token.permission.admin = true;
      const permission = await helper.getPermissionToManageUser(token, 'test@test.nl')
      expect(permission).toBe(true);
    })

    it('- LS (bad client id)', async () => {
      token.permission.user_manage = true;
      const permission = await helper.getPermissionToManageUser(token, 'test@test.nl')
      expect(permission).toBe(false);
    })

    it('- LS', async () => {
      token.permission.user_manage = true;
      token.permission.client_id = 3;
      const permission = await helper.getPermissionToManageUser(token, 'test@test.nl')
      expect(permission).toBe(false);
    })

    it('- other users', async () => {
      const permission = await helper.getPermissionToManageUser(token, 'test@test.nl')
      expect(permission).toBe(false);
    })

    it('- target user does not exist', async () => {
      token.permission.user_manage = true;
      requestSpy.and.returnValue({rowCount: 0, rows: []});
      try {
        await helper.getPermissionToManageUser(token, 'test@test.nl');
        fail('Should have errored');
      } catch (err) {
        expect(err.message).toEqual('No active user found')
      }
    })
  })
})
