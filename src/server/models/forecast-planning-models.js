var mongo = require("mongoose")
var Schema = mongo.Schema;

var forecastSovActiviesSchema = new Schema({
  name: { type: String },
  forecast_id: { type: Number },
  date: { type: String },
  list_of_activities: { type: Array }
}, { versionKey: false });
var forecastSovActiviesModel = mongo.model('Forecast_SOV_activities', forecastSovActiviesSchema, 'Forecast_SOV_activities');

var forecastSovActivityOptionsSchema = new Schema({
  name: { type: String },
  forecast_id: { type: Number },
  activity_options: { type: Array }
}, { versionKey: false });
var forecastSovActivityOptionsModel = mongo.model('Forecast_SOV_activity_options', forecastSovActivityOptionsSchema, 'Forecast_SOV_activity_options');

module.exports = {
  forecastSovActiviesModel,
  forecastSovActivityOptionsModel
}