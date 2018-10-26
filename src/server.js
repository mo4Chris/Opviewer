var express = require('express');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var nodemailer = require('nodemailer');

require('dotenv').config({path:__dirname+'/./../.env'});

var db = mongo.connect("mongodb://tcwchris:geheim123@ds125288.mlab.com:25288/bmo_database", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to Database'); }
});

var app = express();
app.use(bodyParser());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    var allowedOrigins = process.env.IP_USER;
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin)
    }    

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_PORT==465),
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
    token: { type: String }
}, { versionKey: false });
var Usermodel = mongo.model('users', userSchema, 'users');

var VesselsSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number }
}, { versionKey: false });
var Vesselmodel = mongo.model('vessels', VesselsSchema, 'vessels');

var ScatterSchema = new Schema({
    name: { type: String },
    timestamp: { type: String },
    mmsi: { type: Number }
}, { versionKey: false });
var Scattermodel = mongo.model('placeholder_scatter', ScatterSchema, 'placeholder_scatter');

var TransferSchema = new Schema({
    mmsi: { type: Number },
    vesselname:{ type: String },
    date:{ type: Number },
    startTime: { type: Number },
    stopTime: { type: Number },
    duration: { type: Number },
    location: { type: String },
    fieldname: { type: String },
    comment: { type: String },
    detector: { type: String }
}, { versionKey: false });
var Transfermodel = mongo.model('transfers', TransferSchema, 'transfers');

var LatLonSchema = new Schema({
    filename: { type: String },
    SiteName: { type: String }
}, { versionKey: false });
var LatLonmodel = mongo.model('turbineLocations', LatLonSchema, 'turbineLocations');

var boatCrewLocationSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number }
}, { versionKey: false });
var boatCrewLocationmodel = mongo.model('crew', boatCrewLocationSchema, 'crew');

var boatLocationSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number }
}, { versionKey: false });
var boatLocationmodel = mongo.model('AISdata', boatLocationSchema, 'AISdata');

var CommentsChangedSchema = new Schema({
    mmsi: { type: Number },
    newComment: { type: String },
    idTransfer: { type: String },
    otherComment: { type: String },
    userID: { type: String },
    date: { type: Number }
}, { versionKey: false });
var CommentsChangedmodel = mongo.model('CommentsChanged', CommentsChangedSchema, 'CommentsChanged');

//#########################################################
//#################   Functionality   #####################
//#########################################################

