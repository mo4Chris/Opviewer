var express = require('express');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var nodemailer = require('nodemailer');
var twoFactor = require('node-2fa');
var moment = require('moment');

require('dotenv').config({ path: __dirname + '/./../.env' });

mongo.set('useFindAndModify', false);
var db = mongo.connect(process.env.DB_CONN, { useNewUrlParser: true }, function (err, response) {
    // Why is this address hardcoded instead of calling the environment.ts file?
    if (err) { console.log(err); }
    else { console.log('Connected to Database'); }
});

var app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    var allowedOrigins = process.env.IP_USER;
    var origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_PORT == 465),
    // Why is this port hardcoded instead of calling the environment.ts file?
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//#########################################################
//##################   Models   ###########################
//#########################################################


var Schema = mongo.Schema;

var userSchema = new Schema({
    username: { type: String },
    password: { type: String },
    permissions: { type: String },
    client: { type: String },
    boats: { type: Array },
    token: { type: String },
    active: { type: Number },
    secret2fa: { type: String },
    settings: { type: Object },
}, { versionKey: false });
var Usermodel = mongo.model('users', userSchema, 'users');

var userActivitySchema = new Schema({
    username: { type: String },
    changedUser: Schema.Types.ObjectId,
    newValue: { type: String },
    date: { type: Number }
}, { versionKey: false });
var UserActivitymodel = mongo.model('userActivityChanges', userActivitySchema, 'userActivityChanges');

var VesselsSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: Array },
    mmsi: { type: Number }
}, { versionKey: false });
var Vesselmodel = mongo.model('vessels', VesselsSchema, 'vessels');

var TransferSchema = new Schema({
    mmsi: { type: Number },
    vesselname: { type: String },
    date: { type: Number },
    startTime: { type: Number },
    stopTime: { type: Number },
    duration: { type: Number },
    location: { type: String },
    fieldname: { type: String },
    paxUp: { type: Number},
    paxDown: {type: Number},
    cargoUp: { type: Number},
    cargoDown: {type: Number},
    comment: { type: String },
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
    outlineLonCoordinates: {type: Array },
    outlineLatCoordinates: {type: Array },
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
    lat: {type: Array },
    lon: {type: Array}
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
    cargoOut: { type: Number}
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
    cargoOut: { type: Number}
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
    transfers: { type: Object },
    CTVactivity: { type: Object },
    date: { type: Number },
    mmsi: { type: Number },
    paxIn: { type: Number},
    paxOut: { type: Number},
    cargoIn: { type: Number},
    cargoOut: { type: Number}
});
var SovVessel2vesselTransfersmodel = mongo.model('SOV_vessel2vesselTransfers', SovVessel2vesselTransfers, 'SOV_vessel2vesselTransfers');

var SovDprInput = new Schema({
    liquids: { type: Object },
    toolbox: { type: Array },
    hoc: { type: Array },
    vesselNonAvailability: { type: Array },
    weatherDowntime: { type: Array },
    standBy: { type: Array },
    remarks: {type: String},
    catering: {type: Object},
    date: { type: Number },
    mmsi: { type: Number },
    ToolboxAmountOld: { type: Number },
    ToolboxAmountNew: { type: Number },
    HOCAmountOld: { type: Number },
    HOCAmountNew: { type: Number },
    missedPaxCargo : { type: Array },
    helicopterPaxCargo: { type: Array },
    PoB : {type: Object},
    dp: {type: Array}
    
});
var SovDprInputmodel = mongo.model('SOV_dprInput', SovDprInput, 'SOV_dprInput');

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
    mmsi: {type: Number},
    date: {type: Number},
    distancekm: {type: Number},
}, { versionKey: false, strictQuery: true, strict: true});
var hasSailedModelCTV = mongo.model('hasSailedModel', hasSailedSchemaCTV, 'general');

var sovHasPlatformTransfersSchema = new Schema({
    mmsi: {type: Number},
    date: {type: Number}
})
var sovHasPlatformTransferModel = new mongo.model('sovHasPlatformModel', sovHasPlatformTransfersSchema, 'SOV_platformTransfers');

var sovHasTurbineTransfersSchema = new Schema({
    mmsi: {type: Number},
    date: {type: Number}
})
var sovHasTurbineTransferModel = new mongo.model('sovHasTurbineModel', sovHasTurbineTransfersSchema, 'SOV_turbineTransfers');

var sovHasV2VTransfersSchema = new Schema({
    mmsi: {type: Number},
    date: {type: Number}
})
var sovHasV2VModel = new mongo.model('sovHasV2VModel', sovHasV2VTransfersSchema, 'SOV_vessel2vesselTransfers');

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

//#########################################################
//#################   Functionality   #####################
//#########################################################

function verifyToken(req, res) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authorization;
    if (token === 'null') {
        return res.status(401).send('Unauthorized request');
    }

    let payload = jwt.verify(token, 'secretKey');

    if (payload === 'null') {
        return res.status(401).send('Unauthorized request');
    } 
    return payload;
}

function validatePermissionToViewData(req, res, callback) {
    let token = verifyToken(req, res);
    let filter = { mmsi: req.body.mmsi };
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist" && token.userPermission !== "Contract manager") {
        // if (!token.userBoats.some(x => {
        //         return filter.mmsi.some(y => x.mmsi ===y )
        //     })
        // ){
        //     return res.status(401).send('Unauthorized request');
        // } else {
        //     filter.client = token.userCompany;
        // }
        filter.client = token.userCompany;
    } else if (token.userPermission === "Logistics specialist") {
        filter.client = token.userCompany;
    } else if (token.userPermission === "Contract manager") {
        // TODO
        filter.client = token.userCompany;
    }
    Vesselmodel.find(filter, function (err, data) {
        if (err) {
            console.log(err);
            return [];
        }
        else {
            callback(data);
            return data;
        }
    });
}

