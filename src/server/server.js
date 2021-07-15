var express = require('express');
var jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
var pino = require('pino');
var env = require('./helper/env')

var mo4lightServer = require('./mo4light.server.js');
var fileUploadServer = require('./file-upload.server.js');
var mo4AdminServer = require('./administrative.server.js');
var mo4AdminPostLoginServer = require('./admin.postlogin.server.js');

var {mongo} = require("./helper/connections");
var ctv = require('./models/ctv.js')
var sov = require('./models/sov.js')
var geo = require('./models/geo.js')
var twa = require('./models/twa.js')
var videoRequests = require('./models/video_requests.js')
var weather = require('./models/weather.js');
const { default: axios } = require('axios');

const connections = require('./helper/connections')

//#########################################################
//########### Init up application middleware  #############
//#########################################################

var app = express();

var logger = pino({level: env.LOGGING_LEVEL})

var app = express();
app.use(express.json({ limit: '5mb' }));

app.get("/api/connectionTest", function(req, res) {
  logger.debug('Hello world');
  res.send("Hello World");
})

app.use(express.urlencoded({ extended: true }));

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

const SECURE_METHODS = ['GET', 'POST', 'PUT', 'PATCH']


//#########################################################
//##################   Models   ###########################
//#########################################################
var Schema = mongo.Schema;
var VesselsSchema = new Schema({
  mmsi: { type: Number },
  nicename: { type: String },
  client: { type: Array },
  active: { type: Boolean },
  operationsClass: { type: String },
}, { versionKey: false });
var Vesselmodel = mongo.model('vessels', VesselsSchema, 'vessels');

var userActivitySchema = new Schema({
  username: { type: String },
  changedUser: Schema.Types.ObjectId,
  newValue: { type: String },
  date: { type: Number }
}, { versionKey: false });
var UserActivitymodel = mongo.model('userActivityChanges', userActivitySchema, 'userActivityChanges');

var upstreamSchema = new Schema({
  type: String,
  date: String,
  user: String,
  content: Object,
}, { versionKey: false });
var upstreamModel = mongo.model('pushUpstream', upstreamSchema, 'pushUpstream');

//############################################################
//#################  Support functions  ######################
//############################################################
function onUnauthorized(res, cause = 'unknown') {
  logger.trace('Performing onUnauthorized')
  const req = res.req;
  logger.warn({
    msg: `Bad request: ${cause}`,
    type: 'BAD_REQUEST',
    cause,
    username: req?.token?.username,
    url: req.url,
  })
  if (cause == 'unknown') {
    res.status(401).send('Unauthorized request')
  } else {
    res.status(401).send(`Unauthorized: ${cause}`)
  }
}

function onOutdatedToken(res, token, cause = 'Outdated token, please log in again') {
  logger.trace('Performing onOutdatedToken')
  const req = res.req;
  if (token == undefined) return;
  logger.warn({
    msg: `Outdated request: ${cause}`,
    type: 'OUTDATED_REQUEST',
    cause,
    username: token?.username,
    url: req?.url,
  })

  res.status(460).send(cause);
}

function onError(res, raw_error, additionalInfo = 'Internal server error') {
  logger.debug('Triggering onError')

  const err_keys = typeof(raw_error)=='object' ? Object.keys(raw_error) : [];
  let err = {};
  try {
    if (typeof(raw_error) == 'string') {
      logger.debug('Got text error: ', raw_error)
      err.message = raw_error;
    } else if (axios.isAxiosError(raw_error)) {
      logger.debug('Got axios error')
      err.message = raw_error.response?.data?.message ?? 'Unspecified axios error';
      err.axios_url = raw_error?.config?.url;
      err.axios_method = raw_error?.config?.method;
      err.axios_data = raw_error?.config?.data;
      err.axios_response_data = raw_error?.response?.data;
      err.axios_status = raw_error.response?.status;
    } else if (err_keys.some(k => k=='schema') && err_keys.some(k => k=='table')) {
      logger.debug('Got postgres error')
      err = raw_error;
    } else {
      logger.debug('Got other error (catchall)')
      err = raw_error;
    }
    err.url = res.req?.url;
    err.method = res.req?.method;
    err.username = res.req?.token?.username;
    err.usertype = res.req?.token?.userPermission;
    err.stack = (new Error()).stack;

    logger.error(err, additionalInfo)
    res.status(500).send(additionalInfo);
  } catch (err) {
    console.error(err)
  }
}

