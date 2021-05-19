var mongo = require("mongoose")
var Schema = mongo.Schema;

var turbineWarrantySchema = new Schema({
  activeFleet: { type: Array },
  fullFleet: { type: Array },
  validFields: { type: Array },
  startDate: { type: Number },
  stopDate: { type: Number },
  windfield: { type: String },
  numContractedVessels: { type: Number },
  campaignName: { type: String },
  weatherDayTarget: { type: Number },
  weatherDayForecast: { type: Array },
  Dates: { type: Array },
  sailMatrix: { type: Array },
  currentlyActive: { type: Array },
  client: { type: String },
  lastUpdated: { type: Number }
}, { versionKey: false });
var TurbineWarrantyModel = mongo.model('TurbineWarranty_Historic', turbineWarrantySchema, 'TurbineWarranty_Historic');

var turbineWarrantyRequestSchema = new Schema({
  fullFleet: { type: Array },
  activeFleet: { type: Array },
  client: { type: String },
  windfield: { type: String },
  startDate: { type: Number },
  stopDate: { type: Number },
  numContractedVessels: { type: Number },
  campaignName: { type: String },
  weatherDayTarget: { type: Number },
  weatherDayTargetType: { type: String },
  limitHs: { type: Number },
  user: { type: String },
  requestTime: { type: Number }
}, { versionKey: false });
var TurbineWarrantyRequestModel = mongo.model('TurbineWarranty_Request', turbineWarrantyRequestSchema, 'TurbineWarranty_Request');

var sailDayChangedSchema = new Schema({
  vessel: { type: String },
  date: { type: Number },
  changeDate: { type: Number },
  fleetID: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  userID: { type: String }
}, { versionKey: false });
var SailDayChangedModel = mongo.model('sailDayChanged', sailDayChangedSchema, 'sailDayChanged');

var vesselsToAddToFleetSchema = new Schema({
  mmsi: { type: Number },
  vesselname: { type: String },
  dateAdded: { type: Number },
  campaignName: { type: String },
  windfield: { type: String },
  startDate: { type: Number },
  status: { type: String },
  username: { type: String },
  client: { type: String }
}, { versionKey: false });
var VesselsToAddToFleetModel = mongo.model('vesselsToAddToFleet', vesselsToAddToFleetSchema, 'vesselsToAddToFleet');

var activeListingsSchema = new Schema({
  vesselname: { type: String },
  dateStart: { type: Object },
  dateEnd: { type: Object },
  fleetID: { type: String },
  listingID: { type: String },
  deleted: { type: Boolean },
  dateChanged: { type: Number },
  user: { type: String }
}, { versionKey: false });
var ActiveListingsModel = mongo.model('activeListings', activeListingsSchema, 'activeListings');


module.exports = {
  TurbineWarrantyModel,
  TurbineWarrantyRequestModel,
  SailDayChangedModel,
  VesselsToAddToFleetModel,
  ActiveListingsModel
}