function verifyToken(req, res) {
    if (!req.headers.authorization){
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authorization;
    if (token === 'null'){
        return res.status(401).send('Unauthorized request');
    }

    let payload = jwt.verify(token, 'secretKey');

    if (payload === 'null'){
        return res.status(401).send('Unauthorized request');
    }
    return payload;
}

function validatePermissionToViewData(req, res, callback) {
    let token = verifyToken(req, res);
    let filter = { mmsi: req.body.mmsi };
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        if (!token.userBoats.find(x => x.mmsi === req.body.mmsi )) {
            return [];
        }
    } else if (token.userPermission !== 'admin') {
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
        to: process.env.EMAIL, //'bar@example.com, baz@example.com' list of receivers
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

//#########################################################
//#################   Endpoints   #########################
//#########################################################

app.post("/api/registerUser", function (req, res) {
    let userData = req.body;
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin") {
        if (token.userPermission === "Logistics specialist" && token.userCompany !== userData.client) {
            return res.status(401).send('Acces denied');
        } else if (token.userPermission !== "Logistics specialist") {
            return res.status(401).send('Acces denied');
        }
    }
    Usermodel.findOne({ username: userData.email },
        function (err, existingUser) {
            if (err) {
                res.send(err);
            } else {
                if (!existingUser) {
                    randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
                    let user = new Usermodel({
                        "username": userData.email,
                        "token": randomToken,
                        "permissions": userData.permissions,
                        "client": userData.client,
                        "password": bcrypt.hashSync("hanspasswordtocheck", 10) //password shouldn't be set when test phase is over
                    });
                    user.save((error, registeredUser) => {
                        if (error) {
                            console.log(error);
                            return res.status(401).send('User already exists');
                        } else {
                            let link = process.env.IP_USER + "/set-password;token=" + randomToken + ";user=" + user.username;
                            let html = 'A account for the BMO dataviewer has been created for this email. To activate your account <a href="' + link + '">click here</a> <br>' +
                            'If that doesnt work copy the link below <br>' + link;
                            mailTo('Registered user', html, user.username);
                            return res.send({ data: 'User created' , status: 200 });
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

    Usermodel.findOne({ username: userData.username },
        function (err, user) {
            if (err) {
                res.send(err);
            } else {
                if (!user) {
                    return res.status(401).send('User does not exist');
                } else {
                    /*if (!user.password) {
                        return res.status(401).send('Account needs to be activated before loggin in, check your email for the link');
                    } else*/ //Has to be implemented when test phase is over
                    if (bcrypt.compareSync(userData.password, user.password)) {
                        let payload = { userID: user._id, userPermission: user.permissions, userCompany: user.client, userBoats: user.boats };
                        let token = jwt.sign(payload, 'secretKey');
                        return res.status(200).send({ token });
                    } else {
                        return res.status(401).send('Password is incorrect');
                    }
                }
            }
        });
});

app.post("/api/saveVessel", function (req, res) {
    var mod = new model(req.body);
    let token = verifyToken(req, res);
    if (req.body.mode === "Save") {
        if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
            return res.status(401).send('Acces denied');
        }
        mod.save(function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Record has been Inserted..!!" });
            }
        });
    }
    else {
        if (token.userPermission !== "admin") {
            return res.status(401).send('Acces denied');
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
            return res.status(401).send('Acces denied');
        }
        var mod = new CommentsChangedmodel();
        mod.newComment = req.body.comment;
        mod.otherComment = req.body.commentChanged.otherComment;
        mod.idTransfer = req.body._id;
        mod.date = req.body.commentDate;
        mod.mmsi = req.body.mmsi;
        mod.userID = req.body.userID;
        mod.save(function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the comment" });
            }
        });
    });
});

app.post("/api/getCommentsForVessel", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1 ) {
            return res.status(401).send('Acces denied');
        }
        CommentsChangedmodel.aggregate([
            {
                "$match": {
                    mmsi: { $in: [req.body.mmsi] }
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
        return res.status(401).send('Acces denied');
    }
    Vesselmodel.find({

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

app.post("/api/getVesselsForCompany", function (req, res) {
    let companyName = req.body[0].client;
    let token = verifyToken(req, res);
    if (token.userCompany !== companyName && token.userPermission !== "admin") {
        return res.status(401).send('Acces denied');
    }
    let filter = { client: companyName };
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
        return res.status(401).send('Acces denied');
    }
    Vesselmodel.find().distinct('client', function (err, data) {
        if (err) {
            res.send(err);
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
            return res.status(401).send('Acces denied');
        }
        Transfermodel.find({ "mmsi": req.body.mmsi, "date": req.body.date }).distinct('fieldname', function (err, data) {
            if (err) {
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

//TO DO beschrijvende naam
app.get("/api/getLatLon", function (req, res) {
    LatLonmodel.find({}, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/getSpecificPark", function (req, res) {
    LatLonmodel.find({
        filename: { $in: req.body.park }
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
        return res.status(401).send('Acces denied');
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
            return res.status(401).send('Acces denied');
        }
        boatLocationmodel.find({
            "TIMESTAMP": { $regex: req.body.dateNormal, $options: 'i' },
            "MMSI": req.body.mmsi
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

app.post("/api/getCrewRouteForBoat", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Acces denied');
        }
        boatCrewLocationmodel.find({
            "date": req.body.date,
            "mmsi": req.body.mmsi
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

app.post("/api/getLatestBoatLocationForCompany", function (req, res) {
    let companyName = req.body[0].companyName;
    let companyMmsi = [];
    let token = verifyToken(req, res);
    if (token.userCompany !== companyName && token.userPermission !== "admin") {
        return res.status(401).send('Acces denied');
    }
    Vesselmodel.find({ client: companyName }, function (err, data) {
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
                        MMSI: { $in: companyMmsi }
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
            return res.status(401).send('Acces denied');
        }
        Transfermodel.find({ mmsi: req.body.mmsi }).distinct('date', function (err, data) {
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

app.post("/api/getTransfersForVessel", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Acces denied');
        }

        Transfermodel.find({ mmsi: req.body.mmsi, date: req.body.date }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.post("/api/getTransfersForVesselByRange", function (req, res) {
    validatePermissionToViewData(req, res, function (validated) {
        if (validated.length < 1) {
            return res.status(401).send('Acces denied');
        }
        Transfermodel.find({ mmsi: req.body.mmsi, date: { $gte: req.body.dateMin, $lte: req.body.dateMax } }, function (err, data) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    });
});

app.get("/api/getUsers", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== 'admin') {
        return res.status(401).send('Acces denied');
    }
    Usermodel.find({

    }, null, {

    }, function (err, data) {
        if (err) {
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
        return res.status(401).send('Acces denied');
    }
    if (token.userPermission === "Logistics specialist" && token.userCompany !== companyName) {
        return res.status(401).send('Acces denied');
    }
    Usermodel.find({
        client: companyName,
        permissions: ["Vessel master", "Marine controller"]
    }, null, {

    }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

app.post("/api/getUserByUsername", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Acces denied');
    }
    Usermodel.find({
        username: req.body.username
    }, null, {

    }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if (token.userPermission === "Logistics specialist" && data[0].client !== token.userCompany) {
                return res.status(401).send('Acces denied');
            } else {
                res.send(data);
            }
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
        return res.status(401).send('Acces denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Acces denied');
    }
    Usermodel.findOneAndUpdate({ _id: req.body._id }, { boats: req.body.boats },
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully saved the permissions" });
            }
        });
});

app.post("/api/resetPassword", function (req, res) {
    let token = verifyToken(req, res);
    if (token.userPermission !== "admin" && token.userPermission !== "Logistics specialist") {
        return res.status(401).send('Acces denied');
    } else if (token.userPermission === "Logistics specialist" && req.body.client !== token.userCompany) {
        return res.status(401).send('Acces denied');
    }
    randomToken = bcrypt.hashSync(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), 10);
    Usermodel.findOneAndUpdate({ _id: req.body._id }, { token: randomToken, $unset: { password: 1 } },
    function (err, data) {
        if (err) {
            res.send(err);
        } else {
            let link = process.env.IP_USER + "/set-password;token=" + randomToken + ";user=" + data.username;
            let html = 'Your password has been reset to be able to use your account again you need to <a href="' + link + '">click here</a> <br>' +
            'If that doesnt work copy the link below <br>' + link;
            mailTo('Password reset', html, data.username);
            res.send({ data: "Succesfully reset the password" });
        }
    });
});

app.post("/api/getUserByToken", function (req, res) {
    Usermodel.findOne({ token: req.body.passwordToken, username: req.body.user }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            if (data) {
                res.send({ username: data.username });
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
    Usermodel.findOneAndUpdate({ token: req.body.passwordToken }, { password: bcrypt.hashSync(req.body.password, 10), $unset: { token: 1} },
        function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Succesfully reset the password" });
            }
        });
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
