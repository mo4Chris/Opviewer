var mongo = require("mongoose")
var Schema = mongo.Schema;


var SovGeneralSchema = new Schema({
  day: { type: String },
  dayNum: { type: Number },
  vesselname: { type: String },
  mmsi: { Type: Number },
  weatherConditions: { type: Object },
  timeBreakdown: { type: Object },
  seCoverageHours: { type: String },
  distancekm: { type: String },
  arrivalAtHarbour: { type: String },
  departureFromHarbour: { type: String },
  lon: { type: Array },
  lat: { type: Array },
  time: { type: Array }
}, { versionKey: false });
var SovGeneralModel = mongo.model('SOV_general', SovGeneralSchema, 'SOV_general');

var SovInfoSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: Array },
  mmsi: { type: Number },
  active: { type: Boolean },
  operationsClass: { type: String },
  daughtercraft_mmsi: { type: Number },
}, { versionKey: false });
var SovInfoModel = mongo.model('sovInfo', SovInfoSchema, 'sovInfo');

var SovPlatformTransfers = new Schema({
  vesselname: { type: String },
  mmsi: { type: Number },
  locationname: { type: String },
  Tentry1000mWaitingRange: { type: Number },
  TentryExclusionZone: { type: Number },
  arrivalTimePlatform: { type: Number },
  departureTimePlatform: { type: Number },
  timeInWaitingZone: { type: Number },
  approachTime: { type: Number },
  visitDuration: { type: Number },
  totalDuration: { type: Number },
  gangwayDeployedDuration: { type: String },
  gangwayReadyDuration: { type: String },
  timeGangwayDeployed: { type: String },
  timeGangwayReady: { type: String },
  timeGangwayRetracted: { type: String },
  timeGangwayStowed: { type: String },
  peakWindGust: { type: String },
  peakWindAvg: { type: String },
  windArray: { type: Object },
  gangwayUtilisation: { type: String },
  gangwayUtilisationTrace: { type: Object },
  gangwayUtilisationLimiter: { type: String },
  alarmsPresent: { type: String },
  motionsEnvelope: { type: String },
  peakHeave: { type: String },
  DPutilisation: { type: String },
  positionalStability: { type: String },
  positionalStabilityRadius: { type: String },
  current: { type: String },
  Hs: { type: String },
  angleToAsset: { type: Number },
  distanceToAsset: { type: Number },
  lon: { type: Number },
  lat: { type: Number },
  paxCntEstimate: { type: String },
  TexitExclusionZone: { type: Number },
  date: { type: Number },
  paxIn: { type: Number },
  paxOut: { type: Number },
  cargoIn: { type: Number },
  cargoOut: { type: Number }
}, { versionKey: false });
var SovPlatformTransfersModel = mongo.model('SOV_platformTransfers', SovPlatformTransfers, 'SOV_platformTransfers');

var SovTurbineTransfers = new Schema({
  vesselname: { type: String },
  mmsi: { type: Number },
  location: { type: String },
  startTime: { type: Number },
  stopTime: { type: Number },
  duration: { type: Number },
  fieldname: { type: String },
  gangwayDeployedDuration: { type: Number },
  gangwayReadyDuration: { type: String },
  timeGangwayDeployed: { type: Number },
  timeGangwayReady: { type: String },
  timeGangwayRetracted: { type: String },
  timeGangwayStowed: { type: Number },
  peakWindGust: { type: Number },
  peakWindAvg: { type: String },
  gangwayUtilisation: { type: String },
  gangwayUtilisationLimiter: { type: String },
  alarmsPresent: { type: String },
  motionsEnvelope: { type: String },
  peakHeave: { type: String },
  angleToAsset: { type: Number },
  DPutilisation: { type: String },
  positionalStabilityRadius: { type: String },
  current: { type: String },
  approachTime: { type: String },
  Hs: { type: String },
  Ts: { type: String },
  lon: { type: Number },
  lat: { type: Number },
  paxCntEstimate: { type: String },
  detector: { type: String },
  gangwayUtilisationTrace: { type: String },
  positionalStability: { type: String },
  windArray: { type: Object },
  date: { type: Number },
  paxIn: { type: Number },
  paxOut: { type: Number },
  cargoIn: { type: Number },
  cargoOut: { type: Number }
});
var SovTurbineTransfersModel = mongo.model('SOV_turbineTransfers', SovTurbineTransfers, 'SOV_turbineTransfers');