function onBadRequest(res, cause = 'Bad request') {
  if (typeof cause == 'object' && cause['errors'] != null) {
    const param = cause['errors']?.[0]?.['param'] ?? 'unknown';
    const msg = cause['errors']?.[0]?.['msg'] ?? 'unknown issue';
    cause = `Invalid value for "${param}": ${msg}`;
  }

  logger.trace('Performing onBadRequest')
  const req = res.req;
  logger.warn({
    msg: `Bad request: ${cause}`,
    type: 'BAD_REQUEST',
    cause,
    username: req?.token?.username ?? 'UNKNOWN',
    url: req.url,
  })
  if (cause == 'Bad request') {
    res.status(400).send('Bad request')
  } else {
    res.status(400).send(cause)
  }
}


function verifyToken(req, res, next) {
  logger.trace('Assigning token')
  try {
    const isSecureMethod = SECURE_METHODS.some(method => method == req.method);
    if (!isSecureMethod) return next();
    const token = _verifyToken(req, res);

    if (!token) return; // Error already thrown in verifyToken
    req['token'] = token;
    next();
  } catch (err) {
    return onError(res, err);
  }
}
function _verifyToken(req, res) {
  logger.trace('Verifing token')
  try {
    if (!req.headers.authorization) return onUnauthorized(res, 'Missing headers');

    const token = req.headers.authorization;
    if (token == null || token === 'null')  return onUnauthorized(res, 'Token missing!');

    const payload = jwt.verify(token, 'secretKey');
    if (payload == null || payload == 'null') return onUnauthorized(res, 'Token corrupted!');

    if(typeof(payload?.['userID']) !== 'number') return onOutdatedToken(res, payload)

    const lastActive = new Date()
    connections.admin.query(`UPDATE "userTable" SET "last_active"=$1 WHERE user_id=$2`, [
      lastActive,
      payload['userID']
    ])
    return payload;
  } catch (err) {
    return onError(res, err, 'Failed to parse jwt token')
  }
}

/**
 * Verifies whether or not a user has permission to view data based on mmsi
 *
 * @param {any} req Request
 * @param {Response} res
 * @param {(tf) => void} callback
 * @returns {void};
 */
function validatePermissionToViewVesselData(req, res, callback) {
  logger.trace('Validating permission to view vessel data')
  const token = req['token'];
  const mmsi = req.body['mmsi'] ?? req['params'].mmsi;
  if (token.permission.admin) return callback(true)

  if (!token.permission.user_see_all_vessels_client) {
    logger.debug('Verifying vessel are included in token')
    const user_vessels = token.userBoats;
    const mmsi_in_token = checkPermission(user_vessels.map(v => v.mmsi));
    if (!mmsi_in_token) return res.onUnauthorized(`Usertoken error: unauthorized for vessel ${mmsi}`);
  }

  const client_id = token.client_id;
  const query = `SELECT v."mmsi"
  FROM "vesselTable" v
  where $1=ANY(v."client_ids")
  `
  logger.debug('Getting client vessels from admin db')
  connections.admin.query(query, [client_id]).then(sqlresponse => {
    logger.trace('Got sql response!')
    const client_vessel_mmsi = sqlresponse.rows.map(r => r.mmsi);
    const mmsi_in_token = checkPermission(client_vessel_mmsi);
    logger.debug('Getting client vessels from admin db')
    if (!mmsi_in_token) return res.onUnauthorized(`User not authorized for vessel ${mmsi}`);
    callback(true);
  }).catch(res.onError)

  function checkPermission(verified_mmsi_list = [0]) {
    if (Array.isArray(mmsi)) {
      const some_mmsi_not_valid = mmsi.some((body_mmsi) => {
        const has_match = verified_mmsi_list.some(_mmsi => _mmsi == body_mmsi)
        return !has_match; // true iff no match found
      })
      return !some_mmsi_not_valid;
    } else {
      return verified_mmsi_list.some(_mmsi => _mmsi == mmsi);
    }
  }
}

