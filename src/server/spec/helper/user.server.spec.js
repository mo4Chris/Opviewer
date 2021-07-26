const helper = require('../../helper/user');
const mock = require('./mocks.server');

describe('User helper', () => {

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
})
