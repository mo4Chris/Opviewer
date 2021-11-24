"use strict";

// Third party dependencies
const mongo = require("mongoose");
const { Schema } = mongo;

const generalSchema = new Schema(
  {
    mmsi: { type: Number },
    vesselname: { type: String },
    date: { type: Number },
    minutesFloating: { type: Number },
    minutesInField: { type: Number },
    distancekm: { type: Number },
    DPRstats: { type: Object },
    inputStats: { type: Object },
  },
  { versionKey: false }
);
const GeneralModel = mongo.model("general", generalSchema, "general");

const TransferSchema = new Schema(
  {
    mmsi: { type: Number },
    vesselname: { type: String },
    date: { type: Number },
    startTime: { type: Number },
    stopTime: { type: Number },
    duration: { type: Number },
    location: { type: String },
    fieldname: { type: String },
    paxUp: { type: Number },
    paxDown: { type: Number },
    cargoUp: { type: Number },
    cargoDown: { type: Number },
    comment: { type: String },
    commentChanged: { type: Object },
    detector: { type: String },
    videoAvailable: { type: Number },
    videoPath: { type: String },
    videoDurationMinutes: { type: Number },
  },
  { versionKey: false }
);
const TransferModel = mongo.model("transfers", TransferSchema, "transfers");

const CommentsChangedSchema = new Schema(
  {
    mmsi: { type: Number },
    oldComment: { type: String },
    newComment: { type: String },
    idTransfer: { type: String },
    otherComment: { type: String },
    commentChanged: { type: Object },
    userID: { type: String },
    processed: { type: String },
    paxUp: { type: Number },
    paxDown: { type: Number },
    cargoUp: { type: Number },
    cargoDown: { type: Number },
    date: { type: Number },
  },
  { versionKey: false }
);
const CommentsChangedModel = mongo.model(
  "CommentsChanged",
  CommentsChangedSchema,
  "CommentsChanged"
);

const transitSchema = new Schema(
  {
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number },
    lat: { type: Array },
    lon: { type: Array },
  },
  { versionKey: false }
);
const TransitsModel = mongo.model("transits", transitSchema, "transits");

const hasSailedSchemaCTV = new Schema(
  {
    mmsi: { type: Number },
    date: { type: Number },
    distancekm: { type: Number },
  },
  { versionKey: false, strictQuery: true, strict: true }
);
const HasSailedModelCTV = mongo.model(
  "hasSailedModel",
  hasSailedSchemaCTV,
  "general"
);

const engineData = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  c02TotalKg: { type: Number },
  fuelPerHour: { type: Array },
  fuelPerHourDepart: { type: Number },
  fuelPerHourReturn: { type: Number },
  fuelPerHourTotal: { type: Number },
  fuelPerHourTransfer: { type: Number },
  fuelUsedDepartM3: { type: Number },
  fuelUsedReturnM3: { type: Number },
  fuelUsedTotalM3: { type: Number },
  fuelUsedTransferM3: { type: Number },
  speed: { type: Array },
  timeStamp: { type: Array },
});
const EngineDataModel = mongo.model("engine", engineData, "engine");

const CtvDprInput = new Schema({
  date: Number,
  mmsi: Number,
  schemaVersion: { type: Number, default: 2 },
  consumption: {
    fuel: {
      startOfDay: Number,
      used: Number,
      remainingOnBoard: Number,
      bunkered: Number,
    },
    water: {
      startOfDay: Number,
      used: Number,
      remainingOnBoard: Number,
      bunkered: Number,
    },
    shorePower: {
      startOfDay: Number,
      used: Number,
      remainingOnBoard: Number,
      bunkered: Number,
    },
  },
  accessDayType: { type: String, default: "" },
  amountOfHoursOnHire: Number,
  engineHours: Number,
  weatherDowntime: [
    {
      decidedBy: String,
      from: String,
      to: String,
    },
  ],
  HSE: {
    SOCCards: [
      {
        inputReason: String,
        amount: Number,
      },
    ],
    toolboxTalks: [
      {
        inputReason: String,
        amount: Number,
      },
    ],
    drills: [
      {
        inputReason: String,
        involvedPassengers: Boolean,
        amount: Number,
      },
    ],
  },
});
const CtvDprInputModel = mongo.model(
  "CTV_dprInput",
  CtvDprInput,
  "CTV_dprInput"
);

module.exports = {
  GeneralModel,
  TransferModel,
  CommentsChangedModel,
  TransitsModel,
  HasSailedModelCTV,
  EngineDataModel,
  CtvDprInputModel,
};
