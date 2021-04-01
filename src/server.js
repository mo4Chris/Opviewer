var express = require('express');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/./../.env' });
var pino = require('pino');
var mo4lightServer = require('./server/mo4light.server.js')
var fileUploadServer = require('./server/file-upload.server.js')
var mo4AdminServer = require('./server/administrative.server.js')
var mo4AdminPostLoginServer = require('./server/admin.postlogin.server.js')
var { Pool } = require('pg')
var args = require('minimist')(process.argv.slice(2));



//#########################################################
//########## These can be configured via stdin ############
//#########################################################
const SERVER_ADDRESS  = args.SERVER_ADDRESS ?? process.env.IP_USER.split(",")[0]  ?? 'bmodataviewer.com';
const WEBMASTER_MAIL  = args.SERVER_PORT    ?? process.env.EMAIL                  ?? 'webmaster@mo4.online'
const SERVER_PORT     = args.SERVER_PORT    ?? 8080;
const DB_CONN         = args.DB_CONN        ?? process.env.DB_CONN;
const LOGGING_LEVEL   = args.LOGGING_LEVEL  ?? process.env.LOGGING_LEVEL          ?? 'info'


//#########################################################
//############ Saving values to process env  ##############
//#########################################################
process.env.SERVER_ADDRESS = SERVER_ADDRESS;
process.env.WEBMASTER_MAIL = WEBMASTER_MAIL;
process.env.SERVER_PORT = SERVER_PORT;
process.env.DB_CONN = DB_CONN;
process.env.LOGGING_LEVEL = LOGGING_LEVEL;



//#########################################################
//########### Init up application middleware  #############
//#########################################################
var app = express();

var logger = pino({level: LOGGING_LEVEL})

mongo.set('useFindAndModify', false);
var db = mongo.connect(DB_CONN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err, response) {
  if (err) return logger.fatal(err);
  logger.info('Connected to mongo database');
}).catch(err => {
  logger.fatal(err);
});

app.get("/api/connectionTest", function(req, res) {
  logger.debug('Hello world');
  res.send("Hello World");
})

app.use(bodyParser.json({ limit: '5mb' })); // bodyParser depricated
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  const allowedOrigins = process.env.IP_USER;
  const origin = req.headers.origin;
  const hasMultipleOrigins = allowedOrigins.indexOf(origin) > -1;
  if (hasMultipleOrigins) res.setHeader('Access-Control-Allow-Origin', origin);

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  res.setHeader('Access-Control-Allow-Credentials', 1);
  next();
});

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Lint beweert dat deze property niet bestaat
  port: process.env.EMAIL_PORT,
  secure: (+process.env.EMAIL_PORT == 465),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const SECURE_METHODS = ['GET', 'POST', 'PUT', 'PATCH']
const admin_server_pool = new Pool({
  host: process.env.ADMIN_DB_HOST,
  port: +process.env.ADMIN_DB_PORT,
  database: process.env.ADMIN_DB_DATABASE,
  user: process.env.ADMIN_DB_USER,
  password: process.env.ADMIN_DB_PASSWORD,
  ssl: false
})

admin_server_pool.connect().then(() => {
  logger.info(`Connected to admin database at host ${process.env.ADMIN_DB_HOST}`)
}).catch(err => {
  return logger.fatal(err, "Failed initial connection to admin db!")
})
admin_server_pool.on('error', (err) => {
  logger.fatal(err, 'Unexpected error in connection with admin database!')
})


//#########################################################
//##################   Models   ###########################
//#########################################################
var Schema = mongo.Schema;

var userActivitySchema = new Schema({
  username: { type: String },
  changedUser: Schema.Types.ObjectId,
  newValue: { type: String },
  date: { type: Number }
}, { versionKey: false });
var UserActivitymodel = mongo.model('userActivityChanges', userActivitySchema, 'userActivityChanges');

var VesselsSchema = new Schema({
  mmsi: { type: Number },
  nicename: { type: String },
  client: { type: Array },
  active: { type: Boolean },
  operationsClass: { type: String },
}, { versionKey: false });
var Vesselmodel = mongo.model('vessels', VesselsSchema, 'vessels');

var SovInfoSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: Array },
  mmsi: { type: Number },
  active: { type: Boolean },
  operationsClass: { type: String },
  daughtercraft_mmsi: { type: Number },
}, { versionKey: false });
var SovInfomodel = mongo.model('sovInfo', SovInfoSchema, 'sovInfo');

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
var Transfermodel = mongo.model('transfers', TransferSchema, 'transfers');

var LatLonSchema = new Schema({
  filename: { type: String },
  SiteName: { type: String },
  centroid: { type: Object },
  outlineLonCoordinates: { type: Array },
  outlineLatCoordinates: { type: Array },
}, { versionKey: false });
var LatLonmodel = mongo.model('turbineLocations', LatLonSchema, 'turbineLocations');

var PlatformLocationSchema = new Schema({
  filename: { type: String },
  SiteName: { type: String }
}, { versionKey: false });
var PlatformLocationmodel = mongo.model('platformLocations', PlatformLocationSchema, 'platformLocations');

var boatCrewLocationSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number }
}, { versionKey: false });
var boatCrewLocationmodel = mongo.model('crew', boatCrewLocationSchema, 'crew');

var transitSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number },
  lat: { type: Array },
  lon: { type: Array }
}, { versionKey: false });
var transitsmodel = mongo.model('transits', transitSchema, 'transits');

var boatLocationSchema = new Schema({
  vesselname: { type: String },
  nicename: { type: String },
  client: { type: String },
  mmsi: { type: Number }
}, { versionKey: false });
var boatLocationmodel = mongo.model('AISdata', boatLocationSchema, 'AISdata');

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
var CommentsChangedmodel = mongo.model('CommentsChanged', CommentsChangedSchema, 'CommentsChanged');

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
var videoRequestedmodel = mongo.model('videoRequests', videoRequestedSchema, 'videoRequests');

var videoBudgetSchema = new Schema({
  mmsi: { type: Number },
  currentBudget: { type: Number },
  maxBudget: { type: Number },
  resetDate: { type: Number }
}, { versionKey: false });
var videoBudgetmodel = mongo.model('videoBudget', videoBudgetSchema, 'videoBudget');

var SovModel = new Schema({
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
var SovModelmodel = mongo.model('SOV_general', SovModel, 'SOV_general');

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
var SovPlatformTransfersmodel = mongo.model('SOV_platformTransfers', SovPlatformTransfers, 'SOV_platformTransfers');

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
var SovTurbineTransfersmodel = mongo.model('SOV_turbineTransfers', SovTurbineTransfers, 'SOV_turbineTransfers');

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
var SovTransitsmodel = mongo.model('SOV_transits', SovTransits, 'SOV_transits');

var SovVessel2vesselTransfers = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  transfers: { type: Object },
  CTVactivity: { type: Object },
  missedTransfers: { type: Object },
});
var SovVessel2vesselTransfersmodel = mongo.model('SOV_vessel2vesselTransfers', SovVessel2vesselTransfers, 'SOV_vessel2vesselTransfers');

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
var engineDatamodel = mongo.model('engine', engineData, 'engine');

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
var SovDprInputmodel = mongo.model('SOV_dprInput', SovDprInput, 'SOV_dprInput');

var SovHseDprInput = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  dprFields: { type: Object },
  hseFields: { type: Object },
  signedOff: { type: Object }

});
var SovHseDprInputmodel = mongo.model('SOV_hseDprInput', SovHseDprInput, 'SOV_hseDprInput');

var SovRovOperations = new Schema({
  date: { type: Number },
  mmsi: { type: Number },
  transfers: { type: Array }
});
var SovRovOperationsmodel = mongo.model('SOV_rovOperations', SovRovOperations, 'SOV_rovOperations');

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
var SovCycleTimesmodel = mongo.model('SOV_cycleTimes', SovCycleTimes, 'SOV_cycleTimes');

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
var portcallModel = mongo.model('portcalls', portcallSchema, 'portCalls');

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
var generalmodel = mongo.model('general', generalSchema, 'general');

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
var turbineWarrantymodel = mongo.model('TurbineWarranty_Historic', turbineWarrantySchema, 'TurbineWarranty_Historic');

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
var turbineWarrantyRequestmodel = mongo.model('TurbineWarranty_Request', turbineWarrantyRequestSchema, 'TurbineWarranty_Request');