function mailTo(subject, html, user) {
    // setup email data with unicode symbols
    body = 'Dear ' + user + ', <br><br>' + html + '<br><br>' + 'Kind regards, <br> BMO Offshore';

    let mailOptions = {
        from: '"BMO Dataviewer" <no-reply@bmodataviewer.com>', // sender address
        to: user, //'bar@example.com, baz@example.com' list of receivers
        bcc: process.env.EMAIL, //'bar@example.com, baz@example.com' list of bcc receivers
        subject: subject, //'Hello ✔' Subject line
        html: body //'<b>Hello world?</b>' html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

function sendUpstream(content, type, user, confirmFcn = function(){}) {
    // Assumes the token has been validated
    const date = getUTCstring();
    upstreamModel.create({
        dateUTC: date,
        user: user,
        type: type,
        content: content
    }, confirmFcn());
};

//#########################################################
//#################   Endpoints   #########################
//#########################################################

app.get("/api/getActiveConnections", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission === "admin") {
        res.send({
            body: 'This is not yet tracked'
        });
    } else {
        return res.status(401).send('Unauthorized request!');
    }
})

app.post("/api/registerUser", function (req, res) {
    let userData = req.body;
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin") {
        if (token.userPermission === "Logistics specialist" && token.userCompany !== userData.client) {
            return res.status(401).send('Access denied');
        } else if (token.userPermission !== "Logistics specialist") {
            return res.status(401).send('Access denied');
        }
    }
    Usermodel.findOne({ username: userData.email, active: {$ne: false} },
        function (err, existingUser) {
            if (err) {
                res.send(err);
            } else {
                if (!existingUser) {
                    randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
                    randomToken = randomToken.replace(/\//gi, '8');
                    let user = new Usermodel({
                        "username": userData.email.toLowerCase(),
                        "token": randomToken,
                        "permissions": userData.permissions,
                        "client": userData.client,
                        "secret2fa": "",
                        "active": 1,
                        "password": bcrypt.hashSync("hanspasswordtocheck", 10) //password shouldn't be set when test phase is over
                    });
                    user.save((error, registeredUser) => {
                        if (error) {
                            console.log(error);
                            return res.status(401).send('User already exists');
                        } else {

                            var serveradres = process.env.IP_USER.split(",");
                            let link = serveradres[0] + "/set-password;token=" + randomToken + ";user=" + user.username;
                            let html = 'A account for the BMO dataviewer has been created for this email. To activate your account <a href="' + link + '">click here</a> <br>' +
                                'If that doesnt work copy the link below <br>' + link;
                            mailTo('Registered user', html, user.username);
                            return res.send({ data: 'User created', status: 200 });
                        }
                    });
                } else {
                    return res.status(401).send('User already exists');
                }
            }
        });
});

app.post("/api/login", function (req, res) {
    let userData = req.body;
    Usermodel.findOne({ username: userData.username.toLowerCase()},
        function (err, user) {
            if (err) {
                res.send(err);
            } else {
                if (!user) {
                    return res.status(401).send('User does not exist');
                } else if (user.active === 0) {
                    return res.status(401).send('User is not active, please contact your supervisor');
                }else {
                    /*if (!user.password) {
                        return res.status(401).send('Account needs to be activated before loggin in, check your email for the link');
                    } else*/ //Has to be implemented when user doesn't have a default password
                    if (bcrypt.compareSync(userData.password, user.password)) {
                        let filter;
                        if(user.permissions !== 'admin') {
                            filter = { client: user.client };
                        }
                        turbineWarrantymodel.find(filter, function (err, data) {
                            if (err) {
                                res.send(err);
                            } else {
                                const expireDate = new Date();
                                let payload = { 
                                    userID: user._id, 
                                    userPermission: user.permissions, 
                                    userCompany: user.client, 
                                    userBoats: user.boats, 
                                    username: user.username,
                                    expires: expireDate.setMonth(expireDate.getMonth()+1).valueOf(),
                                    hasCampaigns: data.length >= 1 && (user.permissions!== "Vessel master")
                                };
                                let token = jwt.sign(payload, 'secretKey');
                                if (user.active == 0){
                                    return res.status(401).send('User has been deactivated');
                                }
                                if (user.secret2fa === undefined || user.secret2fa === "" || user.secret2fa === {} || user.client === 'Bibby Marine')  {
                                    return res.status(200).send({ token });
                                } else {

                                    if (twoFactor.verifyToken(user.secret2fa, req.body.confirm2fa) !== null) {
                                        return res.status(200).send({ token });
                                    } else {
                                        return res.status(401).send('2fa is incorrect');
                                    }
                                }
                            }
                        });
                    } else {
                        return res.status(401).send('Password is incorrect');
                    }
                }
            }
        });
});

app.post("/api/saveVessel", function (req, res) {
    var vessel = new model(req.body);
    let token = verifyToken(req, res);
    if (req.body.mode === "Save") {
        if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
            return res.status(401).send('Access denied');
        }
        vessel.save(function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Record has been Inserted..!!" });
            }
        });
    }
    else {
        if (token.userPermission !== "admin") {
            return res.status(401).send('Access denied');
        }
        Vesselmodel.findByIdAndUpdate(req.body.id, { name: req.body.name, address: req.body.address },
            function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been Updated..!!" });
                }
            });


    }
});


app.post("/api/saveTransfer", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        var comment = new CommentsChangedmodel();
        comment.oldComment = req.body.oldComment;
        comment.newComment = req.body.comment;
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
        comment.save(function (err, data) {
            if (err) {
                res.send(err);
            } else {
                Transfermodel.findOneAndUpdate({
                    _id: req.body._id,
                    active: {$ne: false}
                }, {
                    paxUp: req.body.paxUp,
                    paxDown: req.body.paxDown,
                    cargoUp: req.body.cargoUp,
                    cargoDown: req.body.cargoDown
                }, function (err, data) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send({ data: "Succesfully saved the comment" });
                    }
                });
            }
        });
    });
});

app.post("/api/saveCTVGeneralStats", function(req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        generalmodel.findOneAndUpdate({
            mmsi: req.body.mmsi,
            date: req.body.date,
            active: {$ne: false}
        }, {
            inputStats: req.body
        }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({data: 'Data has been succesfully saved'});
            }
        });
    });
});

