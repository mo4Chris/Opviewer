const twoFactor = require('node-2fa')
const {Pool, Client} = require('pg')

exports.expectValidRequest = async function (response) {
  return expect(response.status).toBeLessThanOrEqual(201, response.text)
}
exports.expectUnAuthRequest = async function (response) {
  return expect(response.status).toEqual(401, `Expected auth failure (401)`)
}
exports.expectBadRequest = async function (response) {
  return expect(response.status).toEqual(400, `Expected bad request (400)`)
}
exports.expectErrorRequest = async function (response) {
  return expect(response.status).toEqual(500, `Expected error response (500)`)
}
exports.expectResponse = function (responseData, additionalInfo) {
  return async (response) => await expect(response.data).toEqual(responseData, additionalInfo)
}
// exports.mockPostgressRequest = function (return_value) {
//   spyOn(Pool.prototype, 'query').and.returnValue(
//     Promise.resolve(return_value)
//   )
//   spyOn(Client.prototype, 'query').and.returnValue(
//     Promise.resolve(return_value)
//   )
// }
// exports.mockTwoFactorAuthentication = function (valid = true) {
//   let secret2faSpy = spyOn(twoFactor, 'verifyToken');
//   if (valid) {secret2faSpy.and.returnValue(1)}
// }