function mailTo(subject, html, user) {
  // setup email data with unicode symbols
  logger.trace('Sending mail')
  const maillogger = logger.child({ recipient: user, subject: subject }); // Attach email to the logs
  const body = 'Dear ' + user + ', <br><br>' + html + '<br><br>' + 'Kind regards, <br> MO4';

  const mailOptions = {
    from: '"MO4 Dataviewer" <no-reply@mo4.online>', // sender address
    to: user, //'bar@example.com, baz@example.com' list of receivers
    bcc: env.WEBMASTER_MAIL, //'bar@example.com, baz@example.com' list of bcc receivers
    subject: subject, //'Hello ✔' Subject line
    html: body //'<b>Hello world?</b>' html body
  };

  // send mail with defined transport object
  maillogger.info('Sending email')
  connections.mailer.sendMail(mailOptions, (error, info) => {
    if (error) return maillogger.error(error);
    maillogger.info('Message sent with id: %s', info.messageId);
  });
}

function sendUpstream(content, type, user, confirmFcn = function(){}) {
  // Assumes the token has been validated
  logger.trace('Upstream save')
  const date = getUTCstring();
  upstreamModel.create({
    dateUTC: date,
    user: user,
    type: type,
    content: content
  }, confirmFcn);
};


//####################################################################
//#################   Endpoints - no login   #########################
//####################################################################
app.use((req, res, next) => {
  logger.debug({
    msg: `${req.method}: ${req.url}`,
    method: req.method,
    url: req.url
  });

  res['onError'] = (err, additionalInfo) => onError(res, err, additionalInfo);
  res['onUnauthorized'] = (cause) => onUnauthorized(res, cause);
  res['onBadRequest'] = (cause) => onBadRequest(res, cause);
  next();
})

mo4AdminServer(app, logger, connections.admin, mailTo)

// ################### APPLICATION MIDDLEWARE ###################
// #### Every method below this block requires a valid token ####
// ##############################################################
app.use(verifyToken)

app.use(verifyDemoAccount);

mo4lightServer(app, logger, connections.admin)
fileUploadServer(app, logger)
mo4AdminPostLoginServer(app, logger, connections.admin, mailTo)


//####################################################################
//#################  Endpoints - with login  #########################
//####################################################################

app.get("/api/getActiveConnections", function(req, res) {
  const token = req['token']
  if (!token.permission.admin) return onUnauthorized(res, 'Only admin may request active connections!');
  res.send({
    body: 'This is not yet tracked'
  });
})


