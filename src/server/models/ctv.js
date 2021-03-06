var mongo = require("mongoose")
var Schema = mongo.Schema;

var generalSchema = new Schema({
  mmsi: { type: Number },
  vesselname: { type: String },
  date: { type: Number },
  minutesFloating: { type: Number },
  minutesInField: { type: Number },
  distancekm: { type: Number },
  DPRstats: { type: Object },
  inputStats: { type: Object }
}, { versionKey: false });
var GeneralModel = mongo.model('general', generalSchema, 'general');

var TransferSchema = new Schema({
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
  videoDurationMinutes: { type: Number }
}, { versionKey: false });
var TransferModel = mongo.model('transfers', TransferSchema, 'transfers');

var CommentsChangedSchema = new Schema({
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
  date: { type: Number }
}, { versionKey: false });
var CommentsChangedModel = mongo.model('CommentsChanged', CommentsChangedSchema, 'CommentsChanged');

var transitSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number },
  lat: { type: Array },
  lon: { type: Array }
}, { versionKey: false });
var TransitsModel = mongo.model('transits', transitSchema, 'transits');

var hasSailedSchemaCTV = new Schema({
  mmsi: { type: Number },
  date: { type: Number },
  distancekm: { type: Number },
}, { versionKey: false, strictQuery: true, strict: true });
var HasSailedModelCTV = mongo.model('hasSailedModel', hasSailedSchemaCTV, 'general');

var engineData = new Schema({
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
var EngineDataModel = mongo.model('engine', engineData, 'engine');


module.exports = {
  GeneralModel,
  TransferModel,
  CommentsChangedModel,
  TransitsModel,
  HasSailedModelCTV,
  EngineDataModel,
}