var sailDayChangedSchema = new Schema({
  vessel: { type: String },
  date: { type: Number },
  changeDate: { type: Number },
  fleetID: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  userID: { type: String }
}, { versionKey: false });
var sailDayChangedmodel = mongo.model('sailDayChanged', sailDayChangedSchema, 'sailDayChanged');

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
var vesselsToAddToFleetmodel = mongo.model('vesselsToAddToFleet', vesselsToAddToFleetSchema, 'vesselsToAddToFleet');

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
var activeListingsModel = mongo.model('activeListings', activeListingsSchema, 'activeListings');

var harbourSchema = new Schema({
  name: { type: String },
  centroid: { type: Object },
  lon: { type: Array },
  lat: { type: Array },
}, { versionKey: false });
var harbourModel = mongo.model('harbourLocations', harbourSchema, 'harbourLocations');

var hasSailedSchemaCTV = new Schema({
  mmsi: { type: Number },
  date: { type: Number },
  distancekm: { type: Number },
}, { versionKey: false, strictQuery: true, strict: true });
var hasSailedModelCTV = mongo.model('hasSailedModel', hasSailedSchemaCTV, 'general');

var sovHasPlatformTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var sovHasPlatformTransferModel = mongo.model('sovHasPlatformModel', sovHasPlatformTransfersSchema, 'SOV_platformTransfers');

var sovHasTurbineTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var sovHasTurbineTransferModel = mongo.model('sovHasTurbineModel', sovHasTurbineTransfersSchema, 'SOV_turbineTransfers');

var sovHasV2VTransfersSchema = new Schema({
  mmsi: { type: Number },
  date: { type: Number }
})
var sovHasV2VModel = mongo.model('sovHasV2VModel', sovHasV2VTransfersSchema, 'SOV_vessel2vesselTransfers');

var upstreamSchema = new Schema({
  type: String,
  date: String,
  user: String,
  content: Object,
}, { versionKey: false });
var upstreamModel = mongo.model('pushUpstream', upstreamSchema, 'pushUpstream');

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
var wavedataModel = mongo.model('wavedata', wavedataSchema, 'waveData');

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
var waveSourceModel = mongo.model('waveSource', waveSourceSchema, 'waveSources');

var sovWaveSpectrumSchema = new Schema({
  date: Number,
  time: Array,
  spectrum: Array,
  active: Boolean,
}, { versionKey: false });
var sovWaveSpectrumModel = mongo.model('sovWaveSpectrum', sovWaveSpectrumSchema, 'SOV_waveSpectrum');


//############################################################
//#################  Support functions  ######################
//############################################################


function onUnauthorized(res, cause = 'unknown') {
  logger.warn(res, `Unauthorized request: ${cause}`)
  if (cause == 'unknown') {
    res.status(401).send('Unauthorized request')
  } else {
    res.status(401).send(`Unauthorized: ${cause}`)
  }
}

function onError(res, err, additionalInfo = 'Internal server error') {
  try {
    if (typeof err == 'object') {
      err['res'] = res;
    } else {
      err = {
        res: res,
        err: err,
      }
    }
    logger.error(err, additionalInfo)
    res.status(500).send(additionalInfo);
  } catch (err) {
    console.error(err)
  }
}

function verifyToken(req, res) {
  // TODO: fix this
  try {
    if (!req.headers.authorization) return onUnauthorized(res, 'Missing headers');

    const token = req.headers.authorization;
    if (token == null || token === 'null')  return onUnauthorized(res, 'Token missing!');

    const payload = jwt.verify(token, 'secretKey');
    if (payload == null || payload == 'null') return onUnauthorized(res, 'Token corrupted!');

    const lastActive = new Date()
    admin_server_pool.query(`UPDATE "userTable" SET "last_active"=$1 WHERE user_id=$2`, [lastActive, payload['userID']])

    return payload;
  } catch (err) {
    return onError(res, err, 'Failed to parse jwt token')
  }
}

function validatePermissionToViewVesselData(req, res, callback) {
  const token = req['token'];
  const mmsi = req.body.mmsi ?? req.params.mmsi
  let filter;
  switch (token.userPermission) {
    case 'admin':
      filter = { mmsi };
      break;
    default:
      filter = { mmsi, client: token.userCompany };
  }
  Vesselmodel.find(filter, ['_id'], function(err, isValid) {
    if (err) return onError(res, err);
    if (isValid.length < 1) return onUnauthorized(res, `User not authorized for vessel ${mmsi}`);
    return callback(isValid);
  });
}

function mailTo(subject, html, user) {
  // setup email data with unicode symbols
  const body = 'Dear ' + user + ', <br><br>' + html + '<br><br>' + 'Kind regards, <br> MO4';

  const mailOptions = {
    from: '"MO4 Dataviewer" <no-reply@mo4.online>', // sender address
    to: user, //'bar@example.com, baz@example.com' list of receivers
    bcc: WEBMASTER_MAIL, //'bar@example.com, baz@example.com' list of bcc receivers
    subject: subject, //'Hello ✔' Subject line
    html: body //'<b>Hello world?</b>' html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    const maillogger = logger.child({ recipient: user, subject: subject }); // Attach email to the logs
    if (error) return maillogger.error(error);
    maillogger.info('Message sent with id: %s', info.messageId);
  });
}

function sendUpstream(content, type, user, confirmFcn = function() {}) {
  // Assumes the token has been validated
  const date = getUTCstring();
  logger.trace('Upstream save')
  upstreamModel.create({
    dateUTC: date,
    user: user,
    type: type,
    content: content
  }, confirmFcn());
};


//####################################################################
//#################   Endpoints - no login   #########################
//####################################################################
app.use((req, res, next) => {
  // console.log(` - ${req.method.padEnd(8, ' ')} | ${req.url}`);
  logger.debug({
    msg: `${req.method}: ${req.url}`,
    method: req.method,
    url: req.url
  });
  next();
})

mo4AdminServer(app, logger, onError, onUnauthorized, admin_server_pool)



// ################### APPLICATION MIDDLEWARE ###################
// #### Every method below this block requires a valid token ####
// ##############################################################
app.use((req, res, next) => {
  try {
    const isSecureMethod = SECURE_METHODS.some(method => method == req.method);
    if (!isSecureMethod) return next();
    // console.log(` - ${req.method} ${req.url}`);
    const token = verifyToken(req, res);
    if (!token) return; // Error already thrown in verifyToken
    req['token'] = token;
    next();
  } catch (err) {
    return onError(res, err);
  }
})

mo4lightServer(app, logger)
fileUploadServer(app, logger)
mo4AdminPostLoginServer(app, logger, onError, onUnauthorized, admin_server_pool, mailTo)


//####################################################################
//#################  Endpoints - with login  #########################
//####################################################################


app.get("/api/getActiveConnections", function(req, res) {
  const token = req['token']
  if (token.userPermission != "admin") return onUnauthorized(res, 'Only admin may request active connections!');
  res.send({
    body: 'This is not yet tracked'
  });
})

app.post("/api/saveVessel", function (req, res) {
  var vessel = new model(req.body);
  const token = req['token']
  if (req.body.mode === "Save") {
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist")  return onUnauthorized(res);

    vessel.save(function (err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Record has been Inserted..!!" });
    });
  } else {
    if (token.userPermission !== "admin") return onUnauthorized(res);
    Vesselmodel.findByIdAndUpdate(req.body.id, { name: req.body.name, address: req.body.address }, function (err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Record has been Updated..!!" });
    });
  }
});


app.post("/api/saveTransfer", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    var comment = new CommentsChangedmodel();
    comment.oldComment = req.body.oldComment;
    comment.newComment = req.body.comment;
    comment.commentChanged = req.body.commentChanged;
    comment.otherComment = req.body.commentChanged.otherComment;
    comment.idTransfer = req.body._id;
    comment.date = req.body.commentDate;
    comment.mmsi = req.body.mmsi;
    comment.paxUp = req.body.paxUp;
    comment.paxDown = req.body.paxDown;
    comment.cargoUp = req.body.cargoUp;
    comment.cargoDown = req.body.cargoDown;
    comment.processed = null;
    comment.userID = req.body.userID;

    sendUpstream(comment, 'DPR_comment_change', req.body.userID);
    comment.save(function(err, data) {
      if (err) return onError(res, err);
      Transfermodel.findOneAndUpdate({
        _id: req.body._id,
        active: { $ne: false }
      }, {
        paxUp: req.body.paxUp,
        paxDown: req.body.paxDown,
        cargoUp: req.body.cargoUp,
        cargoDown: req.body.cargoDown,
        comment: req.body.comment,
        commentChanged: req.body.commentChanged
      }, function(err, data) {
        if (err) return onError(res, err);
        res.send({ data: "Succesfully saved the comment" });
      });
    });
  });
});