app.post("/api/get2faExistence", function (req, res) {
    let userEmail = req.body.userEmail;
    Usermodel.findOne({ username: userEmail, active: {$ne: false} },
        function (err, user) {
            if (err) {
                res.send(err);
            } else {
                if (!user) {
                    return res.status(401).send('User does not exist');
                } else {
                    if (user.secret2fa === undefined || user.secret2fa === "" || user.secret2fa === {} || user.client === 'Bibby Marine') {
                        res.send({ secret2fa: "" });
                    } else {
                        res.send({ secret2fa: user.secret2fa });
                    }
                }
            }
        });
});

app.post("/api/getCommentsForVessel", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        CommentsChangedmodel.aggregate([
            {
                "$match": {
                    mmsi: { $in: [req.body.mmsi] }, 
                    active: {$ne: false}
                }
            },
            {
                $group: {
                    _id: "$idTransfer",
                    "date": { "$last": "$date" },
                    "idTransfer": { "$last": "$idTransfer" },
                    "newComment": { "$last": "$newComment" },
                    "otherComment": { "$last": "$otherComment" }
                }
            }
        ]).exec(function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);

            }
        });
    });
});

app.get("/api/getVessel", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    Vesselmodel.find({active: {$ne: false}

    }, null, {
            sort: {
                client: 'asc', nicename: 'asc'
            }
        }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
});

app.get("/api/checkUserActive/:user", function (req, res) {
    Usermodel.find({username: req.params.user , active: 1}, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if(data.length > 0){
                res.send(true);
            } else {
                res.send(false);
            }
        }
    })
});

app.get("/api/getHarbourLocations", function (req, res) {
    let token = verifyToken(req, res);
    // ToDo: temp disabled untill feature has been enabled
    //if (token.userPermission !== 'admin') {
    //     return res.status(401).send('Access denied');
    // }
    harbourModel.find({active: {$ne: false}}, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    })
});

//ToDo harbourLocationsByCompany

app.get("/api/getSov/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        SovModelmodel.find({ "mmsi": mmsi, "dayNum": date, active: {$ne: false} }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getTransitsForSov/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }

        SovPlatformTransfersmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getVessel2vesselForSov/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }

        SovVessel2vesselTransfersmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getCycleTimesForSov/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = parseInt(req.params.date);
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }

        SovCycleTimesmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getPlatformTransfers/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        SovPlatformTransfersmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} },
        null, {
            sort: {
                arrivalTimePlatform: 'asc'
            }
        }, 
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getTurbineTransfers/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }

        SovTurbineTransfersmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} },
            null, {
                sort: {
                    startTime: 'asc'
                }
            },
            function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(data);
                }
            });
    });
});

app.post("/api/getVesselsForCompany", function (req, res) {
    let companyName = req.body[0].client;
    let token = verifyToken(req, res);
    if (token.userCompany !== companyName && token.userPermission !== "admin") {
        return res.status(401).send('Access denied');
    }
    let filter = { client: companyName, active: {$ne: false} };
    // if (!req.body[0].notHired) {
    //     filter.onHire = 1;
    // }
    if (token.userPermission !== "Logistics specialist" && token.userPermission !== "admin") {
        filter.mmsi = [];
        for (var i = 0; i < token.userBoats.length; i++) {
            filter.mmsi[i] = token.userBoats[i].mmsi;
        }
    }
    Vesselmodel.find(filter, null, {
        sort: {
            nicename: 'asc'
        }
    }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.get("/api/getCompanies", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    Vesselmodel.find({ active: {$ne: false}}).distinct('client', function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        } else {
            let BusinessData = data + '';
            let arrayOfCompanies = [];
            arrayOfCompanies = BusinessData.split(",");
            res.send(arrayOfCompanies);
        }
    });
});

app.post("/api/getDistinctFieldnames", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        Transfermodel.find({ "mmsi": req.body.mmsi, "date": req.body.date, active: {$ne: false} }).distinct('fieldname', function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                let fieldnameData = data + '';
                let arrayOfFields = [];
                arrayOfFields = fieldnameData.split(",");
                res.send(arrayOfFields);
            }
        });
    });
});

app.get("/api/getSovDistinctFieldnames/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        SovTurbineTransfersmodel.find({ "mmsi": mmsi, "date": date, active: {$ne: false} }).distinct('fieldname', function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                let fieldnameData = data + '';
                let arrayOfFields = [];
                arrayOfFields = fieldnameData.split(",");
                res.send(arrayOfFields);
            }
        });
    });
});

app.post("/api/getPlatformLocations", function (req, res) {
    PlatformLocationmodel.find({
        filename: req.body.Name, 
        active: {$ne: false}
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/getSpecificPark", function (req, res) {
    LatLonmodel.find({
        filename: { $in: req.body.park }, 
        active: {$ne: false}
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.get("/api/getParkByNiceName/:parkName", function (req, res) {
    const parkName = req.params.parkName;
    LatLonmodel.find({
        SiteName: parkName,
        active: {$ne: false}
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.get("/api/getLatestBoatLocation", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    boatLocationmodel.aggregate([
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
        {
            $match: {
                active: {$ne: false}
            }
        },
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
    ]).exec(function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);

        }
    });
});

app.post("/api/getRouteForBoat", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        boatLocationmodel.find({
            "TIMESTAMP": { $regex: req.body.dateNormal, $options: 'i' },
            "MMSI": req.body.mmsi, 
            active: {$ne: false}
        }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getLatestBoatLocationForCompany/:company", function (req, res) {
    let companyName = req.params.company;
    let companyMmsi = [];
    let token = verifyToken(req, res);
    if (token.userCompany !== companyName && token.userPermission !== "admin") {
        return res.status(401).send('Access denied');
    }
    Vesselmodel.find({ client: companyName, active: {$ne: false} }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            if (token.userPermission !== "Logistics specialist" && token.userPermission !== "admin") {
                for (i = 0; i < token.userBoats.length;) {
                    companyMmsi.push(token.userBoats[i].mmsi);
                    i++;
                }
            } else {
                for (i = 0; i < data.length;) {
                    companyMmsi.push(data[i].mmsi);
                    i++;
                }
            }

            boatLocationmodel.aggregate([
                {
                    "$match": {
                        MMSI: { $in: companyMmsi }, 
                        active: {$ne: false}
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
            ]).exec(function (err, data) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(data);
                }
            });
        }
    });
});

app.post("/api/getDatesWithValues", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        Transfermodel.find({ mmsi: req.body.mmsi, active: {$ne: false} }).distinct('date', function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                let dateData = data + '';
                let arrayOfDates = [];
                arrayOfDates = dateData.split(",");
                res.send(arrayOfDates);
            }
        });
    });
});


