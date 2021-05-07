var mongo = require("mongoose")
var Schema = mongo.Schema;


var wavedataSchema = new Schema({
  site: String,
  source: String,
  active: Boolean,
  date: Number,
  wavedata: {
    timeStamp: Array,
    Hs: Array,
    Tp: Array,
    waveDir: Array,
    wind: Array,
    windDir: Array
  },
  meta: Object,
}, { versionKey: false })
var WavedataModel = mongo.model('wavedata', wavedataSchema, 'waveData');

var waveSourceSchema = new Schema({
  site: String,
  name: String,
  active: Boolean,
  lon: Number,
  lat: Number,
  info: String,
  clients: Array,
  provider: String,
  source: {
    Hs: String,
    Tp: String,
    waveDir: String,
    wind: String,
    windDir: String
  }
}, { versionKey: false })
var WaveSourceModel = mongo.model('waveSource', waveSourceSchema, 'waveSources');

module.exports = {
  WavedataModel,
  WaveSourceModel
}