app.post("/api/saveCTVGeneralStats", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    generalmodel.findOneAndUpdate({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      inputStats: req.body
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: 'Data has been succesfully saved' });
    });
  });
});

app.post("/api/getSovWaveSpectrum", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    sovWaveSpectrumModel.find({
      date: req.body.date,
      mmsi: req.body.mmsi,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});
app.post("/api/getSovWaveSpectrumAvailable", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    sovWaveSpectrumModel.find({
      mmsi: req.body.mmsi,
      active: { $ne: false }
    }, {
      date: 1
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({
        vesselHasData: data.length > 0,
        dateHasData: data.some(elt => elt.date === req.body.date)
      })
    })
  });
});

app.post("/api/getCommentsForVessel", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    CommentsChangedmodel.aggregate([{
        "$match": {
          mmsi: { $in: [req.body.mmsi] },
          active: { $ne: false }
        }
      },
      {
        $group: {
          _id: "$idTransfer",
          "date": { "$last": "$date" },
          "idTransfer": { "$last": "$idTransfer" },
          "newComment": { "$last": "$newComment" },
          "otherComment": { "$last": "$otherComment" },
          "commentChanged": { "$last": "$commentChanged" }
        }
      }
    ]).exec(function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getVessel", function(req, res) {
  const token = req['token'];
  if (token.userPermission != 'admin') return onUnauthorized(res, 'Admin only')
  Vesselmodel.find({
    active: { $ne: false }
  }, null, {
    sort: {
      client: 'asc',
      nicename: 'asc'
    }
  }, function(err, data) {
    if (err) return onError(res, err);
    return res.send(data);
  });
});
app.get("/api/getVesselsForCompany", function(req, res) {
  const token = req['token'];
  const permission = token.permission;
  let companyName = token.userCompany;
  if (token.userCompany !== companyName && !permission.admin) return onUnauthorized(res);
  let filter = { client: companyName, active: { $ne: false } };
  if (token.userPermission !== "Logistics specialist" && !permission.admin) {
    filter.mmsi = [];
    for (var i = 0; i < token.userBoats.length; i++) {
      filter.mmsi[i] = token.userBoats[i].mmsi;
    }
  }
  Vesselmodel.find(filter).sort({
    nicename: 'asc'
  }).exec( function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getHarbourLocations", function(req, res) {
  harbourModel.find({
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    return res.send(data);
  })
});

app.get("/api/getSov/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovModelmodel.find({ "mmsi": mmsi, "dayNum": date, active: { $ne: false } }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getTransitsForSov/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovTransitsmodel.find({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getVessel2vesselForSov/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovVessel2vesselTransfersmodel.find({
      "mmsi": mmsi,
      "date": date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getSovRovOperations/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {

    SovRovOperationsmodel.findOne({ "mmsi": mmsi, "date": date, active: { $ne: false } }, function(err, data) {
      if (err) return onError(res, err);
      if (data == null) {
        res.send({ rovOperations: [] })
      } else {
        res.send(data);
      }
    });
  });
});

app.post("/api/updateSovRovOperations", function(req, res) {
  // Updates ROV Operations
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovRovOperationsmodel.findOneAndUpdate({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      rovOperations: req.body.rovOperations
    }, {
      strict: false,
      upsert: true,
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the ROV operations" });
    });
  });
});

app.get("/api/getEnginedata/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  validatePermissionToViewVesselData(req, res, function(validated) {
    engineDatamodel.find({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getCycleTimesForSov/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = parseInt(req.params.date);
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovCycleTimesmodel.find({
      "mmsi": mmsi,
      "date": date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getPlatformTransfers/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovPlatformTransfersmodel.find({
      "mmsi": mmsi,
      "date": date,
      active: { $ne: false }
    }).sort({
      arrivalTimePlatform: 'asc'
    }).exec( (err, data) => {
      if (err) return onError(res, err);
      res.send(data);
    });
  });
});

app.get("/api/getTurbineTransfers/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovTurbineTransfersmodel.find({
      "mmsi": mmsi,
      "date": date,
      active: { $ne: false }
    }).sort({
      startTime: 'asc'
    }).exec( (err, data) => {
      if (err) return onError(res, err);
      res.send(data);
    });
  });
});

app.post("/api/getDistinctFieldnames", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    Transfermodel.find({
      "mmsi": req.body.mmsi,
      "date": req.body.date,
      active: { $ne: false }
    }).distinct('fieldname', function(err, data) {
      if (err) return onError(res, err);
      let fieldnameData = data + '';
      let arrayOfFields = [];
      arrayOfFields = fieldnameData.split(",");
      res.send(arrayOfFields);
    });
  });
});

app.get("/api/getSovDistinctFieldnames/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovTurbineTransfersmodel.find({
      "mmsi": mmsi,
      "date": date,
      active: { $ne: false }
    }).distinct('fieldname', function(err, data) {
      if (err) return onError(res, err);
      let fieldnameData = data + '';
      let arrayOfFields = [];
      arrayOfFields = fieldnameData.split(",");
      res.send(arrayOfFields);
    });
  });
});

