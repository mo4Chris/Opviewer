const twoFactor = require('node-2fa');
const { Client, Pool } = require('pg');


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
 *  userID?: number,
 *  username?: string,
 *  permission?: object,
 *  userPermission: string, // Depricated
 *  userCompany?: string,
 *  userBoats?: number[],
 *  client_id?: number,
 *  forecast_client_id?: number,
 *  expires?: number,
 *  iat?: number
 * }} decoded_token
 * @api public
 */
function mockJsonWebToken(app, decoded_token) {
  const default_token = {
    userID: 1,
    active: 1,
  }
  const returned_token = {... default_token, ...decoded_token};
  const jwtMock = {
    sign: (token, keyType) => 'test_token',
    verify: (token, keyType) => returned_token
  }
  app.__set__('jwt', jwtMock)
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
function mockMailer(app) {
  return spyOn(app.__get__('transporter'), 'sendMail').and.callFake((mailOpts) => {
    console.log('mailOpts', mailOpts)
    console.log(`Uncaught mail ${mailOpts.subject} to ${mailOpts.to}`)
  })
}

module.exports = {
  jsonWebToken: mockJsonWebToken,
  pgRequest: mockPostgressRequest,
  twoFactor: mockTwoFactorAuthentication,
  mailer: mockMailer,
  mockDemoCheckerMiddelWare,
}