app.post("/api/getSovDprInput", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }

        SovDprInputmodel.find({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, null, {}, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                if (data.length > 0) {
                    res.send(data);
                } else {
                    SovDprInputmodel.findOne({
                        mmsi: req.body.mmsi,
                        date: {$lt: req.body.date}
                    }, null, {
                        sort: {date: -1}
                    }, function (err, data){
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            let dprData = {};
                            if (data == null){
                                dprData = {
                                    "mmsi": req.body.mmsi,
                                    "date": req.body.date,
                                    "liquids": {
                                        fuel: {oldValue: 0 , loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                                        luboil: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                                        domwater: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
                                        potwater: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
                                    },
                                    "toolbox": [],
                                    "hoc": [],
                                    "vesselNonAvailability": [],
                                    "weatherDowntime":[],
                                    "standBy": [],
                                    "remarks": '',
                                    "ToolboxAmountOld": 0,
                                    "ToolboxAmountNew": 0,
                                    "HOCAmountOld": 0,
                                    "HOCAmountNew": 0,
                                    "catering": {
                                        project:0,
                                        extraMeals : 0,
                                        packedLunches: 0,
                                        marine: 0,
                                        marineContractors: 0
                                    },
                                    "PoB" : {
                                        marine: 0,
                                        marineContractors: 0,
                                        project: 0
                                    },
                                    "missedPaxCargo": [],
                                    "helicopterPaxCargo": [],
                                    "dp": []
                                };
                            } else {
                                dprData = {
                                    "mmsi": req.body.mmsi,
                                    "date": req.body.date,
                                    "liquids": {
                                        fuel: {oldValue: data.liquids.fuel.newValue , loaded: 0, consumed: 0, discharged: 0, newValue:data.liquids.fuel.newValue },
                                        luboil: {oldValue: data.liquids.luboil.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.luboil.newValue },
                                        domwater: {oldValue: data.liquids.domwater.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.domwater.newValue },
                                        potwater: {oldValue: data.liquids.potwater.newValue, loaded: 0, consumed: 0, discharged: 0, newValue: data.liquids.potwater.newValue }
                                    },
                                    "toolbox": [],
                                    "hoc": [],
                                    "vesselNonAvailability": [],
                                    "weatherDowntime": [],
                                    "standBy" :[],
                                    "ToolboxAmountOld": data.ToolboxAmountNew,
                                    "ToolboxAmountNew": data.ToolboxAmountNew,
                                    "HOCAmountOld": data.HOCAmountNew,
                                    "HOCAmountNew": data.HOCAmountNew,
                                    "remarks": '',
                                    "catering": {
                                        project:0,
                                        extraMeals : 0,
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
                                    "dp": []
                                };
                            }
                            let sovDprData = new SovDprInputmodel(dprData);
                            
                            sovDprData.save((error, dprData) => {
                                if (error) {
                                    console.log(error);
                                    return res.send(error);
                                } else {
                                    res.send([dprData]);
                                }
                            });
                        }
                    });
                }
                
            }
        });
    });
});

app.post("/api/saveFuelStatsSovDpr", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({
        mmsi: req.body.mmsi,
        date: req.body.date,
        active: {$ne: false}
    }, { liquids: req.body.liquids },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the fuel input" });
            }
        });
    }
});
});

app.post("/api/saveIncidentDpr", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { toolbox: req.body.toolbox, hoc: req.body.hoc, ToolboxAmountNew: req.body.ToolboxAmountNew, HOCAmountNew: req.body.HOCAmountNew },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the incident input" });
            }
        });
    }
});
});

app.post("/api/updateSOVTurbinePaxInput", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovTurbineTransfersmodel.findOneAndUpdate({ _id: req.body._id, active: {$ne: false} }, { paxIn: req.body.paxIn, paxOut: req.body.paxOut, cargoIn: req.body.cargoIn, cargoOut: req.body.cargoOut },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the transfer stats" });
            }
        });
    }
});
});


app.post("/api/updateSOVv2vPaxInput", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    
    SovVessel2vesselTransfersmodel.findOneAndUpdate({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { transfers: req.body.transfers },
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the v2v transfer stats" });
            }
        });
    }
});
});

app.post("/api/updateSOVPlatformPaxInput", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovPlatformTransfersmodel.findOneAndUpdate({ _id: req.body._id, active: {$ne: false} }, { paxIn: req.body.paxIn, paxOut: req.body.paxOut, cargoIn: req.body.cargoIn, cargoOut: req.body.cargoOut },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the transfer stats" });
            }
        });
    }
});
});

app.post("/api/saveNonAvailabilityDpr", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { vesselNonAvailability: req.body.vesselNonAvailability},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the downtime input" });
            }
        });
    }
});
});

app.post("/api/saveWeatherDowntimeDpr", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { weatherDowntime: req.body.weatherDowntime},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the downtime input" });
            }
        });
        }
    });
});

app.post("/api/saveStandByDpr", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { standBy: req.body.standBy},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the downtime input" });
            }
        });
        }
    });
});

app.post("/api/saveRemarksStats", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { remarks: req.body.remarks},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved your remarks" });
            }
        });
        }
    });
});

app.post("/api/saveCateringStats", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { catering: req.body.catering},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the catering input" });
            }
        });
    }
});
});

app.post("/api/saveDPStats", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { dp: req.body.dp},
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the DP input" });
            }
        });
    }
});
});

app.post("/api/saveMissedPaxCargo", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { missedPaxCargo: req.body.MissedPaxCargo},
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the missed transfer input" });
            }
        });
    }
});
});

app.post("/api/saveHelicopterPaxCargo", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { helicopterPaxCargo: req.body.HelicopterPaxCargo},
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the helicopter transfer input" });
            }
        });
    }
});
});

app.post("/api/savePoBStats", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        } else {
    SovDprInputmodel.updateOne({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, { PoB: req.body.peopleonBoard},
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the PoB input" });
            }
        });
    }
});
});