app.post("/api/getPlatformLocations", function(req, res) {
  PlatformLocationmodel.find({
    filename: req.body.Name,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/getSpecificPark", function(req, res) {
  LatLonmodel.find({
    filename: { $in: req.body.park },
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getParkByNiceName/:parkName", function(req, res) {
  const parkName = req.params.parkName;
  LatLonmodel.find({
    SiteName: parkName,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getLatestBoatLocation", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin') return onUnauthorized(res);
  boatLocationmodel.aggregate([{
      $match: {
        active: { $ne: false }
      }
    },
    {
      $group: {
        _id: "$MMSI",
        "LON": {
          "$last": "$LON"
        },
        "LAT": {
          "$last": "$LAT"
        },
        "TIMESTAMP": {
          "$last": "$TIMESTAMP"
        }
      }
    },
    // This code runs every 30 seconds if left in place
    {
      $lookup: {
        from: 'vessels',
        localField: '_id',
        foreignField: 'mmsi',
        as: 'vesselInformation'
      }
    },
    {
      $addFields: {
        vesselInformation: "$vesselInformation.nicename"
      }
    }
  ]).exec(function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getLatestBoatLocationForCompany/:company", function(req, res) {
  let companyName = req.params.company;
  let companyMmsi = [];
  const token = req['token']
  if (token.userCompany !== companyName && token.userPermission !== "admin") return onUnauthorized(res, 'Company does not match')
  Vesselmodel.find({
    client: companyName,
    active: { $ne: false }
  } , function(err, data) {
    if (err) return onError(res, err);
    if (token.userPermission !== "Logistics specialist" && token.userPermission !== "admin") {
      for (let i = 0; i < token.userBoats.length;) {
        companyMmsi.push(token.userBoats[i].mmsi);
        i++; // WTF is dit dan weer voor een for loop
      }
      // companyMmsi = token.userBoats.map(boat => boat.mmsi);
    } else {
      for (let i = 0; i < data.length;) {
        companyMmsi.push(data[i].mmsi);
        i++;
      }
    }

    boatLocationmodel.aggregate([{
        "$match": {
          MMSI: { $in: companyMmsi },
          active: { $ne: false }
        }
      },
      {
        $group: {
          _id: "$MMSI",
          "LON": {
            "$last": "$LON"
          },
          "LAT": {
            "$last": "$LAT"
          },
          "TIMESTAMP": {
            "$last": "$TIMESTAMP"
          }
        }
      },
      // This code runs every 30 seconds if left in place
      {
        $lookup: {
          from: 'vessels',
          localField: '_id',
          foreignField: 'mmsi',
          as: 'vesselInformation'
        }
      },
      {
        $addFields: {
          vesselInformation: "$vesselInformation.nicename"
        }
      }
    ]).exec(function(err, data) {
      if (err) return onError(res, err);
      res.send(data);
    });
  });
});

app.post("/api/getDatesWithValues", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    Transfermodel.find({
      mmsi: req.body.mmsi,
      active: { $ne: false }
    }).distinct('date', null,  (err, data) =>{
      if (err) return onError(res, err);
      let dateData = data + '';
      let arrayOfDates = [];
      arrayOfDates = dateData.split(",");
      res.send(arrayOfDates);
    });
  });
});


app.post("/api/getSovDprInput", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.find({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      if (data.length > 0) return res.send(data);
      SovDprInputmodel.findOne({
        mmsi: req.body.mmsi,
        date: { $lt: req.body.date }
      }).sort({
        date: -1
      }).exec(function(err, data) {
        if (err) return onError(res, err);
        let dprData = {};
        if (data != null) {
          logger.info({ msg: 'Generating new dpr input model', mmsi: req.body.mmsi, date: req.body.date })
          dprData = {
            "mmsi": req.body.mmsi,
              "date": req.body.date,
              "liquids": {
                fuel: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                luboil: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                domwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                potwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
              },
              "toolbox": [],
              "hoc": [],
              "vesselNonAvailability": [],
              "weatherDowntime": [],
              "standBy": [],
              "remarks": '',
              "ToolboxAmountOld": 0,
              "ToolboxAmountNew": 0,
              "HOCAmountOld": 0,
              "HOCAmountNew": 0,
              "catering": {
                project: 0,
                extraMeals: 0,
                extraMealsMarineContractors: 0,
                packedLunches: 0,
                marine: 0,
                marineContractors: 0
              },
              "PoB": {
                marine: 0,
                marineContractors: 0,
                project: 0
              },
              "missedPaxCargo": [],
              "helicopterPaxCargo": [],
              "dp": [],
              "signedOff": {
                amount: 0,
                signedOffSkipper: '',
                signedOffClient: ''
              }
            };
        } else {
          dprData = {
            "mmsi": req.body.mmsi,
            "date": req.body.date,
            "liquids": {
              fuel: { oldValue: data.liquids.fuel.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.fuel.newValue },
              luboil: { oldValue: data.liquids.luboil.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.luboil.newValue },
              domwater: { oldValue: data.liquids.domwater.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.domwater.newValue },
              potwater: { oldValue: data.liquids.potwater.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.potwater.newValue }
            },
            "toolbox": [],
            "hoc": [],
            "vesselNonAvailability": [],
            "weatherDowntime": [],
            "standBy": [],
            "ToolboxAmountOld": data.ToolboxAmountNew,
            "ToolboxAmountNew": data.ToolboxAmountNew,
            "HOCAmountOld": data.HOCAmountNew,
            "HOCAmountNew": data.HOCAmountNew,
            "remarks": '',
            "catering": {
              project: 0,
              extraMeals: 0,
              extraMealsMarineContractors: 0,
              packedLunches: 0,
              marine: 0,
              marineContractors: 0
            },
            "missedPaxCargo": [],
            "helicopterPaxCargo": [],
            "PoB": {
              marine: 0,
              marineContractors: 0,
              project: 0
            },
            "dp": [],
            "signedOff": { amount: 0, signedOffSkipper: '', signedOffClient: '' },
          };
        }
        let sovDprData = new SovDprInputmodel(dprData);

        sovDprData.save((error, dprData) => {
          if (err) return onError(res, err);
          res.send([dprData]);
        });
      });
    });
  });
});

app.post("/api/getSovHseDprInput", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.find({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      if (data.length > 0) return res.send(data);
      let hseData = {};
      hseData = {
        "mmsi": req.body.mmsi,
        "date": req.body.date,
        "hseFields": {
          lostTimeInjuries: { value: 0, comment: '' },
          restrictedWorkday: { value: 0, comment: '' },
          MedicalTreatment: { value: 0, comment: '' },
          firstAid: { value: 0, comment: '' },
          environmentalIncidents: { value: 0, comment: '' },
          equipmentDamage: { value: 0, comment: '' },
          proactiveReports: { value: 0, comment: '' },
          nearHitMisses: { value: 0, comment: '' },

          safetyComitteeMeeting: { value: 0, comment: '' },
          marineDrillsAndTraining: { value: 0, comment: '' },
          managementVisits: { value: 0, comment: '' },

          shorePower: { value: 0, comment: '' },
          plasticIncinerated: { value: 0, comment: '' },
          plasticLanded: { value: 0, comment: '' },
          foodIncinerated: { value: 0, comment: '' },
          foodLanded: { value: 0, comment: '' },
          foodMacerated: { value: 0, comment: '' },
          domWasteLanded: { value: 0, comment: '' },
          domWasteIncinerated: { value: 0, comment: '' },
          cookingoilLanded: { value: 0, comment: '' },
          opsWasteLanded: { value: 0, comment: '' },
          opsWasteIncinerated: { value: 0, comment: '' },

          remarks: ''
        },
        "dprFields": {
          marineCount: { value: 0, comment: '' },
          clientCrewCount: { value: 0, comment: '' },
          hocAmount: { value: 0, comment: '' },
          toolboxAmount: { value: 0, comment: '' },
          technicalBreakdownAmount: { value: 0, comment: '' },
          fuelConsumption: { value: 0, comment: '' },
          lubOilConsumption: { value: 0, comment: '' },
          waterConsumption: { value: 0, comment: '' }
        },
        "signedOff": {
          amount: 0,
          signedOffSkipper: '',
          signedOffHse: ''
        }
      };
      let sovHseDprData = new SovHseDprInputmodel(hseData);

      sovHseDprData.save((err, hseData) => {
        if (err) return onError(res, err);
        res.send(hseData);
      });
    });
  });
});

app.post("/api/updateSOVHseDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.findOneAndUpdate({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      hseFields: req.body.hseFields
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the HSE DPR" });
    });
  });
});

app.post("/api/updateDprFieldsSOVHseDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.findOneAndUpdate({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, { dprFields: req.body.dprFields },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the DPR" });
    });
  });
});

app.post("/api/saveFuelStatsSovDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
      SovDprInputmodel.updateOne({
        mmsi: req.body.mmsi,
        date: req.body.date,
        active: { $ne: false }
      }, { liquids: req.body.liquids },
      function(err, data) {
        if (err) return onError(res, err);
        res.send({ data: "Succesfully saved the fuel input" });
      });
  });
});

app.post("/api/saveIncidentDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      toolbox: req.body.toolbox,
      hoc: req.body.hoc,
      ToolboxAmountNew: req.body.ToolboxAmountNew,
      HOCAmountNew: req.body.HOCAmountNew
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the incident input" });
    });
});
});

app.post("/api/updateSOVTurbinePaxInput", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovTurbineTransfersmodel.findOneAndUpdate({
      _id: req.body._id,
      active: { $ne: false }
    }, {
      paxIn: req.body.paxIn,
      paxOut: req.body.paxOut,
      cargoIn: req.body.cargoIn,
      cargoOut: req.body.cargoOut
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the transfer stats" });
    });
  });
});


app.post("/api/updateSOVv2vPaxInput", function(req, res) {
  // Updates transfer info between SOV and other vessels
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovVessel2vesselTransfersmodel.findOneAndUpdate({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      transfers: req.body.transfers
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the v2v transfer stats" });
    });
  });
});

app.post("/api/getSovInfo/", function(req, res) {
  // Updates transfer info turbine transfers by DC craft.
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovInfomodel.find({
      mmsi: req.body.mmsi
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send(data);
    });
  });
});

app.post("/api/updateSOVv2vTurbineTransfers", function(req, res) {
  // Updates transfer info turbine transfers by DC craft.
  validatePermissionToViewVesselData(req, res, function(validated) {
    let info = req.body.update;
    let missed = req.body.missedTransfers || [];
    logger.info('Updating v2v transfers for mmsi: ' + req.body.mmsi + ', date: ' + req.body.date)
    SovVessel2vesselTransfersmodel.findOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, function(err, v2v) {
      if (err) return onError(res, err);
      if (v2v) {
        if (!Array.isArray(v2v.CTVactivity))  v2v.CTVactivity = [v2v.CTVactivity];
        let match = v2v.CTVactivity.findIndex(_act => _act.mmsi == info.mmsi);
        if (match >= 0) {
          v2v.CTVactivity[match] = {...v2v.CTVactivity[match], ...info };
        } else {
          v2v.CTVactivity.push(info);
        }
        const update = {
          CTVactivity: v2v.CTVactivity,
          missedTransfers: missed
        }
        SovVessel2vesselTransfersmodel.findOneAndUpdate({
          mmsi: req.body.mmsi,
          date: req.body.date,
          active: { $ne: false }
        }, update, (err, data) => {
          if (err) return onError(res, err);
          res.send({ data: "Succesfully saved the v2v transfer stats" });
        });
      } else { // v2v does not yet exist
        new SovVessel2vesselTransfersmodel({
          mmsi: req.body.mmsi,
          date: req.body.date,
          CTVactivity: [info],
          transfers: [],
          missedTransfers: missed
        }).save((err, data) => {
          if (err) return onError(res, err);
          res.send({ data: "Succesfully saved the v2v transfer stats" });
        });
      }
    });
  });
});