app.post("/api/saveTransfer", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    var comment = new ctv.CommentsChangedModel();
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
      ctv.TransferModel.findOneAndUpdate({
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
    ctv.GeneralModel.findOneAndUpdate({
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
    sov.SovWaveSpectrumModel.find({
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
    sov.SovWaveSpectrumModel.find({
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
    ctv.CommentsChangedModel.aggregate([{
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
  getVesselsForUser(req, res).then(response => {
    res.send(response)
  }
    ).catch(err => onError(res,err));
});


async function getVesselsForUser (req, res) {
  const token = req['token'];

  if (token.permission.admin) return await getVesselsForAdmin(token, res);
  if (token.permission.user_see_all_vessels_client) return await getAllVesselsForClient(token, res);
  return await getAssignedVessels(token, res);
}

async function getVesselsForAdmin(token, res) {
  if (!token.permission.admin) throw new Error('Unauthorized user, Admin only');
  let vessels = [];
  let PgQuery = `
  SELECT
    "vesselTable"."mmsi",
    "vesselTable".nicename,
    "vesselTable"."client_ids",
    "vesselTable"."active",
    "vesselTable"."operations_class"
  FROM "vesselTable"`;

  vessels = await connections.admin.query(PgQuery).then(sql_response => {
    const response =  sql_response.rows;
    return response;
  });

  const PgQueryClients = `select  u."mmsi", array_agg(c."client_name")
  from (
    select "vesselTable"."mmsi" mmsi, unnest("vesselTable"."client_ids") id
    from "vesselTable"
  ) u
  join "clientTable" c on c."client_id" = u.id
  group by 1`

  return await connections.admin.query(PgQueryClients).then(sql_client_response => {
    let vesselList = [];
    vessels.forEach(vessel => {
      const clientsArray = sql_client_response.rows.find(element => element.mmsi == vessel.mmsi);
      vessel.client = clientsArray.array_agg;
      vesselList.push(vessel);
    });
    return vesselList;
  });
}

async function getAllVesselsForClient(token, res) {
  if (!token.permission.user_see_all_vessels_client)  throw new Error('Unauthorized user, not allowed to see all vessels');
  //temporarily change MO4 to BMO since the values in the MongoDB still show BMO
  if (token.userCompany == 'MO4') token.userCompany = 'BMO'

  let PgQuery = `
  SELECT
    "vesselTable"."mmsi",
    "vesselTable".nicename,
    "vesselTable"."client_ids",
    "vesselTable"."active",
    "vesselTable"."operations_class"
  FROM "vesselTable"
  WHERE $1=ANY("vesselTable"."client_ids")`;

  const values = [token.client_id];

  return connections.admin.query(PgQuery, values).then(sql_response => {
    return sql_response.rows;
  });
}

async function getAssignedVessels(token, res) {
  logger.debug('Getting assigned vessels')
  let PgQuery = `
  SELECT "vesselTable"."mmsi",
  "vesselTable"."mmsi",
  "vesselTable".nicename,
  "vesselTable"."client_ids",
  "vesselTable"."active",
  "vesselTable"."operations_class"
    FROM "vesselTable"
    INNER JOIN "userTable"
    ON "vesselTable"."vessel_id"=ANY("userTable"."vessel_ids")
    WHERE "userTable"."user_id"=$1`;
  const values = [token.userID]
  const sql_response = await connections.admin.query(PgQuery, values);
  return sql_response.rows;
}

app.get("/api/getVesselsForClientByUser/:username", function(req, res) {
  const username = req.params.username;
  getAllVesselsForClientByUsername(req, res, username).then(response => {
    res.send(response)
  }).catch(err => onError(res,err));
});

app.post("/api/getVesselNameAndIDById", function(req, res) {
  const vessel_ids = req.body.vessel_ids;
  const PgQuery = `SELECT vessel_id, nicename
  FROM "vesselTable"
  WHERE "vesselTable"."vessel_id" =ANY($1)`;
  const values = [vessel_ids];

  connections.admin.query(PgQuery, values).then(sql_response => {
    res.send(sql_response.rows);
  });
});

async function getAllVesselsForClientByUsername(req, res, username) {
  const token = req['token'];

  if (!token.permission.user_see_all_vessels_client) throw new Error('Unauthorized user, not allowed to see all vessels');
  //temporarily change MO4 to BMO since the values in the MongoDB still show BMO
  if (token.userCompany == 'MO4') token.userCompany = 'BMO'

  let PgQueryClientID = `
    SELECT "client_id"
    FROM "userTable"
    WHERE "username"= $1
  `;

  const clientIDValues = [username];
  const clientID = await connections.admin.query(PgQueryClientID, clientIDValues).then(sql_response => {
    return sql_response.rows[0].client_id;
  });

  let PgQuery = `
  SELECT
    "vesselTable"."mmsi",
    "vesselTable".nicename,
    "vesselTable"."vessel_id",
    "vesselTable"."active",
    "vesselTable"."operations_class"
  FROM "vesselTable"
  WHERE $1=ANY("vesselTable"."client_ids")`;
  const values = [clientID];
  return connections.admin.query(PgQuery, values).then(sql_response => {
    return sql_response.rows;
  });
}

app.get("/api/getHarbourLocations", function(req, res) {
  geo.HarbourModel.find({
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
    sov.SovGeneralModel.find({ "mmsi": mmsi, "dayNum": date, active: { $ne: false } }, function(err, data) {
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
    sov.SovTransitsModel.find({
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
    sov.SovVessel2vesselTransfersModel.find({
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
    sov.SovRovOperationsModel.findOne({ "mmsi": mmsi, "date": date, active: { $ne: false } }, function(err, data) {
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
    sov.SovRovOperationsModel.findOneAndUpdate({
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
    ctv.EngineDataModel.find({
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
    sov.SovCycleTimesModel.find({
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
    sov.SovPlatformTransfersModel.find({
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
    sov.SovTurbineTransfersModel.find({
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
    ctv.TransferModel.find({
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
    sov.SovTurbineTransfersModel.find({
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
  geo.PlatformLocationModel.find({
    filename: req.body.Name,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    if (data.length == 0) return res.status(404).send(null)
    res.send(data);
  });
});

app.post("/api/getSpecificPark", function(req, res) {
  geo.LatLonModel.find({
    filename: { $in: req.body.park },
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getParkByNiceName/:parkName", function(req, res) {
  const parkName = req.params.parkName;
  geo.LatLonModel.find({
    SiteName: parkName,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getLatestBoatLocation/", async function(req, res) {
  const uservessels = await getVesselsForUser(req);
  if (!Array.isArray(uservessels)) return null;

  const companyMmsi = uservessels.map(v => v['mmsi'])
  geo.VesselLocationModel.aggregate([{
      "$match": {
        MMSI: { $in: companyMmsi },
        active: { $ne: false }
      }
    },
    {
      $group: {
        _id: "$MMSI",
        "LON": { "$last": "$LON" },
        "LAT": { "$last": "$LAT" },
        "TIMESTAMP": { "$last": "$TIMESTAMP" }
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
    if (err) return onError(res, err, 'Failed to query vessel locations');
    res.send(data);
  });
});

app.post("/api/getDatesWithValues", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    ctv.TransferModel.find({
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
    sov.SovDprInputModel.find({
      mmsi: req.body.mmsi,
      date: req.body.date,
      active: { $ne: false }
    }, function(err, data) {
      if (err) return onError(res, err);
      if (data.length > 0) return res.send(data);
      sov.SovDprInputModel.findOne({
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
        let sovDprData = new sov.SovDprInputModel(dprData);

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
    sov.SovHseDprInputModel.find({
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
      let sovHseDprData = new sov.SovHseDprInputModel(hseData);

      sovHseDprData.save((err, hseData) => {
        if (err) return onError(res, err);
        res.send(hseData);
      });
    });
  });
});

app.post("/api/updateSOVHseDpr", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    sov.SovHseDprInputModel.findOneAndUpdate({
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
    sov.SovHseDprInputModel.findOneAndUpdate({
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
      sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovTurbineTransfersModel.findOneAndUpdate({
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
    sov.SovVessel2vesselTransfersModel.findOneAndUpdate({
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
    sov.SovInfoModel.find({
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
    sov.SovVessel2vesselTransfersModel.findOne({
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
        sov.SovVessel2vesselTransfersModel.findOneAndUpdate({
          mmsi: req.body.mmsi,
          date: req.body.date,
          active: { $ne: false }
        }, update, (err, data) => {
          if (err) return onError(res, err);
          res.send({ data: "Succesfully saved the v2v transfer stats" });
        });
      } else { // v2v does not yet exist
        new sov.SovVessel2vesselTransfersModel({
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
    sov.SovPlatformTransfersModel.findOneAndUpdate({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
      env.SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date
      // ToDo: set proper recipient
    let title = 'DPR signoff for ' + vesselname + ' ' + dateString;
    let recipient = [];

    setTimeout(function() {
      mailTo(title, _body, recipient)
    }, 3000);
  });
});

app.post("/api/saveDprSigningClient", function(req, res) {
  const token = req['token']
  validatePermissionToViewVesselData(req, res, function(validated) {
    sov.SovDprInputModel.updateOne({
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
  let recipient = env.WEBMASTER_MAIL;
  let vesselname = req.body.vesselName || '<invalid vessel name>';
  let dateString = req.body.dateString || '<invalid date>';
  validatePermissionToViewVesselData(req, res, function(validated) {
    sov.SovDprInputModel.updateOne({
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

    sov.SovDprInputModel.findOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {}, (err, data) => {
      if (err || data.length === 0) {
        if (err) return onError(res, err);

        recipient = env.WEBMASTER_MAIL;
        title = 'Failed to deliver: skipper not found!'
      } else {
        recipient = data.signedOff.signedOffSkipper
        title = 'DPR signoff refused by client';
      }
    });

    const _body = 'The dpr for vessel ' + vesselname + ',' + dateString +
      ' has been refused by client. Please correct the dpr accordingly and sign off again!<br><br>' +
      'Link to the relevant report:<br>' +
      env.SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date +
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
    sov.SovHseDprInputModel.updateOne({
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
    sov.SovHseDprInputModel.findOne({
      mmsi: mmsi,
      date: date,
      active: { $ne: false }
    }, {}, (err, data) => {
      if (err || data.length === 0) {
        if (err) return onError(res, err);
        recipient = [env.WEBMASTER_MAIL]
        title = 'Failed to deliver: skipper not found!'
      } else {
        recipient = data.signedOff.signedOffSkipper
        title = 'HSE DPR signoff refused by client';
      }
    });

    const _body = 'The HSE DPR for vessel ' + vesselname + ', ' + dateString +
      ' has been refused by client. Please correct the dpr accordingly and sign off again!<br><br>' +
      'Link to the relevant report:<br>' +
      env.SERVER_ADDRESS + '/reports/dpr;mmsi=' + mmsi + ';date=' + date +
      '<br><br>Feedback from client:<br>' + req.body.feedback;
    // ToDo: set proper recipient
    setTimeout(function() {
      mailTo(title, _body, recipient)
    }, 3000);
  });
});

app.post("/api/saveQHSERemark", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    sov.SovHseDprInputModel.updateOne({
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
    sov.SovHseDprInputModel.updateOne({
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
    sov.SovHseDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovDprInputModel.updateOne({
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
    sov.SovHasPlatformTransferModel.find({
      "mmsi": mmsi,
      active: { $ne: false }
    }, ['date']).distinct('date', function(err, platformTransferDates) {
      if (err) return onError(res, err);
      sov.SovHasTurbineTransferModel.find({
        "mmsi": mmsi,
        active: { $ne: false }
      }, ['date']).distinct('date', function(err, turbineTransferDates) {
        if (err) return onError(res, err);
        sov.SovHasV2vModel.find({
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
    sov.SovGeneralModel.find({
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
    ctv.TransferModel.find({
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
  return ctv.GeneralModel.aggregate([
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
  return sov.SovGeneralModel.aggregate([
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
  aggregateStatsOverModel(ctv.TransferModel, req, res);
});

app.post("/api/getTurbineTransfersForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(sov.SovTurbineTransfersModel, req, res);
});

app.post("/api/getPlatformTransfersForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(sov.SovPlatformTransfersModel, req, res, { date: 'arrivalTimePlatform' });
});

app.post("/api/getGeneralForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(sov.SovGeneralModel, req, res);
});

app.post("/api/getVessel2vesselsByRangeForSov", function(req, res) {
  aggregateStatsOverModel(sov.SovVessel2vesselTransfersModel, req, res);
});

app.post("/api/getTransitsForVesselByRange", function(req, res) {
  aggregateStatsOverModel(ctv.TransitsModel, req, res);
});

app.post("/api/getTransitsForVesselByRangeForSOV", function(req, res) {
  aggregateStatsOverModel(sov.SovTransitsModel, req, res);
});

app.post("/api/getEnginesForVesselByRange", function(req, res) {
  aggregateStatsOverModel(ctv.EngineDataModel, req, res, { date: 'date' });
});

app.post("/api/getPortcallsByRange", function(req, res) {
  aggregateStatsOverModel(sov.PortcallModel, req, res);
});

app.post("/api/getDprInputsByRange", function(req, res) {
  aggregateStatsOverModel(sov.SovDprInputModel, req, res);
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

  if (!token.permission.admin) return onUnauthorized(res);
  ctv.GeneralModel.aggregate([{
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
  sov.SovGeneralModel.aggregate([{
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
    videoRequests.VideoRequestedModel.aggregate([{
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
    videoRequests.VideoBudgetModel.find({
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
    var videoRequest = new videoRequests.VideoRequestedModel();
    videoRequest.mmsi = req.body.mmsi;
    videoRequest.requestID = req.body._id;
    videoRequest.videoPath = req.body.videoPath;
    videoRequest.vesselname = req.body.vesselname;
    videoRequest.date = Date.now();
    videoRequest.active = req.body.video_requested.text === "Requested" ? true : false;
    videoRequest.status = '';
    videoRequest.username = token.username;

    videoRequests.VideoRequestedModel.findOneAndUpdate({
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
      videoRequests.VideoBudgetModel.findOne({
        mmsi: req.body.mmsi,
        active: { $ne: false }
      }, function(err, data) {
        if (err) return onError(res, err);

        if (data) {
          videoRequests.VideoBudgetModel.findOneAndUpdate({
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
          const budget = new videoRequests.VideoBudgetModel;
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
    ctv.GeneralModel.find({
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
  if (!token.permission.admin) return onUnauthorized(res);
  twa.TurbineWarrantyModel.find({
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/getTurbineWarrantyOne", function(req, res) {
  const token = req['token']
  twa.TurbineWarrantyModel.findOne({
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
    if (!token.permission.admin && token.userCompany !== data.client) return onUnauthorized(res);
    twa.SailDayChangedModel.find({
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
  if (!token.permission.admin && token.userCompany !== req.body.client && token.permission.twa.read) return onUnauthorized(res);
  twa.TurbineWarrantyModel.find({
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
    var sailDayChanged = new twa.SailDayChangedModel();
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
  if (!token.permission.admin && token.userCompany !== req.body.client) return onUnauthorized(res);
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
  twa.VesselsToAddToFleetModel.find(filter, function(err, data) {
    if (err) return onError(res, err);
    if (data.length === 0) {
      var vesselToAdd = new twa.VesselsToAddToFleetModel();
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
  geo.LatLonModel.find({ active: { $ne: false } }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.get("/api/getActiveListingsForFleet/:fleetID/:client/:stopDate", function(req, res) {
  const token = req['token']
  let fleetID = req.params.fleetID;
  let client = req.params.client;
  let stopDate = +req.params.stopDate;
  if (!token.permission.admin && token.userCompany !== client) return onUnauthorized(res);
  twa.ActiveListingsModel.aggregate([{
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
    twa.TurbineWarrantyModel.findByIdAndUpdate(fleetID, {
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
  if (!token.permission.admin) return onUnauthorized(res);
  twa.ActiveListingsModel.find({
    fleetID: fleetID,
    active: { $ne: false }
  }, function(err, data) {
    if (err) return onError(res, err);
    res.send(data);
  });
});

app.post("/api/setActiveListings", function(req, res) {
  const token = req['token']
  if (!token.permission.admin && token.userCompany !== req.body.client) return onUnauthorized(res);
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
      let activeListing = new twa.ActiveListingsModel();
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
        activeListing.deleted = 0;
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
  twa.TurbineWarrantyModel.findByIdAndUpdate(fleetID, { $set: { activeFleet: activeVessels } }, { new: true }, function(err, data) {
    if (err) return onError(res, err);
    res.send({ data: "Active listings edited", twa: data });
  });
});

app.post("/api/getHasSailedDatesCTV", function(req, res) {
  validatePermissionToViewVesselData(req, res, function(validated) {
    ctv.HasSailedModelCTV.find({
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
  if (!token.permission.admin) return onUnauthorized(res);
  twa.VesselsToAddToFleetModel.find({
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
  if (!token.permission.admin && !token.permission.user_manage) return onUnauthorized(res);
  const request = new twa.TurbineWarrantyRequestModel();
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
    mailTo('Campaign requested', html, env.WEBMASTER_MAIL);
    return res.send({ data: 'Request succesfully made' });
  });
});

app.post("/api/getWavedataForDay", function(req, res) {
  const token = req['token']
  let date = req.body.date ?? 0;
  let site = req.body.site ?? 'NONE';

  weather.WavedataModel.findOne({
    date,
    site,
    active: { $ne: false }
  }, (err, data) => {
    if (err) return onError(res, err);
    if (data?.source == null) return res.status(204).send({data: 'Not found'});

    weather.WaveSourceModel.findById(data.source, (err, meta) => {
      if (err) return onError(res, err);
      let company = token.userCompany;
      let hasAccessRights = token.permission.admin|| (typeof(meta.clients) == 'string' ?
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

  weather.WavedataModel.find({
    date: { $gte: startDate, $lte: stopDate },
    source: source,
    active: { $ne: false }
  }, (err, datas) => {
    if (err) return onError(res, err);
    if (datas === null) return res.status(204).send('Not found');

    datas.forEach(data =>
      weather.WaveSourceModel.findById(data.source, (err, meta) => {
        if (err) return onError(res, err);
        let company = token.userCompany;
        let hasAccessRights = token.permission.admin || (typeof(meta.clients) == 'string' ?
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
  if (token.permission.admin) return weather.WaveSourceModel.find({}, {
      site: 1,
      name: 1
    }, {
      sort: { site: 1 }
    }, (err, data) => {
      if (err) return onError(res, err);
      res.send(data);
    }
  )
  weather.WaveSourceModel.find({
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
})

app.get('/api/getLatestTwaUpdate/', function(req, res) {
  const token = req['token']
  if (token.permission.admin) {
    // let currMatlabDate = Math.floor((moment() / 864e5) + 719529 - 3);
    twa.TurbineWarrantyModel.find({}, {
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

app.listen(env.SERVER_PORT, function() {
  logger.info(`MO4 Dataviewer listening on port ${env.SERVER_PORT}!`);
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


/**
 * Verifies if a demo account is still active
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @api public
 */
function verifyDemoAccount(req, res, next) {
  // Checks for user demo permissions
  logger.trace('Verifying demo account')
  const token = req['token'];
  const isSecureMethod = SECURE_METHODS.some(method => method == req.method);
  if (!isSecureMethod) return next();

  const query = `SELECT u."active", u."demo_expiration_date", p."user_type", p."demo"
    FROM "userTable" u
    LEFT JOIN "userPermissionTable" p
    ON "u"."user_id" = "p"."user_id"
    where u."user_id"=$1`;
  const values = [token.userID]

  connections.admin.query(query, values).then(sql_response => {
    const data = sql_response.rows[0];
    let currentDate = new Date();
    if(!data.active) return onOutdatedToken(res, 'Your account is inactive');

    if (!data.demo) return next();
    if (data.demo_expiration_date == null) return next();
    const expiration_date = new Date(data.demo_expiration_date)
    if (expiration_date.valueOf() > currentDate.valueOf()) return next();

    const user_type = data.user_type;
    if (user_type == 'demo'){
      const setUserInactiveQuery = 'UPDATE "userTable" SET "active"=false where "user_id"=$1';
      connections.admin.query(setUserInactiveQuery, values).catch(res.onError);
      return onUnauthorized(res, 'Demo account expired!');
    } else {
      const setDemoToFalseQuery = `UPDATE "userPermissionTable"
        SET "demo"=false
            "demo_expiration_date"=null
        WHERE "user_id"=$1`;
      connections.admin.query(setDemoToFalseQuery, values).catch(res.onError);
      res.send(data);
    }
  }).catch(err => res.onError(err, 'Error querying admin DB'))
}
