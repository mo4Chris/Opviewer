"use strict";
// Set up logger
const pino = require("pino");
const env = require("./env");
const logger = pino({ level: env.LOGGING_LEVEL });

// Models
const { CtvDprInputModel } = require("../models/ctv.js");

// Misc
const { promiseValidatePermissionToViewVesselData } = require("./promise");
const { isNotDefined } = require("./utils");

// Let's pretend this project uses MVC for a moment.
// This file contains the 'controller' for the CtvDprInput endpoint.
// The 'view' can be found in server.js
// The 'model' that's used can be found in models/ctv

/**
 * @param {Number} mmsi
 * @param {Number} date
 * @returns An object that represents an empty schema for CtvDprInput
 */
function emptyCtvDprInput(mmsi, date) {
  const emptyStats = {
    startOfDay: 0,
    used: 0,
    remainingOnBoard: 0,
    bunkered: 0,
  };

  return {
    mmsi,
    date,
    schemaVersion: 2,
    consumption: {
      fuel: {
        ...emptyStats,
      },
      water: {
        ...emptyStats,
      },
      shorePower: {
        ...emptyStats,
      },
    },
    accessDayType: "",
    amountOfHoursOnHire: 0,
    engineHours: 0,
    weatherDowntime: [],
    HSE: {
      SOCCards: [],
      toolboxTalks: [],
      drills: [],
    },
  };
}

/**
 * GET /api/getCtvDprInput
 * Required multipart form options:
 * - mmsi
 * - date
 *
 * @param {Request} req The Express request
 * @param {Response} res The Express response
 */
async function getCtvDprInput(req, res) {
  await promiseValidatePermissionToViewVesselData(req, res);

  const { mmsi, date } = req.body;
  if (isNotDefined(mmsi)) {
    return res.status(400).send({ error: "mmsi required in body" });
  }
  if (isNotDefined(date)) {
    return res.status(400).send({ error: "date required in body" });
  }
  if (date < 0) {
    return res.status(400).send({ error: "invalid date" });
  }

  const data = await CtvDprInputModel.find({ mmsi, date }).exec();
  if (data.length > 0) {
    // An entry already exists, so we don't need to create a new one.
    return res.status(200).send(data[0]);
  }

  // There is no entry, a fresh one has to be created for this date.
  let newData = {};
  const emptyData = emptyCtvDprInput(mmsi, date);

  // Check for previous entry
  const previousData = await CtvDprInputModel.findOne({
    mmsi,
    date: { $lt: date },
  })
    .sort({ date: -1 })
    .exec();

  if (previousData) {
    logger.info({
      msg: "Using previous CRV DPR input model to set some values",
      mmsi,
      date,
    });

    const { fuel, water, shorePower } = previousData.consumption;
    const emptyStats = { used: 0, remainingOnBoard: 0, bunkered: 0 };

    newData = {
      ...emptyData,
      consumption: {
        fuel: {
          startOfDay: fuel.remainingOnBoard,
          ...emptyStats,
        },
        water: {
          startOfDay: water.remainingOnBoard,
          ...emptyStats,
        },
        shorePower: {
          startOfDay: shorePower.remainingOnBoard,
          ...emptyStats,
        },
      },
    };

    logger.debug({ newData });
  } else {
    // There is no previous entry
    logger.info({ msg: "Generating a new CTV DPR input model", mmsi, date });
    newData = { ...emptyData };
  }

  const ctvDprModelWithNewData = new CtvDprInputModel(newData);
  await ctvDprModelWithNewData.save();
  return res.status(200).send(newData);
}

async function updateCtvDprInputConsumption(req, res) {
  await promiseValidatePermissionToViewVesselData(req, res);

  const { mmsi, date, data } = req.body;
  if (isNotDefined(mmsi)) {
    return res.status(400).send({ error: "mmsi required in body" });
  }
  if (isNotDefined(date)) {
    return res.status(400).send({ error: "date required in body" });
  }
  if (date < 0) {
    return res.status(400).send({ error: "invalid date" });
  }
  if (isNotDefined(data)) {
    return res.status(400).send({ error: "data required in body" });
  }
  const parsed = JSON.parse(data);
  if (typeof parsed !== "object") {
    return res.status(400).send({ error: "invalid data" });
  }

  const { fuel, water, shorePower } = parsed;
  if (!fuel || !water || !shorePower) {
    return res
      .status(400)
      .send({ error: "fuel, water or shorePower is invalid" });
  }

  const response = await CtvDprInputModel.findOneAndUpdate(
    { mmsi, date },
    { consumption: { fuel, water, shorePower } }
  ).exec();

  return res.status(200).send(response);
}

module.exports = {
  getCtvDprInput,
  updateCtvDprInputConsumption,
};