app.post("/api/updateSOVPlatformPaxInput", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovPlatformTransfersmodel.findOneAndUpdate({
      _id: req.body._id,
      active: { $ne: false }
    }, {
      paxIn: req.body.paxIn,
      paxOut: req.body.paxOut,
      cargoIn: req.body.cargoIn,
      cargoOut: req.body.cargoOut
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the transfer stats" });
    });
  });
});

app.post("/api/saveNonAvailabilityDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      vesselNonAvailability: req.body.vesselNonAvailability
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the downtime input" });
    });
  });
});

app.post("/api/saveDprSigningSkipper", function(req, res) {
  let mmsi = req.body.mmsi;
  let date = req.body.date;
  let vesselname = req.body.vesselName || '<invalid vessel name>';
  let dateString = req.body.dateString || '<invalid date>';
  validatePermissionToViewVesselData(req, res, function(validated) {
    const token = req['token']
    SovDprInputmodel.updateOne({
        mmsi: mmsi,
        date: date,
        active: { $ne: false }
      }, {
        $set: {
          "signedOff.amount": 1,
          "signedOff.signedOffSkipper": token.username
        }
      },
      function(err, data) {
        if (err) return onError(res, err);
        res.send({ data: "Succesfully signed off the DPR" });
      }
    );
    let _body = 'The dpr for vessel ' + vesselname + ', ' + dateString +
      ' has been signed off by the skipper. Please review the dpr and sign off if in agreement!<br><br>' +
      'Link to the relevant report:<br>' +
      SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date
      // ToDo: set proper recipient
    let title = 'DPR signoff for ' + vesselname + ' ' + dateString;
    let recipient = [];

    // TODO: Fix this by getting the relevant client representative via the postlogin
    // Usermodel.find({
    //   active: { $ne: false },
    //   client: token.userCompany,
    //   permissions: 'Client representative',
    //   boats: { $elemMatch: { mmsi: mmsi } }
    // }, {
    //   username: 1,
    // }, (err, data) => {
    //   if (err || data.length === 0) {
    //     if (err) return onError(res, err);
    //     recipient = [WEBMASTER_MAIL]
    //     title = 'Failed to deliver: client representative not found!'
    //   } else {
    //     recipient = data.map(user => user.username);
    //   }
    // });

    setTimeout(function() {
      mailTo(title, _body, recipient)
    }, 3000);
  });
});

app.post("/api/saveDprSigningClient", function(req, res) {
  const token = req['token']
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      $set: {
        "signedOff.amount": 2,
        "signedOff.signedOffClient": token.username
      }
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully signed off the DPR" });
    });
  });
});

app.post("/api/declineDprClient", function(req, res) {
  const token = req['token']
  let mmsi = req.body.mmsi;
  let date = req.body.date;
  let title = '';
  let recipient = WEBMASTER_MAIL;
  let vesselname = req.body.vesselName || '<invalid vessel name>';
  let dateString = req.body.dateString || '<invalid date>';
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {
      $set: {
        "signedOff.amount": -1,
        "signedOff.declinedBy": token.username
      }
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully declined the DPR" });
    });

    SovDprInputmodel.findOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {}, (err, data) => {
      if (err || data.length === 0) {
        if (err) return onError(res, err);

        recipient = WEBMASTER_MAIL;
        title = 'Failed to deliver: skipper not found!'
      } else {
        recipient = data.signedOff.signedOffSkipper
        title = 'DPR signoff refused by client';
      }
    });

    const _body = 'The dpr for vessel ' + vesselname + ',' + dateString +
      ' has been refused by client. Please correct the dpr accordingly and sign off again!<br><br>' +
      'Link to the relevant report:<br>' +
      SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date +
      '<br><br>Feedback from client:<br>' + req.body.feedback;
    // ToDo: set proper recipient
    setTimeout(function() {
      mailTo(title, _body, recipient)
    }, 3000);
  });
});

app.post("/api/declineHseDprClient", function(req, res) {
  let mmsi = req.body.mmsi;
  let date = req.body.date;
  let title = '';
  let recipient = WEBMASTER_MAIL;
  let vesselname = req.body.vesselName || '<invalid vessel name>';
  let dateString = req.body.dateString || '<invalid date>';
  const token = req['token']

  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.updateOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {
      $set: {
        "signedOff.amount": -1,
        "signedOff.declinedBy": token.username
      }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully declined the HSE DPR" });
    });
    SovHseDprInputmodel.findOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {}, (err, data) => {
      if (err || data.length === 0) {
        if (err) return onError(res, err);
        recipient = [WEBMASTER_MAIL]
        title = 'Failed to deliver: skipper not found!'
      } else {
        recipient = data.signedOff.signedOffSkipper
        title = 'HSE DPR signoff refused by client';
      }
    });

    const _body = 'The HSE DPR for vessel ' + vesselname + ', ' + dateString +
      ' has been refused by client. Please correct the dpr accordingly and sign off again!<br><br>' +
      'Link to the relevant report:<br>' +
      SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date +
      '<br><br>Feedback from client:<br>' + req.body.feedback;
    // ToDo: set proper recipient
    setTimeout(function() {
      mailTo(title, _body, recipient)
    }, 3000);
  });
});

app.post("/api/saveQHSERemark", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      $set: {
        "hseFields.remarksQhse": req.body.remark
      }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the QHSE remarks" });
    });
  });
});



app.post("/api/saveHseDprSigningSkipper", function(req, res) {
  let mmsi = req.body.mmsi;
  let date = req.body.date;
  const token = req['token']
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.updateOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {
      $set: {
        "signedOff.amount": 1,
        "signedOff.signedOffSkipper": token.username
      }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully signed off the HSE DPR" });
    });
  });
});

app.post("/api/saveHseDprSigningClient", function(req, res) {
  const token = req['token']
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovHseDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      $set: {
        "signedOff.amount": 2,
        "signedOff.signedOffClient": token.username
      }
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully signed off the HSE DPR" });
    });
  });
});

app.post("/api/saveWeatherDowntimeDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      weatherDowntime: req.body.weatherDowntime
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the downtime input" });
    });
  });
});

app.post("/api/saveAccessDayType", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      accessDayType: req.body.accessDayType
    },
    function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the downtime input" });
    });
  });
});

app.post("/api/saveStandByDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      standBy: req.body.standBy
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the downtime input" });
    });
  });
});

app.post("/api/saveRemarksStats", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      remarks: req.body.remarks
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved your remarks" });
    });
  });
});

app.post("/api/saveCateringStats", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      catering: req.body.catering
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the catering input" });
    });
  });
});

app.post("/api/saveDPStats", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      dp: req.body.dp
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the DP input" });
    });
  });
});

app.post("/api/saveMissedPaxCargo", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      missedPaxCargo: req.body.MissedPaxCargo
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the missed transfer input" });
    });
  });
});

app.post("/api/saveHelicopterPaxCargo", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovDprInputmodel.updateOne({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, {
      helicopterPaxCargo: req.body.HelicopterPaxCargo
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({ data: "Succesfully saved the helicopter transfer input" });
    });
  });
});

app.get("/api/getDatesWithTransferForSov/:mmsi", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    // ToDo: This should be done in a asynchronous fashion - forkJoin or such
    sovHasPlatformTransferModel.find({
      "mmsi": mmsi,
      active: { $ne: false }
    }, ['date']).distinct('date', function(err, platformTransferDates) {
      if (err) return onError(res, err);
      sovHasTurbineTransferModel.find({
        "mmsi": mmsi,
        active: { $ne: false }
      }, ['date']).distinct('date', function(err, turbineTransferDates) {
        if (err) return onError(res, err);
        sovHasV2VModel.find({
          'mmsi': mmsi,
          active: { $ne: false }
        }, ['date']).distinct('date', function(err, v2vTransferDates) {
          if (err) return onError(res, err);
          if (platformTransferDates && turbineTransferDates && v2vTransferDates) {
            const merged = platformTransferDates.concat(turbineTransferDates).concat(v2vTransferDates);
            res.send(merged.filter((item, index) => merged.indexOf(item) === index));
          } else {
            return onError(res, 'Failed to retrieve dates with SOV transfers', 'Failed to retrieve transfers dates');
          }
        })
      });
    });
  });
});

