var mongo = require("mongoose")
var Schema = mongo.Schema;

var LatLonSchema = new Schema({
  filename: { type: String },
  SiteName: { type: String },
  centroid: { type: Object },
  outlineLonCoordinates: { type: Array },
  outlineLatCoordinates: { type: Array },
}, { versionKey: false });
var LatLonModel = mongo.model('turbineLocations', LatLonSchema, 'turbineLocations');

var PlatformLocationSchema = new Schema({
  filename: { type: String },
  SiteName: { type: String }
}, { versionKey: false });
var PlatformLocationModel = mongo.model('platformLocations', PlatformLocationSchema, 'platformLocations');

var boatCrewLocationSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number }
}, { versionKey: false });
var CrewLocationModel = mongo.model('crew', boatCrewLocationSchema, 'crew');

var boatLocationSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number }
}, { versionKey: false });
var VesselLocationModel = mongo.model('AISdata', boatLocationSchema, 'AISdata');

var harbourSchema = new Schema({
  name: { type: String },
  centroid: { type: Object },
  lon: { type: Array },
  lat: { type: Array },
}, { versionKey: false });
var HarbourModel = mongo.model('harbourLocations', harbourSchema, 'harbourLocations');


module.exports = {
  VesselLocationModel,
  LatLonModel,
  PlatformLocationModel,
  CrewLocationModel,
  HarbourModel,
}