app.get("/api/getDatesWithTransferForSov/:mmsi", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        sovHasPlatformTransferModel.find({ "mmsi": mmsi, active: {$ne: false} }, ['date']).distinct('date', function (err, platformTransferDates) {
            if (err) {
                console.log('Error retrieve platform dates')
                res.send(err);
            } else {
                sovHasTurbineTransferModel.find({ "mmsi": mmsi, active: {$ne: false} }, ['date']).distinct('date', function (err, turbineTransferDates) {
                    if (err) {
                        console.log('Error retrieve turbine dates')
                        res.send(err);
                    } else {
                        sovHasV2VModel.find( {'mmsi': mmsi, active: {$ne: false}}, ['date']).distinct('date', function ( err, v2vTransferDates) {
                            if (err) {
                                console.log('Error retrieve v2v dates')
                                res.send(err);
                            } else {
                                if (platformTransferDates && turbineTransferDates && v2vTransferDates) {
                                    const merged = platformTransferDates.concat(turbineTransferDates).concat(v2vTransferDates);
                                    res.send(merged.filter((item, index) => merged.indexOf(item) === index));
                                } else {
                                    res.send('error: failed to retrieve transfers');
                                }
                            }
                        })
                    }
                });
            }
        });
    });
});

app.get("/api/GetDatesShipHasSailedForSov/:mmsi", function (req, res) {
    const mmsi = parseInt(req.params.mmsi);
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        SovModelmodel.find({ mmsi: mmsi, active: {$ne: false}, distancekm: { $not: /_NaN_/ } }, ['dayNum', 'distancekm'], function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getTransfersForVessel/:mmsi/:date", function (req, res) {
    let mmsi = parseInt(req.params.mmsi);
    let date = req.params.date;
    req.body.mmsi = mmsi;
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        Transfermodel.find({
            mmsi: mmsi,
            date: date,
            active: {$ne: false},
            detector: {$ne: 'impact'}
        }).sort({
                startTime: 1
        }).exec(function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.post("/api/getGeneralForRange", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
    });
    var startDate = req.body.startDate;
    var stopDate = req.body.stopDate;
    var mmsi = req.body.mmsi;
    if (typeof(mmsi) === 'number') {
        mmsi = [mmsi];
    }
    projection = req.body.projection;
    if (projection === undefined) {
        projection = null
    }

    switch(req.body.vesselType) {
        case 'CTV':
            var query = {
                mmsi: {$in: mmsi},
                date: {
                    $gte: startDate,
                    $lte: stopDate
                }
            };
            return generalmodel.aggregate([
                {$match: query},
                { "$sort": {date: -1}},
                {$project: projection},
                {$group: {_id: '$mmsi', stats:{ $push: "$$ROOT"}}},
            ]).exec((err, data) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(data.map(elt => {
                        elt.stats.mmsi = elt._id;
                        return elt.stats;
                    }));
                }
            });
        case 'SOV': case 'OSV':
            var query = {
                mmsi: {$in: mmsi},
                dayNum: {
                    $gte: startDate,
                    $lte: stopDate
                }
            };
            return SovModelmodel.aggregate([
                {$match: query}, 
                {$project: projection},
                { "$sort": {date: -1}},
                {$group: {_id: '$mmsi', stats:{ $push: "$$ROOT"}}},
            ]).exec((err, data) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(data.map(elt => {
                        elt.stats.mmsi = elt._id;
                        return elt.stats;
                    }));
                }
            });
        default: 
            res.status(201).send('Invalid vessel type!')
    }
});

app.post("/api/getTransfersForVesselByRange", function (req, res) {
    aggregateStatsOverModel(Transfermodel, req, res);
});

app.post("/api/getTurbineTransfersForVesselByRangeForSOV", function (req, res) {
    aggregateStatsOverModel(SovTurbineTransfersmodel, req, res);
});

app.post("/api/getPlatformTransfersForVesselByRangeForSOV", function (req, res) {
    aggregateStatsOverModel(SovPlatformTransfersmodel, req, res);
});

app.post("/api/getTransitsForVesselByRange", function (req, res) {
    aggregateStatsOverModel(transitsmodel, req, res);
});

app.post("/api/getTransitsForVesselByRangeForSOV", function (req, res) {
    aggregateStatsOverModel(SovTransitsmodel, req, res);
});

app.get("/api/getUsers", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    Usermodel.find({}, null, {
            sort: {
                client: 'asc', permissions: 'asc'
            }
        }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
});

app.post("/api/getUsersForCompany", function (req, res) {
    let companyName = req.body[0].client;
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    }
    if (token.userPermission === "Logistics specialist" && token.userCompany !== companyName) {
        return res.status(401).send('Access denied');
    }
    Usermodel.find({
        client: companyName, 
        active: {$ne: false},
        permissions: ["Vessel master", "Marine controller"]
    }, null, {

        }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
});

app.post("/api/getUserByUsername", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    }
    Usermodel.find({
        username: req.body.username, 
        active: {$ne: false}
    }, null, {

        }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                if (token.userPermission === "Logistics specialist" && data[0].client !== token.userCompany) {
                    return res.status(401).send('Access denied');
                } else {
                    res.send(data);
                }
            }
        });
});

app.get("/api/getUserClientById/:id/:client", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin' && token.userCompany != req.params.client) {
        return res.status(401).send('Access denied');
    }
    const id = req.params.id.split(",").filter(function (el) { return el != null && el != '' });
    if(!id[0]){
        return res.send('No id given');
    }
    Usermodel.find({_id: id, active: {$ne: false}}, ['_id', 'client'], function(err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/validatePermissionToViewData", function (req, res) {
    validatePermissionToViewData(req, res, function (data) {
        res.send(data);
    });
});

app.post("/api/saveUserBoats", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Access denied');
    }
    Usermodel.findOneAndUpdate({ _id: req.body._id, active: {$ne: false} }, { boats: req.body.boats },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the permissions" });
            }
        });
});