app.get("/api/getDatesShipHasSailedForSov/:mmsi", function(req, res) {
  const mmsi = parseInt(req.params.mmsi);
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    SovModelmodel.find({
      mmsi: mmsi,
      active: { $ne: false },
      distancekm: { $not: /_NaN_/ }
    }, ['dayNum', 'distancekm'], function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.get("/api/getTransfersForVessel/:mmsi/:date", function(req, res) {
  let mmsi = parseInt(req.params.mmsi);
  let date = req.params.date;
  req.body.mmsi = mmsi;
  validatePermissionToViewVesselData(req, res, function(validated) {
    Transfermodel.find({
      mmsi: mmsi,
      date: date,
      active: { $ne: false },
      detector: { $ne: 'impact' }
    }).sort({
      startTime: 1
    }).exec(function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.post("/api/getGeneralForRange", function(req, res) {
  validatePermissionToViewVesselData(req, res, validated => {
    const startDate = req.body.startDate;
    const stopDate = req.body.stopDate;
    let mmsi = req.body.mmsi;
    if (typeof(mmsi) == 'number') mmsi = [mmsi];
    const projection = req.body.projection || null;

    switch (req.body.vesselType) {
      case 'CTV':
        return getCtvForRange(mmsi, startDate, stopDate, projection, res);
      case 'SOV':
      case 'OSV':
        return getSovForRange(mmsi, startDate, stopDate, projection, res);
      default:
        res.status(201).send('Invalid vessel type!')
    }
  });
});

function getCtvForRange(mmsi, startDate, stopDate, projection, res) {
  const query = {
    mmsi: { $in: mmsi },
    date: {
      $gte: startDate,
      $lte: stopDate
    }
  };
  return generalmodel.aggregate([
    { $match: query },
    { "$sort": { date: -1 } },
    { $project: projection },
    { $group: { _id: '$mmsi', stats: { $push: "$$ROOT" } } },
  ]).exec((err, data) => {
    if (err) return onError(res, err);
    res.send(data.map(elt => {
      elt.stats.mmsi = elt._id;
      return elt.stats;
    }));
  });
}
function getSovForRange(mmsi, startDate, stopDate, projection, res) {
  var query = {
    mmsi: { $in: mmsi },
    dayNum: {
      $gte: startDate,
      $lte: stopDate
    }
  };
  return SovModelmodel.aggregate([
    { $match: query },
    { $project: projection },
    { "$sort": { date: -1 } },
    { $group: { _id: '$mmsi', stats: { $push: "$$ROOT" } } },
  ]).exec((err, data) => {
    if (err) return onError(res, err);
    res.send(data.map(elt => {
      elt.stats.mmsi = elt._id;
      return elt.stats;
    }));
  });
}

app.post("/api/getTransfersForVesselByRange", function(req, res) {
  aggregateStatsOverModel(Transfermodel, req, res);
});

app.post("/api/getTurbineTransfersForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(SovTurbineTransfersmodel, req, res);
});

app.post("/api/getPlatformTransfersForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(SovPlatformTransfersmodel, req, res, { date: 'arrivalTimePlatform' });
});

app.post("/api/getVessel2vesselsByRangeForSov", function(req, res) {
  aggregateStatsOverModel(SovVessel2vesselTransfersmodel, req, res);
});

app.post("/api/getTransitsForVesselByRange", function(req, res) {
  aggregateStatsOverModel(transitsmodel, req, res);
});

app.post("/api/getTransitsForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(SovTransitsmodel, req, res);
});

app.post("/api/getEnginesForVesselByRange", function(req, res) {
  aggregateStatsOverModel(engineDatamodel, req, res, { date: 'date' });
});

app.post("/api/getPortcallsByRange", function(req, res) {
  aggregateStatsOverModel(portcallModel, req, res);
});

app.post("/api/getDprInputsByRange", function(req, res) {
  aggregateStatsOverModel(SovDprInputmodel, req, res);
});

app.post("/api/validatePermissionToViewData", function(req, res) {
  // This function is named HORIBLY - it returns a vessel
  validatePermissionToViewVesselData(req, res, function(data) {
    const mmsi = req.body.mmsi;
    Vesselmodel.find({
      mmsi: mmsi
    }, (err, data) => {
      if (err) return onError(res, err);
      res.send(data);
    })
  });
});

app.get('/api/getLatestGeneral', function(req, res) {
  const token = req['token']
  let ctvData;
  let sovData;
  // Callback only sends data if both CTV and SOV succefully loaded, error otherwise
  const cb = () => {
    if (ctvData !== undefined && sovData !== undefined) {
      res.send(ctvData.concat(sovData));
    }
  }

  if (token.userPermission !== 'admin') return onUnauthorized(res);
  generalmodel.aggregate([{
    $group: {
      _id: '$mmsi',
      'date': { $max: '$date' },
      'vesselname': { $last: '$vesselname' },
    }
  }]).exec((err, data) => {
    if (err) return onError(res, err);
    ctvData = data;
    cb();
  });
  SovModelmodel.aggregate([{
    $group: {
      _id: '$mmsi',
      'date': { $max: '$date' },
      'vesselname': { $last: '$vesselName' },
    }
  }]).exec((err, data) => {
    if (err) return onError(res, err);
    sovData = data;
    cb();
  });
})

app.post("/api/getVideoRequests", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    videoRequestedmodel.aggregate([{
      "$match": {
        mmsi: { $in: [req.body.mmsi] },
        active: { $ne: false }
      }
    }, {
      $group: {
        _id: "$videoPath",
        "mmsi": { "$last": "$mmsi" },
        "videoPath": { "$last": "$videoPath" },
        "vesselname": { "$last": "$vesselname" },
        "date": { "$last": "$date" },
        "active": { "$last": "$active" },
        "status": { "$last": "$status" }
      }
    }]).exec(function(err, data) {
      if (err) return onError(res, err);
      res.send(data)
    });
  });
});

app.post("/api/getVideoBudgetByMmsi", function (req, res) {
  validatePermissionToViewVesselData(req, res, function (validated) {
    videoBudgetmodel.find({
      mmsi: req.body.mmsi,
      active: { $ne: false }
    }, function (err, data) {
      if (err) return onError(res, err);

      var videoBudget = data[0];
      if (!videoBudget) return res.send(data);

      var today = new Date().getTime();
      if (videoBudget.resetDate > today) return res.send(data);

      var date = new Date(videoBudget.resetDate);
      while (date.getTime() <= today) {
        date.setMonth(date.getMonth() + 1);
      }
      data[0].resetDate = date;
      data[0].currentBudget = 0;
      data[0].save(function (_err, _data) {
        if (_err) return onError(res, err);
        return res.send(_data);
      });
    });
  });
});

app.post("/api/saveVideoRequest", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    const token = req['token']
    var videoRequest = new videoRequestedmodel();
    videoRequest.mmsi = req.body.mmsi;
    videoRequest.requestID = req.body._id;
    videoRequest.videoPath = req.body.videoPath;
    videoRequest.vesselname = req.body.vesselname;
    videoRequest.date = Date.now();
    videoRequest.active = req.body.video_requested.text === "Requested" ? true : false;
    videoRequest.status = '';
    videoRequest.username = token.username;

    videoRequestedmodel.findOneAndUpdate({
      "requestID": mongo.Types.ObjectId(videoRequest.requestID)
    }, {
      mmsi: videoRequest.mmsi,
      active: videoRequest.active,
      videoPath: videoRequest.videoPath,
      vesselname: videoRequest.vesselname,
      date: videoRequest.date,
      status: videoRequest.status,
      username: videoRequest.username
    }, {
      upsert: true,
    }, function(err, data) {
      if (err) return onError(res, err);
      videoBudgetmodel.findOne({
        mmsi: req.body.mmsi,
        active: { $ne: false }
      }, function(err, data) {
        if (err) return onError(res, err);

        if (data) {
          videoBudgetmodel.findOneAndUpdate({
            mmsi: req.body.mmsi,
            date: req.body.date,
          }, {
            maxBudget: req.body.maxBudget,
            currentBudget: req.body.currentBudget
          }, function(_err, _data) {
            if (_err) return onError(_err);
            return res.send({ data: "Succesfully saved the video request" });
          });
        } else {
          const budget = new videoBudgetmodel();
          budget.mmsi = req.body.mmsi;
          budget.maxBudget = req.body.maxBudget;
          budget.currentBudget = req.body.currentBudget;
          const date = new Date();
          budget.resetDate = date.setMonth(date.getMonth() + 1);
          budget.save(function(_err, _data) {
            if (_err) return onError(_err);
            return res.send({ data: "Succesfully saved the video request" });
          });
        }
      });
    });
  });
});

app.post("/api/getGeneral", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    generalmodel.find({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      res.send({data: data});
    });
  });
});

