const mock = require('../helper/mocks.server')
const request = require('supertest');
const { expectUnAuthRequest, expectBadRequest, expectValidRequest } = require('../helper/validate.server');
const user_helper = require('../../helper/user');
const connections = require('../../helper/connections');
const { promise } = require('protractor');


/**
 * Performs all login tests
 *
 * @param {Express.Application} app
 * @param {(url: string, auth?: boolean) => request.Test} GET
 * @param {(url: string, data: any, auth?: boolean) => request.Test} POST
 * @api public
 */
 module.exports = (app, GET, POST) => {
  const target_username = 'turret@aperture.com';
  const target_user_id = 2;

  describe('Admin should', () => {
    const username = 'Test admin';

    let manageUserPermissionSpy = jasmine.createSpy();
    let updateSpy = jasmine.createSpy();

    beforeEach(() => {
      mock.jsonWebToken(app, {username, permission: {admin: true}})
      mock.mockDemoCheckerMiddelWare(app)
      manageUserPermissionSpy = spyOn(user_helper, 'getPermissionToManageUser')
      updateSpy = spyOn(connections.admin, 'query');
      spyOn(user_helper, 'getIdForUser').and.returnValue(Promise.resolve(target_user_id))
    })

    it('should update', async () => {
      manageUserPermissionSpy.and.returnValue(true);
      updateSpy.and.callFake((_query, _values) => {
        expect(_values.length).toBe(9);
        expect(_values[0]).toEqual(target_user_id); // target userID
        expect(_values[1]).toEqual(true); // read
        expect(_values[2]).toEqual(false); // demo
        expect(_values[3]).toEqual(false); // manage
        expect(_values[4]).toEqual(false); // twa
        expect(_values[5]).toEqual({
          ctv: {read: true, write: false},
          sov: {read: true}
        }); // dpr
        expect(_values[6]).toEqual({read: true}); // longterm
        expect(_values[7]).toEqual('test'); // type
        expect(_values[8]).toEqual({read: true}); // forecast
        return Promise.resolve(null)
      })
      let body = getUpdateUserBody({
        user_read: true,
        demo: false,
        user_manage: false,
        twa: false,
        dpr: {
          ctv: {read: true, write: false},
          sov: {read: true}
        },
        longterm: {read: true},
        user_type: 'test',
        forecast: {read: true}
      }); // ToDo: this model should fail
      let response = POST('/api/updateUserPermissions', body);
      await response.expect(expectValidRequest);
      expect(updateSpy).toHaveBeenCalled();
    })

    it('should not update permissionse on bad input', async () => {
      let body = getUpdateUserBody(null);
      let response = POST('/api/updateUserPermissions', body);
      await response.expect(expectBadRequest);
    })

    it('should not update w/out permission to manage user', async () => {
      manageUserPermissionSpy.and.returnValue(false);
      let body = getUpdateUserBody({admin: true});
      let response = POST('/api/updateUserPermissions', body);
      await response.expect(expectUnAuthRequest);
    })
  })


  function getUpdateUserBody(permission) {
    const updateUserPermissionsModel = {
      permission: permission,
      username: target_username
    }
    return updateUserPermissionsModel;
  }
}

