var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var db = mongo.connect("mongodb://tcwchris:geheim123@ds125288.mlab.com:25288/bmo_database", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to Database'); }
});

var app = express();
app.use(bodyParser());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
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
    boats: { type: Array }
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
        if (!token.userBoats.find({ mmsi: req.body.mmsi })) {
            return res.status(401).send('Acces denied');
        }
    } else if (token.userPermission !== 'admin') {
        filter.client = token.userCompany;
    }
    Vesselmodel.find(filter, function (err, data) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        else {
            callback(data);
            return data;
        }
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
    if (userData.password === userData.confirmPassword) {
        Usermodel.findOne({ username: userData.email },
            function (err, existingUser) {
                if (err) {
                    res.send(err);
                } else {
                    if (!existingUser) {
                        let user = new Usermodel({ "username": userData.email, "password": bcrypt.hashSync(userData.password, 10), "permissions": userData.permissions, "client": userData.client });
                        user.save((error, registeredUser) => {
                            if (error) {
                                console.log(error);
                                return res.status(401).send('User already exists');
                            } else {
                                return res.status(200).send(registeredUser);
                            }
                        });
                    } else {
                        console.log("user already exists"); //TO DO ALERT
                    }
                }
            });

    } else {
        return res.status(401).send('passwords do not match');
    }
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
                    if (bcrypt.compareSync(userData.password, user.password)) {
                        let payload = { userID: user._id, userPermission: user.permissions, userCompany: user.client, userBoats: user.boats };
                        let token = jwt.sign(payload, 'secretKey');
                        return res.status(200).send({ token });
                    } else {
                        return res.status(401).send('password is incorrect');
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
                "LON": { "$last": "$LON" },
                "LAT": { "$last": "$LAT" },
                "TIMESTAMP": { "$last": "$TIMESTAMP" }
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
                        "LON": { "$last": "$LON" },
                        "LAT": { "$last": "$LAT" },
                        "TIMESTAMP": { "$last": "$TIMESTAMP" }
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
                res.send({ data: "Succesfully saved the comment" });
            }
        });
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