app.get("/api/getTurbineWarranty", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin') return onUnauthorized(res);
  turbineWarrantymodel.find({
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/getTurbineWarrantyOne", function(req, res) {
  const token = req['token']
  turbineWarrantymodel.findOne({
    campaignName: req.body.campaignName,
    active: { $ne: false },
    windfield: req.body.windfield,
    startDate: req.body.startDate
  }, function(err, data) {
    if (err) return onError(res, err);
    if (!data) {
      logger.warn({ msg: 'No TWA found - getTurbineWarrantyOne' })
      return res.send({ err: "No TWA found" });
    }
    if (token.userPermission !== 'admin' && token.userCompany !== data.client) return onUnauthorized(res);
    sailDayChangedmodel.find({
      fleetID: data._id,
      active: { $ne: false }
    }, function(err, _data) {
      if (err) return onError(res, err);
      return res.send({ data: data, sailDayChanged: _data });
    });
  });
});

app.post("/api/getTurbineWarrantyForCompany", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin' && token.userCompany !== req.body.client && token.hasCampaigns) return onUnauthorized(res);
  turbineWarrantymodel.find({
    client: req.body.client,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/setSaildays", function(req, res) {
  const token = req['token']

  for (var i = 0; i < req.body.length; i++) {
    if (req.body[i].newValue + '' === req.body[i].oldValue + '') {
      continue;
    }
    var sailDayChanged = new sailDayChangedmodel();
    sailDayChanged.vessel = req.body[i].vessel;
    sailDayChanged.date = req.body[i].date;
    sailDayChanged.fleetID = req.body[i].fleetID;
    sailDayChanged.oldValue = req.body[i].oldValue;
    sailDayChanged.newValue = req.body[i].newValue;
    sailDayChanged.userID = req.body[i].userID;
    sailDayChanged.changeDate = Date.now();
    sailDayChanged.save();
  }
  return res.send({ data: "Succesfully updated weather days" });
});

app.post("/api/addVesselToFleet", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin' && token.userCompany !== req.body.client) return onUnauthorized(res);
  const filter = {
    campaignName: req.body.campaignName,
    startDate: req.body.startDate,
    active: { $ne: false },
    windfield: req.body.windfield,
    status: "TODO"
  };
  if (isNaN(req.body.vessel)) {
    filter.vesselname = req.body.vessel;
  } else if (req.body.vessel) {
    filter.mmsi = req.body.vessel;
  } else {
    return res.status(400).send('No vessel entered');
  }
  vesselsToAddToFleetmodel.find(filter, function(err, data) {
    if (err) return onError(res, err);
    if (data.length === 0) {
      var vesselToAdd = new vesselsToAddToFleetmodel();
      vesselToAdd.campaignName = req.body.campaignName;
      vesselToAdd.startDate = req.body.startDate;
      vesselToAdd.windfield = req.body.windfield;
      vesselToAdd.dateAdded = Date.now();
      vesselToAdd.status = "TODO";
      vesselToAdd.username = token.username;
      vesselToAdd.client = req.body.client;
      if (isNaN(req.body.vessel)) {
        vesselToAdd.vesselname = req.body.vessel;
      } else {
        vesselToAdd.mmsi = req.body.vessel;
      }

      vesselToAdd.save(function(err, data) {
        if (err) return onError(res, err);
        return res.send({ data: "Vessel added to fleet (could take up to a day to process)" });
      });
    } else {
      return res.status(400).send('Vessel is already being processed to be added');
    }
  });
});

app.get("/api/getParkLocations", function(req, res) {
  LatLonmodel.find({ active: { $ne: false } }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getParkLocationForVessels", function(req, res) {
  //ToDo: windfields do not yet have associated companies
  //ToDo: netjes afvangen als client een streepje bevat
  let companyName = req.params.company.replace('--_--', ' ');
  const token = req['token']
  if (token.userCompany !== companyName && token.userPermission !== "admin") return onUnauthorized(res);
  ParkLocationmodel.find({
    client: companyName,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getActiveListingsForFleet/:fleetID/:client/:stopDate", function(req, res) {
  const token = req['token']
  let fleetID = req.params.fleetID;
  let client = req.params.client;
  let stopDate = req.params.stopDate;
  if (token.userPermission !== 'admin' && token.userCompany !== client) return onUnauthorized(res);
  activeListingsModel.aggregate([{
    $match: {
      fleetID: fleetID,
      active: { $ne: false }
    }
  }, {
    $group: {
      _id: '$listingID',
      dateChanged: { $last: '$dateChanged' },
      vesselname: { $last: '$vesselname' },
      dateStart: { $last: '$dateStart' },
      dateEnd: { $last: '$dateEnd' },
      fleetID: { $last: '$fleetID' },
      deleted: { $last: '$deleted' },
      listingID: { $last: '$listingID' },
      user: { $last: '$user' }
    }
  }, {
    $project: {
      _id: '$listingID',
      dateChanged: '$dateChanged',
      vesselname: '$vesselname',
      dateStart: '$dateStart',
      dateEnd: '$dateEnd',
      fleetID: '$fleetID',
      deleted: '$deleted',
      listingID: '$listingID',
      user: '$user'
    }
  }]).exec(function(err, data) {
    if (err) return onError(res, err);
    var activeVessels = [];
    var currentDate = new Date().valueOf();
    if (stopDate < currentDate) {
      currentDate = stopDate
    }
    for (var i = 0; i < data.length; i++) {
      var startDate = new Date(data[i].dateStart);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(data[i].dateEnd);
      endDate.setDate(endDate.getDate() + 1);
      if (data[i].deleted) {
        continue;
      } else if (!data[i].dateStart && !data[i].dateEnd) {
        if (!(activeVessels.indexOf(data[i].vesselname) > -1)) {
          activeVessels.push(data[i].vesselname);
        }
      } else if (currentDate > startDate.valueOf() && currentDate < endDate.valueOf() && data[i].dateStart < data[i].dateEnd) {
        if (!(activeVessels.indexOf(data[i].vesselname) > -1)) {
          activeVessels.push(data[i].vesselname);
        }
      } else if (currentDate > startDate.valueOf() && !data[i].dateEnd) {
        if (!(activeVessels.indexOf(data[i].vesselname) > -1)) {
          activeVessels.push(data[i].vesselname);
        }
      } else if (currentDate < endDate.valueOf() && !data[i].dateStart) {
        if (!(activeVessels.indexOf(data[i].vesselname) > -1)) {
          activeVessels.push(data[i].vesselname);
        }
      }
    }
    turbineWarrantymodel.findByIdAndUpdate(fleetID, {
      $set: { activeFleet: activeVessels }
    }, {
      new: true
    }, function(err, twa) {
      if (err) return onError(res, err);
      return res.send({ data: data, twa: twa });
    });
  });
});

app.get("/api/getAllActiveListingsForFleet/:fleetID", function(req, res) {
  const token = req['token']
  let fleetID = req.params.fleetID;
  if (token.userPermission !== 'admin') return onUnauthorized(res);
  activeListingsModel.find({
    fleetID: fleetID,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/setActiveListings", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin' && token.userCompany !== req.body.client) return onUnauthorized(res);
  let listings = req.body.listings;
  let activeVessels = [];
  let fleetID = req.body.fleetID;
  let currentDate = new Date().valueOf();
  let stopDate = req.body.stopDate;
  if (stopDate < currentDate) {
    currentDate = stopDate
  }
  for (var i = 0; i < listings.length; i++) {
    for (var j = 0; j < listings[i].length; j++) {
      var listing = listings[i][j];
      var startDate = new Date(listing.dateStart);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(listing.dateEnd);
      endDate.setDate(endDate.getDate() + 1);
      activeListing = new activeListingsModel();
      activeListing.vesselname = listing.vesselname;
      activeListing.fleetID = listing.fleetID;
      activeListing.dateChanged = Date.now();
      activeListing.user = token.username;
      if (listing.deleted) {
        activeListing.deleted = listing.deleted;
      } else if (!listing.dateStart && !listing.dateEnd) {
        if (!(activeVessels.indexOf(listing.vesselname) > -1)) {
          activeVessels.push(listing.vesselname);
        }
      } else if (currentDate > startDate.valueOf() && currentDate < endDate.valueOf() && listing.dateStart < listing.dateEnd) {
        if (!(activeVessels.indexOf(listing.vesselname) > -1)) {
          activeVessels.push(listing.vesselname);
        }
      } else if (currentDate > startDate.valueOf() && !listing.dateEnd) {
        if (!(activeVessels.indexOf(listing.vesselname) > -1)) {
          activeVessels.push(listing.vesselname);
        }
      } else if (currentDate < endDate.valueOf() && !listing.dateStart) {
        if (!(activeVessels.indexOf(listing.vesselname) > -1)) {
          activeVessels.push(listing.vesselname);
        }
      }
      if (!listing.deleted) {
        activeListing.deleted = false;
        activeListing.dateStart = listing.dateStart;
        activeListing.dateEnd = listing.dateEnd;
      }
      if (!listing.newListing) {
        activeListing.listingID = listing.listingID;
      } else {
        activeListing.listingID = new mongo.Types.ObjectId();
      }
      activeListing.save(function(err, data) {
        return onError(res, err, 'Something went went wrong with updating one or more listing(s)');
      });
    }
  }
  turbineWarrantymodel.findByIdAndUpdate(fleetID, { $set: { activeFleet: activeVessels } }, { new: true }, function(err, data) {
    if (err) return onError(res, err);
    res.send({ data: "Active listings edited", twa: data });
  });
});

app.post("/api/getHasSailedDatesCTV", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    hasSailedModelCTV.find({
      mmsi: req.body.mmsi,
      active: { $ne: false }
    }, ['date', 'distancekm'], function(err, data) {
      if (err) return onError(res, err);
      res.send({data: data}); // mmmm
    });
  });
});

app.post("/api/getVesselsToAddToFleet", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin') return onUnauthorized(res);
  vesselsToAddToFleetmodel.find({
    campaignName: req.body.campaignName,
    active: { $ne: false },
    windfield: req.body.windfield,
    startDate: req.body.startDate
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/saveFleetRequest", function(req, res) {
  const token = req['token']
  if (token.userPermission !== 'admin' && token.userPermission !== 'Logistics specialist') return onUnauthorized(res);
  const request = new turbineWarrantyRequestmodel();
  request.fullFleet = req.body.boats;
  request.activeFleet = req.body.boats;
  request.client = req.body.client;
  request.windfield = req.body.windfield;
  request.startDate = req.body.jsTime.startDate;
  request.stopDate = req.body.jsTime.stopDate;
  request.numContractedVessels = req.body.numContractedVessels;
  request.campaignName = req.body.campaignName;
  request.weatherDayTarget = req.body.weatherDayTarget;
  request.weatherDayTargetType = req.body.weatherDayTargetType;
  request.limitHs = req.body.limitHs;
  request.user = token.username;
  request.requestTime = req.body.requestTime;
  request.save(function(err, data) {
    if (err) return onError(res, err);
    const startDate = new Date(request.startDate);
    const stopDate = new Date(request.stopDate);
    const requestTime = new Date(request.requestTime);
    let html = 'A campaing has been requested, the data for the campaign: <br>' +
      "Campaign name: " + request.campaignName + " <br>" +
      "Windfield: " + request.windfield + " <br>" +
      "Client: " + request.client + " <br>" +
      "Fullfleet: " + request.fullFleet + " <br>" +
      "Activefleet: " + request.activeFleet + " <br>" +
      "Start date: " + startDate.toISOString().slice(0, 10) + " <br>" +
      "Stop date: " + stopDate.toISOString().slice(0, 10) + " <br>" +
      "Number of contracted vessels: " + request.numContractedVessels + " <br>" +
      "Weather day target: " + request.weatherDayTarget + " " + request.weatherDayTargetType + " <br>" +
      "Limit Hs: " + request.limitHs + " <br>" +
      "Username: " + request.user + " <br>" +
      "Request time: " + requestTime.toISOString().slice(0, 10);
    mailTo('Campaign requested', html, WEBMASTER_MAIL);
    return res.send({ data: 'Request succesfully made' });
  });
});

app.post("/api/getWavedataForDay", function(req, res) {
  const token = req['token']
  let date = req.body.date ?? 0;
  let site = req.body.site ?? 'NONE';

  wavedataModel.findOne({
    date,
    site,
    active: { $ne: false }
  }, (err, data) => {
    if (err) return onError(res, err);
    if (data?.source == null) return res.status(204).send({data: 'Not found'});

    waveSourceModel.findById(data.source, (err, meta) => {
      if (err) return onError(res, err);
      let company = token.userCompany;
      let hasAccessRights = token.userPermission === 'admin' || (typeof(meta.clients) == 'string' ?
        meta.clients === company : meta.clients.some(client => client == company))
      if (!hasAccessRights) return onUnauthorized(res);
      data.meta = meta;
      res.send(data);
    })
  });
});

app.post("/api/getWavedataForRange", function(req, res) {
  const token = req['token']
  let startDate = req.body.startDate;
  let stopDate = req.body.stopDate;
  let source = req.body.source;

  wavedataModel.find({
    date: { $gte: startDate, $lte: stopDate },
    source: source,
    active: { $ne: false }
  }, (err, datas) => {
    if (err) return onError(res, err);
    if (datas === null) return res.status(204).send('Not found');

    datas.forEach(data =>
      waveSourceModel.findById(data.source, (err, meta) => {
        if (err) return onError(res, err);
        let company = token.userCompany;
        let hasAccessRights = token.userPermission === 'admin' || (typeof(meta.clients) == 'string' ?
          meta.clients === company : meta.clients.some(client => client == company))
        if (hasAccessRights) {
          data.meta = meta;
        } else {
          data = null;
        }
      })
    );
    res.send(datas);
  });
});

app.get("/api/getFieldsWithWaveSourcesByCompany", function(req, res) {
  const token = req['token']
  if (token.userPermission === 'admin') {
    waveSourceModel.find({}, {
        site: 1,
        name: 1
      }, {
        sort: { site: 1 }
      }, (err, data) => {
        if (err) return onError(res, err);
        res.send(data);
      }
    )
  } else {
    waveSourceModel.find({
        clients: { $in: [token.userCompany] },
      }, {
        site: 1,
        name: 1,
      }, {
        sort: { site: 1 }
      }, (err, data) => {
        if (err) return onError(res, err);
        res.send(data);
      }
    )
  }
})

app.get('/api/getLatestTwaUpdate/', function(req, res) {
  const token = req['token']
  if (token.userPermission === 'admin') {
    // let currMatlabDate = Math.floor((moment() / 864e5) + 719529 - 3);
    turbineWarrantymodel.find({}, {
      lastUpdated: 1
    }, (err, data) => {
      if (err) return onError(res, err);
      if (!data) return onError(res, 'No active TWA requests found!', 'No active TWA requests found!')
      let latestUpdate = data.reduce((prev, curr) => {
        return Math.max(prev, curr.lastUpdated);
      }, 0)
      res.send({ lastUpdate: latestUpdate });
    })
  }
})

app.listen(SERVER_PORT, function() {
  logger.info(`MO4 Dataviewer listening on port ${SERVER_PORT}!`);
});


function getUTCstring() {
  const d = new Date();
  const dformat = [d.getUTCFullYear(), // WTF is dit monster
    (d.getMonth() + 1).padLeft(),
    d.getUTCDate().padLeft()
  ].join('-') + ' ' + [d.getUTCHours().padLeft(),
    d.getUTCMinutes().padLeft(),
    d.getUTCSeconds().padLeft()
  ].join(':');
  return dformat
}

function aggregateStatsOverModel(model, req, res, opts) {
  // Default aggregation function for turbine, transfer or transit stats
  opts = {... {
      key: 'mmsi',
      label: 'vesselname',
      date: 'startTime',
    },
    ...opts
  }
  validatePermissionToViewVesselData(req, res, function(validated) {
    const projObj = {
      "vesselname": 1,
      "mmsi": 1,
    }
    projObj[opts.date] = 1;
    const groupObj = {
      _id: '$' + opts.key,
      label: { $push: '$' + opts.label },
      date: { $push: '$' + opts.date }
    }
    const reqFields = req.body.reqFields;
    reqFields.forEach(key => {
      projObj[key] = { $ifNull: ['$' + key, null] };
      groupObj[key] = { $push: '$' + key };
    })
    model.aggregate([{
        "$match": {
          mmsi: { $in: req.body.mmsi },
          date: { $gte: req.body.dateMin, $lte: req.body.dateMax },
          active: { $ne: false },
        }
      },
      { "$sort": { startTime: -1 } },
      { "$project": projObj },
      { "$group": groupObj }
    ]).exec(function(err, data) {
      if (err) return onError(res, err);
      res.send(data);
    });
  });
}

Number.prototype['padLeft'] = function(base, chr) {
  var len = (String(base || 10).length - String(this).length) + 1;
  return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

module.exports = app;