app.get('/api/getLatestGeneral', function (req, res) {
    let token = verifyToken(req, res);
    let ctvData;
    let sovData;
    // Callback only sends data if both CTV and SOV succefully loaded, error otherwise
    const cb = () => {
        if (ctvData !== undefined && sovData !== undefined) {
            res.send(ctvData.concat(sovData));
        }
    }

    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    } else {
        generalmodel.aggregate([
            {
                $group: {
                    _id: '$mmsi',
                    'date': {$last: '$date'},
                    'vesselname': {$last: '$vesselname'},
                }
            }
        ]).exec((err, data) => {
            if (err) {
                console.log(err);
                res.send(err)
            } else {
                ctvData = data;
                cb();
            }
        });
        SovModelmodel.aggregate([
            {
                $group: {
                    _id: '$mmsi',
                    'date': {$last: '$dayNum'},
                    'vesselname': {$last: '$vesselName'},
                }
            }
        ]).exec((err, data) => {
            if (err) {
                console.log(err);
                res.send(err)
            } else {
                sovData = data;
                cb();
            }
        });
    }
})

app.post("/api/getVideoRequests", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        videoRequestedmodel.aggregate([{
                "$match": {
                    mmsi: { $in: [req.body.mmsi] }, 
                    active: {$ne: false}
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
            }
        ]).exec(function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.post("/api/getVideoBudgetByMmsi", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        videoBudgetmodel.find({
            mmsi: req.body.mmsi, 
            active: {$ne: false}
        }, null, {
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.send(err);
                } else {
                    var videoBudget = data[0];
                    if (videoBudget) {
                        var today = new Date().getTime();
                        if (videoBudget.resetDate <= today) {
                            var date = new Date(videoBudget.resetDate);
                            while (date.getTime() <= today) {
                                date.setMonth(date.getMonth() + 1);
                            }
                            data[0].resetDate = date;
                            data[0].currentBudget = 0;
                            data[0].save(function (_err, _data) {
                                if (_err) {
                                    console.log(_err);
                                    return res.send(_err);
                                } else {
                                    return res.send(data);
                                }
                            });
                        }
                    }
                    return res.send(data);
                }
            });
    });
});

app.post("/api/saveVideoRequest", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1 || !req.body.videoAvailable || req.body.video_requested.disabled) {
            return res.status(401).send('Access denied');
        }
        let token = verifyToken(req, res);
        var videoRequest = new videoRequestedmodel();
        videoRequest.mmsi = req.body.mmsi;
        videoRequest.requestID = req.body._id;
        videoRequest.videoPath = req.body.videoPath;
        videoRequest.vesselname = req.body.vesselname;
        videoRequest.date = Date.now();
        videoRequest.active = req.body.video_requested.text === "Requested" ? true : false;
        videoRequest.status = '';
        videoRequest.username = token.username;
        videoRequest.save(function (err, data) {
            if (err) {
                console.log(err);
                return res.send(err);
            } else {
                videoBudgetmodel.findOne({ mmsi: req.body.mmsi, active: {$ne: false} }, function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.send(err);
                    } else {
                        if (data) {
                            videoBudgetmodel.findOneAndUpdate({
                                mmsi: req.body.mmsi,
                                active: {$ne: false}
                            }, { 
                                maxBudget: req.body.maxBudget,
                                currentBudget: req.body.currentBudget
                            }, function (_err, _data) {
                                if (_err) {
                                    console.log(_err);
                                    return res.send(_err);
                                } else {
                                    return res.send({ data: "Succesfully saved the video request" });
                                }
                            });
                        } else {
                            var budget = new videoBudgetmodel();
                            budget.mmsi = req.body.mmsi;
                            budget.maxBudget = req.body.maxBudget;
                            budget.currentBudget = req.body.currentBudget;
                            var date = new Date();
                            budget.resetDate = date.setMonth(date.getMonth() + 1);
                            budget.save(function (_err, _data) {
                                if (_err) {
                                    console.log(_err);
                                    return res.send(_err);
                                } else {
                                    return res.send({ data: "Succesfully saved the video request" });
                                }
                            });
                        }
                    }
                });

            }
        });
    });
});

app.post("/api/resetPassword", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Access denied');
    }
    randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
    randomToken = randomToken.replace(/\//gi, '8');
    Usermodel.findOneAndUpdate({ _id: req.body._id, active: {$ne: false} }, { token: randomToken },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                let serveradres = process.env.IP_USER.split(',');
                let link = serveradres[0] + "/set-password;token=" + randomToken + ";user=" + data.username;
                let html = 'Your password has been reset to be able to use your account again you need to <a href="' + link + '">click here</a> <br>' +
                    'If that doesnt work copy the link below <br>' + link;
                mailTo('Password reset', html, data.username);
                res.send({ data: "Succesfully reset the password" });
            }
        });
});

app.post("/api/setActive", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Access denied');
    }
    Usermodel.findOneAndUpdate({ _id: req.body._id }, { active: 1 },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                var userActivity = new UserActivitymodel();
                userActivity.username = req.body.user;
                userActivity.changedUser = req.body._id;
                userActivity.newValue = 'active';
                userActivity.date = new Date();

                userActivity.save(function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                });
                res.send({ data: "Succesfully activated this user" });
            }
        });
});

app.post("/api/setInactive", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Access denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Access denied');
    }
    Usermodel.findOneAndUpdate({ _id: req.body._id }, { active: 0 },
        function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                var userActivity = new UserActivitymodel();
                userActivity.username = req.body.user;
                userActivity.changedUser = req.body._id;
                userActivity.newValue = 'inactive';
                userActivity.date = new Date();

                userActivity.save(function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.send({data: 'Failed to deactivate user!'})
                    }
                });
                res.send({ data: "Succesfully deactivated this user" });
            }
        });
});

app.post("/api/sendFeedback", function (req, res) {
    Usermodel.findOne({ _id: req.body.person, active: {$ne: false} }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if (data) {
                let html = 'feedback has been given by: ' + data.username + ' on page ' + req.body.page + '.<br><br>' +
                    'feedback message: ' + req.body.message;
                mailTo('Feedback ' + data.client, html, 'Webmasters');
            } else {
                res.send({ data: 'Feedback has not been sent, please contact BMO', status: 400 });
            }
        }
    });
    res.send({ data: 'Feedback has been sent', status: 200 });
});

