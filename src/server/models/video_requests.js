var mongo = require("mongoose")
var Schema = mongo.Schema;


var videoRequestedSchema = new Schema({
  requestID: Schema.Types.ObjectId,
  username: { type: String },
  mmsi: { type: Number },
  videoPath: { type: String },
  vesselname: { type: String },
  date: { type: Number },
  active: { type: Boolean },
  status: { type: String }
}, { versionKey: false });
var VideoRequestedModel = mongo.model('videoRequests', videoRequestedSchema, 'videoRequests');

var videoBudgetSchema = new Schema({
  mmsi: { type: Number },
  currentBudget: { type: Number },
  maxBudget: { type: Number },
  resetDate: { type: Number }
}, { versionKey: false });
var VideoBudgetModel = mongo.model('videoBudget', videoBudgetSchema, 'videoBudget');

module.exports = {
  VideoRequestedModel,
  VideoBudgetModel
}
