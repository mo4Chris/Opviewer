"use strict";
const pino = require("pino");
const env = require("./env");
const logger = pino({ level: env.LOGGING_LEVEL });

/**
 * Verifies whether or not a user has permission to view data based on mmsi
 *
 * @param {any} req Request
 * @param {Response} res
 * @param {(tf) => void} callback
 * @returns {void};
 */
function validatePermissionToViewVesselData(req, res, callback) {
  logger.trace("Validating permission to view vessel data");
  const token = req["token"];
  const mmsi = req.body["mmsi"] ?? req["params"].mmsi;
  if (token.permission.admin) return callback(true);

  if (!token.permission.user_see_all_vessels_client) {
    logger.debug("Verifying vessel are included in token");
    const user_vessels = token.userBoats;
    const mmsi_in_token = checkPermission(user_vessels.map((v) => v.mmsi));
    if (!mmsi_in_token)
      return res.onUnauthorized(
        `Usertoken error: unauthorized for vessel ${mmsi}`
      );
  }

  const client_id = token.client_id;
  const query = `SELECT v."mmsi"
  FROM "vesselTable" v
  where $1=ANY(v."client_ids")
  `;
  logger.debug("Getting client vessels from admin db");
  connections.admin
    .query(query, [client_id])
    .then((sqlresponse) => {
      logger.trace("Got sql response!");
      const client_vessel_mmsi = sqlresponse.rows.map((r) => r.mmsi);
      const mmsi_in_token = checkPermission(client_vessel_mmsi);
      logger.debug("Getting client vessels from admin db");
      if (!mmsi_in_token)
        return res.onUnauthorized(`User not authorized for vessel ${mmsi}`);
      callback(true);
    })
    .catch(res.onError);

  function checkPermission(verified_mmsi_list = [0]) {
    if (Array.isArray(mmsi)) {
      const some_mmsi_not_valid = mmsi.some((body_mmsi) => {
        const has_match = verified_mmsi_list.some(
          (_mmsi) => _mmsi == body_mmsi
        );
        return !has_match; // true iff no match found
      });
      return !some_mmsi_not_valid;
    } else {
      return verified_mmsi_list.some((_mmsi) => _mmsi == mmsi);
    }
  }
}

module.exports = {
  validatePermissionToViewVesselData,
};