app.post("/api/getUserByToken", function (req, res) {
    Usermodel.findOne({ token: req.body.passwordToken, username: req.body.user, active: {$ne: false} }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            if (data) {
                res.send({ username: data.username, userCompany: data.client, permissions: data.permissions });
            } else {
                res.send({ err: "No user" });
            }
        }
    });
});

app.post("/api/setPassword", function (req, res) {
    let userData = req.body;
    if (userData.password !== userData.confirmPassword) {
        return res.status(401).send('Passwords do not match');
    }
    Usermodel.findOneAndUpdate({
        token: req.body.passwordToken,
        active: {$ne: false}
    }, {
        password: bcrypt.hashSync(req.body.password, 10),
        secret2fa: req.body.secret2fa,
        $unset: { token: 1 }
    }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: "Succesfully reset the password" });
            }
        });
});

app.post("/api/getGeneral", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        generalmodel.find({ mmsi: req.body.mmsi, date: req.body.date, active: {$ne: false} }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: data });
            }
        });
    });
});

app.get("/api/getTurbineWarranty", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    turbineWarrantymodel.find({active: {$ne: false}}, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/getTurbineWarrantyOne", function (req, res) {
    let token = verifyToken(req, res);
    turbineWarrantymodel.findOne({
        campaignName: req.body.campaignName,
        active: {$ne: false},
        windfield: req.body.windfield,
        startDate: req.body.startDate
    }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if (!data) {
                return res.send({ err: "No TWA found" });
            }
            if (token.userPermission !== 'admin' && token.userCompany !== data.client) {
                return res.status(401).send('Access denied');
            }
            sailDayChangedmodel.find({ fleetID: data._id, active: {$ne: false} }, function (err, _data) {
                if (err) {
                    console.log(err);
                    return res.send(err);
                } else {
                    return res.send({ data: data, sailDayChanged: _data });
                }
            });
        }
    });
});

app.post("/api/getTurbineWarrantyForCompany", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin' && token.userCompany !== req.body.client && token.hasCampaigns) {
        return res.status(401).send('Access denied');
    }
    turbineWarrantymodel.find({
        client: req.body.client,
        active: {$ne: false}
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/setSaildays", function (req, res) {
    let token = verifyToken(req, res);

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

app.post("/api/addVesselToFleet", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin' && token.userCompany !== req.body.client) {
        return res.status(401).send('Access denied');
    }
    filter = {
        campaignName: req.body.campaignName,
        startDate: req.body.startDate,
        active: {$ne: false},
        windfield: req.body.windfield,
        status: "TODO" };
    if (isNaN(req.body.vessel)) {
        filter.vesselname = req.body.vessel;
    } else if (req.body.vessel) {
        filter.mmsi = req.body.vessel;
    } else {
        return res.status(400).send('No vessel entered');
    }
    vesselsToAddToFleetmodel.find(filter, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
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
                vesselToAdd.save(function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.send(err);
                    } else {
                        return res.send({ data: "Vessel added to fleet (could take up to a day to process)" });
                    }
                });
            } else {
                return res.status(400).send('Vessel is already being processed to be added');
            }
        }
    });
});

app.get("/api/getParkLocations", function (req, res) {
    let token = verifyToken(req, res);
    // ToDo: temp disabled admin check since feature has not been implemented yet 
    //if (token.userPermission !== "admin") {
    //     return res.status(401).send('Access denied');
    // }
    LatLonmodel.find({active: {$ne: false}}, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.get("/api/getParkLocationForVessels", function (req, res) {
    //ToDo: windfields do not yet have associated companies
    //ToDo: netjes afvangen als client een streepje bevat
    let companyName = req.params.company.replace('--_--', ' ');
    let token = verifyToken(req, res);
    if (token.userCompany !== companyName && token.userPermission !== "admin") {
        return res.status(401).send('Access denied');
    }
    ParkLocationmodel.find({
        client: companyName, 
        active: {$ne: false}
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.get("/api/getActiveListingsForFleet/:fleetID/:client/:stopDate", function (req, res) {
    let token = verifyToken(req, res);
    let fleetID = req.params.fleetID;
    let client = req.params.client;
    let stopDate = req.params.stopDate;
    if (token.userPermission !== 'admin' && token.userCompany !== client) {
        return res.status(401).send('Access denied');
    }
    activeListingsModel.aggregate([
        {
            $match: {
                fleetID: fleetID, 
                active: {$ne: false}
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
        }
    ]).exec(function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            var activeVessels = [];
            var currentDate = new Date().valueOf();
            if(stopDate < currentDate) {
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
            turbineWarrantymodel.findByIdAndUpdate(fleetID, { $set: { activeFleet: activeVessels } }, { new: true }, function (err, twa) {
                if (err) {
                    console.log(err);
                    return res.status(401).send('Something went went wrong with getting the active listings');
                } else {
                    return res.send({ data: data, twa: twa });
                }
            });
        }
    });
});

app.get("/api/getAllActiveListingsForFleet/:fleetID", function (req, res) {
    let token = verifyToken(req, res);
    let fleetID = req.params.fleetID;
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    activeListingsModel.find({ fleetID: fleetID, active: {$ne: false} }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/setActiveListings", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin' && token.userCompany !== req.body.client) {
        return res.status(401).send('Access denied');
    }
    let listings = req.body.listings;
    let activeVessels = [];
    let fleetID = req.body.fleetID;
    let currentDate = new Date().valueOf();
    let stopDate = req.body.stopDate;
    if(stopDate < currentDate) {
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
            activeListing.save(function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(401).send('Something went went wrong with updating one or more listing');
                }
            });
        }
    }
    turbineWarrantymodel.findByIdAndUpdate(fleetID, { $set: { activeFleet: activeVessels } }, { new: true }, function (err, data) {
        if (err) {
            return res.status(401).send('Something went went wrong with updating one or more listing');
        } else {
            return res.send({ data: "Active listings edited", twa: data });
        }
    });
});

app.post("/api/getHasSailedDatesCTV", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        hasSailedModelCTV.find({ mmsi: req.body.mmsi, active: {$ne: false}}, ['date', 'distancekm'], function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send({ data: data });
            }
        });
    });
});


