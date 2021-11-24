"use strict";
const { validatePermissionToViewVesselData } = require("./validation");

/**
 * Wraps a promise around validatePermissionToViewVesselData so it can
 * be used in async functions or promise chains.
 *
 * Please see the documentation for the original function for more information.
 *
 * @param {Request} req The Express request object
 * @param {Response} res The Express response object
 * @returns {Boolean} true or false, depending on permission status
 */
function promiseValidatePermissionToViewVesselData(req, res) {
  return new Promise((resolve, reject) => {
    validatePermissionToViewVesselData(req, res, (status) => {
      if (status) {
        resolve(status);
      }
      reject(status);
    });
  });
}

module.exports = {
  promiseValidatePermissionToViewVesselData,
};
