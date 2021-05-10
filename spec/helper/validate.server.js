/**
 * Performs valid request assert. Note: this is an async function
 *
 * @param {object} response
 * @api public
 */
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

