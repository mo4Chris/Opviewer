const twoFactor = require('node-2fa');
const { Client, Pool } = require('pg');
// const mo4lightServer = require('../../mo4light.server')
const ax = require('axios');
const { ThrowStmt } = require('@angular/compiler');


/**
 * Mocks an express named middleware step. Mocks the first callback matching the desired name.
 *
 * @param {object} app Express application
 * @param {string} name Name of the function to be mocked
 * @param {(req: object, res: object, next: function) => void} callback
 * @returns {{
 *   handle: (req: object, res: object, next: function) => void,
 *   name: string,
 *   params: string[],
 *   path: string,
 *   keys: any,
 *   regexp: string,
 *   route: string
 * }} Returns an express router layer
 * @api public
 */
function mockExpressLayer(app, name, callback) {
  if (app == null) throw Error('Mocking express middleware requires app')
  const callbacks = app._router.stack;
  const middleware = callbacks.find(cb => cb.name == name)
  if (middleware == null) throw Error(`Failed to find named express layer ${name}`)
  spyOn(middleware, 'handle').and.callFake(callback);
  return middleware;
}


/**
 * Mocks the verifyDemoAccount middleware layer
 *
 * @param {object} app
 * @param {(req: object, res: object, next: function) => void} callback
 * @api public
 */
function mockDemoCheckerMiddelWare(app, callback=(req, res, next) => next()) {
  return mockExpressLayer(app, 'verifyDemoAccount', callback)
}

/**
 * Mocks the web token which is assigned to req['token'].
 * @param {object} app
 * @param {{
 *  active?: number,
 *  userID?: number,
 *  username?: string,
 *  permission?: object,
 *  userPermission?: string, // Depricated
 *  userCompany?: string,
 *  userBoats?: number[],
 *  client_id?: number,
 *  forecast_client_id?: number,
 *  expires?: number,
 *  iat?: number,
 *  demo_project_id?: number
 * }} decoded_token
 * @api public
 */
function mockJsonWebToken(app, decoded_token) {
  const base_token = {
    active: true,
    userID: 1,
    username: 'test@user.nl',
    client_name: 'McTestable',
    client_id: 2,
    vessel_ids: [3]
  }
  const base_permissions = {
    user_type: 'demo',
    admin: false,
    user_read: true,
    demo: false,
    user_manage: true,
    twa: true,
    dpr: {
      read: true,

    },
    longterm: {
      read: true
    },
    forecast: {
      read: true,
      changeLimits: true,
      createProject: true,
    },
    demo_project_id: null,
  }
  const token = {...base_token, ...decoded_token};
  token['permission'] = {...base_permissions, ...decoded_token.permission};
  return mockExpressLayer(app, 'verifyToken', (req, res, next) => {
    req['token'] = token;
    next();
  })
}


/**
 * Mocks the returned token which is assigned during the express middleware steps
 *
 * @param {array} return_values
 * @api public
 */
 function mockPostgressRequest(return_values = []) {
  const sqlresponse = {
    rowCount: return_values.length,
    rows: return_values,
  }
  spyOn(Pool.prototype, 'query').and.returnValue(
    Promise.resolve(sqlresponse)
  )
  spyOn(Client.prototype, 'query').and.returnValue(
    Promise.resolve(sqlresponse)
  )
}

/**
 * Mocks the returned token which is assigned during the express middleware steps,
 * but for multiple (different) responses.
 *
 * @param {array} return_values
 * @api public
 */
function mockPostgressRequests(return_values = [[]]) {
  const sqlresponse = (return_value) => {
    return {
      rowCount: return_value.length,
      rows: return_value,
    }
  }
  let index = 0;
  const returnData = () => {
    const N = return_values.length;
    const input = index >= N ? return_values[N-1] : return_values[index]
    index++;
    return Promise.resolve(sqlresponse(input));
  }
  spyOn(Pool.prototype, 'query').and.callFake(returnData)
  spyOn(Client.prototype, 'query').and.callFake(returnData)
}


/**
 * Mocks the 2fa middle ware checker step.
 *
 * @param {boolean} valid
 * @api public
 */
function mockTwoFactorAuthentication(valid = true) {
  let secret2faSpy = spyOn(twoFactor, 'verifyToken');
  if (valid) {secret2faSpy.and.returnValue(1)}
}


/**
 * Mocks the mailer, causing any uncaught mails not to trigger actual email but rather an error.
 *
 * @param {object} app
 * @api public {(mailOpts: object) => void}
 */
function mockMailer(app, callback = UncaughtMailCallback) {
  return spyOn(app.__get__('transporter'), 'sendMail').and.callFake(callback);
}
function UncaughtMailCallback(mailOpts)  {
  console.log('mailOpts', mailOpts)
  console.log(`Uncaught mail ${mailOpts.subject} to ${mailOpts.to}`)
}

/**
 * Mocks forecast requests
 *
 * @param {any} data Data returned by the forecast API
 * @param {number} response_code Response code returned by the forecast API
 * @api public {(mailOpts: object) => void}
 */
function mockForecastApiRequest(data, response_code=null) {
  const default_response_code = data != null ? 200 : 500;
  const dataPromise = Promise.resolve({
    data: data,
    statusCode: response_code ?? default_response_code,
    status: response_code ?? default_response_code,
    text: 'mocked'
  });
  // const dataPromise = new Response(data)
  spyOn(ax.default, 'get').and.returnValue(dataPromise)
  spyOn(ax.default, 'post').and.returnValue(dataPromise)
  spyOn(ax.default, 'put').and.returnValue(dataPromise)
}
function mockForecastApiRequests(datas = [{data: null, response_code:500}]) {
  const default_response_code = 200;
  let index = 0;

  const returnData = () => {
    const input = index >= datas.length ? datas[datas.length-1] : datas[index]
    index++;
    return Promise.resolve({
      data: input.data,
      statusCode: input.response_code ?? default_response_code,
      status: input.response_code ?? default_response_code,
      text: 'mocked'
    });
  }
  spyOn(ax.default, 'get').and.callFake(returnData)
  spyOn(ax.default, 'post').and.callFake(returnData)
  spyOn(ax.default, 'put').and.callFake(returnData)
}


module.exports = {
  jsonWebToken: mockJsonWebToken,
  pgRequest: mockPostgressRequest,
  pgRequests: mockPostgressRequests,
  twoFactor: mockTwoFactorAuthentication,
  mailer: mockMailer,
  mockDemoCheckerMiddelWare,
  mockExpressLayer,
  mockForecastApiRequest,
  mockForecastApiRequests,
}