var SovTransits = new Schema({
  from: { type: String },
  fromName: { type: String },
  to: { type: String },
  toName: { type: String },
  day: { type: String },
  timeString: { type: String },
  dayNum: { type: Number },
  vesselname: { type: String },
  mmsi: { type: Number },
  combineId: { type: Number },
  speedInTransitAvg: { type: Number },
  speedInTransitAvgUnrestricted: { type: String },
  distancekm: { type: Number },
  transitTimeMinutes: { type: Number },
  avHeading: { type: Number },
  date: { type: Number }
});
var SovTransitsModel = mongo.model('SOV_transits', SovTransits, 'SOV_transits');

var SovVessel2vesselTransfers = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  transfers: { type: Object },
  CTVactivity: { type: Object },
  missedTransfers: { type: Object },
});
var SovVessel2vesselTransfersModel = mongo.model('SOV_vessel2vesselTransfers', SovVessel2vesselTransfers, 'SOV_vessel2vesselTransfers');

var sovWaveSpectrumSchema = new Schema({
  date: Number,
  time: Array,
  spectrum: Array,
  active: Boolean,
}, { versionKey: false });
var SovWaveSpectrumModel = mongo.model('sovWaveSpectrum', sovWaveSpectrumSchema, 'SOV_waveSpectrum');

var sovHasV2VTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var SovHasV2vModel = mongo.model('sovHasV2VModel', sovHasV2VTransfersSchema, 'SOV_vessel2vesselTransfers');

var sovHasPlatformTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var SovHasPlatformTransferModel = mongo.model('sovHasPlatformModel', sovHasPlatformTransfersSchema, 'SOV_platformTransfers');

var sovHasTurbineTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var SovHasTurbineTransferModel = mongo.model('sovHasTurbineModel', sovHasTurbineTransfersSchema, 'SOV_turbineTransfers');


var SovDprInput = new Schema({
  liquids: { type: Object },
  toolbox: { type: Array },
  hoc: { type: Array },
  vesselNonAvailability: { type: Array },
  weatherDowntime: { type: Array },
  standBy: { type: Array },
  accessDayType: { type: Object },
  remarks: { type: String },
  catering: { type: Object },
  date: { type: Number },
  mmsi: { type: Number },
  ToolboxAmountOld: { type: Number },
  ToolboxAmountNew: { type: Number },
  HOCAmountOld: { type: Number },
  HOCAmountNew: { type: Number },
  missedPaxCargo: { type: Array },
  helicopterPaxCargo: { type: Array },
  PoB: { type: Object },
  dp: { type: Array },
  signedOff: { type: Object }
});
var SovDprInputModel = mongo.model('SOV_dprInput', SovDprInput, 'SOV_dprInput');

var SovHseDprInput = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  dprFields: { type: Object },
  hseFields: { type: Object },
  signedOff: { type: Object }

});
var SovHseDprInputModel = mongo.model('SOV_hseDprInput', SovHseDprInput, 'SOV_hseDprInput');

var SovRovOperations = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  transfers: { type: Array }
});
var SovRovOperationsModel = mongo.model('SOV_rovOperations', SovRovOperations, 'SOV_rovOperations');

var SovCycleTimes = new Schema({
  startTime: { type: String },
  durationMinutes: { type: Number },
  fieldname: { type: String },
  fromTurbine: { type: String },
  toTurbine: { type: String },
  sailedDistanceNM: { type: Number },
  turbineDistanceNM: { type: Number },
  avgSpeedKts: { type: Number },
  avgMovingSpeedKts: { type: Number },
  maxSpeedKts: { type: Number },
  transferTimeMins: { type: Number },
  movingSpeedAbove5ktsPerc: { type: Number },
  date: { type: Number },
  mmsi: { type: Number }
})
var SovCycleTimesModel = mongo.model('SOV_cycleTimes', SovCycleTimes, 'SOV_cycleTimes');

var portcallSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number },
  startTime: { type: Number },
  stopTime: { type: Number },
  durationHr: { type: Number },
  multidayEventFlag: { type: Boolean },
  location: { type: String },
  plannedUnplannedStatus: { type: String },
  active: { type: Boolean },
})
var PortcallModel = mongo.model('portcalls', portcallSchema, 'portCalls');


module.exports = {
  SovGeneralModel,
  SovInfoModel,
  SovTransitsModel,

  SovPlatformTransfersModel,
  SovTurbineTransfersModel,
  SovVessel2vesselTransfersModel,
  SovCycleTimesModel,

  SovHasTurbineTransferModel,
  SovHasPlatformTransferModel,
  SovHasV2vModel,

  SovDprInputModel,
  SovHseDprInputModel,
  SovRovOperationsModel,
  PortcallModel,
  SovWaveSpectrumModel
}