app.post("/api/getVesselsToAddToFleet", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Access denied');
    }
    vesselsToAddToFleetmodel.find({ campaignName: req.body.campaignName, active: {$ne: false}, windfield: req.body.windfield, startDate: req.body.startDate }, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/saveFleetRequest", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin' && token.userPermission !== 'Logistics specialist') {
        return res.status(401).send('Access denied');
    }
    request = new turbineWarrantyRequestmodel();
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
    request.save(function(err,data) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            startDate = new Date(request.startDate);
            stopDate = new Date(request.stopDate);
            requestTime = new Date(request.requestTime);
            let html = 'A campaing has been requested, the data for the campaign: <br>'+
            "Campaign name: " + request.campaignName + " <br>" +
            "Windfield: " + request.windfield + " <br>" +
            "Client: " + request.client + " <br>" +
            "Fullfleet: " + request.fullFleet + " <br>" +
            "Activefleet: " + request.activeFleet + " <br>" +
            "Start date: " + startDate.toISOString().slice(0,10) + " <br>" +
            "Stop date: " + stopDate.toISOString().slice(0,10) + " <br>" +
            "Number of contracted vessels: " + request.numContractedVessels + " <br>" +
            "Weather day target: " + request.weatherDayTarget + " "+ request.weatherDayTargetType +" <br>" +
            "Limit Hs: " + request.limitHs + " <br>" + 
            "Username: " + request.user + " <br>" +
            "Request time: " + requestTime.toISOString().slice(0,10);
            mailTo('Campaign requested', html, "BMO Offshore");
            return res.send({ data: 'Request succesfully made' });
        }
    });
});

app.post("/api/getWavedataForDay", function (req, res) {
    let token = verifyToken(req, res);
    let date  = req.body.date;
    let site  = req.body.site;

    wavedataModel.findOne({
        date: date,
        site: site,
        active: {$ne: false}
    }, (err, data) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else if (data === null) {
            // Did not find valid data
            res.status(204).send('Not found');
        } else {
            waveSourceModel.findById(data.source, (err, meta) => {
                let company = token.userCompany;
                let hasAccessRights = token.userPermission === 'admin' || (typeof(meta.clients) == 'string'? 
                    meta.clients === company : meta.clients.some(client => client == company))
                if (err) {
                    console.log(err);
                    res.send(err);
                }  else if (!hasAccessRights) {
                    res.status(401).send('Access denied');
                } else {
                    data.meta = meta;
                    res.send(data);
                }
            })
        }
    });
});

app.post("/api/getWavedataForRange", function (req, res) {
    let token       = verifyToken(req, res);
    let startDate   = req.body.startDate;
    let stopDate    = req.body.stopDate;
    let source      = req.body.source;

    wavedataModel.find({
        date: {$gte: startDate, $lte: stopDate},
        source: source,
        active: {$ne: false}
    }, (err, datas) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else if (datas === null) {
            // Did not find valid data
            res.status(204).send('Not found');
        } else {
            datas.forEach( data =>
                waveSourceModel.findById(data.source, (err, meta) => {
                    let company = token.userCompany;
                    let hasAccessRights = token.userPermission === 'admin' || (typeof(meta.clients) == 'string'? 
                        meta.clients === company : meta.clients.some(client => client == company))
                    if (hasAccessRights) {
                        data.meta = meta;
                    } else {
                        data = null;
                    }
                })
            );
            res.send(datas);
        }
    });
});

app.get("/api/getFieldsWithWaveSourcesByCompany", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission === 'admin') {
        waveSourceModel.find({},
            {
                site: 1,
                name: 1
            },
            {
                sort: {site: 1}
            },
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(data);
                }
            }
        )
    } else {
        waveSourceModel.find(
            {
                company: {$in: [token.userCompany]},
            },
            {
                site: 1,
                name: 1,
            },
            {
                sort: {site: 1}
            },
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(data);
                }
            }
        )
    }
})

app.get('/api/getLatestTwaUpdate/', function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission === 'admin') {
        // let currMatlabDate = Math.floor((moment() / 864e5) + 719529 - 3);
        turbineWarrantymodel.find({}, {
            lastUpdated: 1
        }, (err, data) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else if (data) {
                let latestUpdate = data.reduce((prev, curr) => {
                    return Math.max(prev, curr.lastUpdated);
                }, 0)
                res.send({lastUpdate: latestUpdate});
            } else {
                res.status(400).send('No active TWA requests found!')
            }
        })
    }
})

app.get('/api/loadUserSettings', function (req, res) {
    let token = verifyToken(req, res);
    Usermodel.findOne({
        username: token.username
    }, {
        settings: 1,
        _id: 0,
    }, (err, data) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else if (data) {
            res.send(data);
        }
    })
});

app.post('/api/saveUserSettings', function (req, res) {
    let token = verifyToken(req, res);
    let newSettings = req.body;
    Usermodel.updateOne({
        username: token.username,
    }, {
        settings: newSettings
    }, (err, data) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.listen(8080, function () {
    console.log('BMO Dataviewer listening on port 8080!');
    // Why is this port hardcoded instead of calling the environment.ts file?
});


function getUTCstring() {
    const d = new Date();
    dformat = [d.getUTCFullYear(),
        (d.getMonth()+1).padLeft(),
        d.getUTCDate().padLeft()].join('-') + ' ' +
       [d.getUTCHours().padLeft(),
        d.getUTCMinutes().padLeft(),
        d.getUTCSeconds().padLeft()].join(':');
    return dformat
}

function aggregateStatsOverModel(model, req, res){
    // Default aggregation function for turbine, transfer or transit stats
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Access denied');
        }
        testObj = {
            vesselname: 1,
            mmsi: 1,
            startTime: 1,
        }
        groupObj = {
            _id: "$mmsi",
            label: {$push: "$vesselname"},
            date: {$push: "$startTime"}
        }
        const reqFields = req.body.reqFields;
        reqFields.forEach( key => {
            testObj[key] = 1;
            groupObj[key] = {$push: '$' + key};
        })
        model.aggregate([
            {
                "$match": {
                    mmsi: { $in: req.body.mmsi},
                    date: { $gte: req.body.dateMin, $lte: req.body.dateMax }
                }
            },
            { "$sort": {startTime: -1}},
            { "$project": testObj },
            { "$group": groupObj}
        ]).exec(function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
}

Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

