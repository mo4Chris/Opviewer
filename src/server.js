var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var db = mongo.connect("mongodb://tcwchris:geheim123@ds125288.mlab.com:25288/bmo_database", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to ' + db, ' + '/*, response*/); }
});

var app = express()
app.use(bodyParser());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
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
    client: {type: String}
}, { versionKey: false });
var Usermodel = mongo.model('users', userSchema, 'users');

var VesselsSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number },
}, { versionKey: false });
var Vesselmodel = mongo.model('vessels', VesselsSchema, 'vessels');

var LatLonSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number },
}, { versionKey: false });
var LatLonmodel = mongo.model('WindparksGeoLocation', LatLonSchema, 'WindparksGeoLocation');

var boatLocationSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number },
}, { versionKey: false });
var boatLocationmodel = mongo.model('AISdata', boatLocationSchema, 'AISdata');

//#########################################################
//#################   Functionality   #####################
//#########################################################

function verifyToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1];

    if (token === 'null'){
        return res.status(401).send('Unauthorized request')
    }

    let payload = jwt.verify(token, 'secretKey')

    if (payload === 'null'){
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

//#########################################################
//#################   Endpoints   #########################
//#########################################################

app.post("/api/registerUser", function(req,res){
    let userData = req.body;

    if(userData.password === userData.confirmPassword){
        Usermodel.findOne({username: userData.email}, 
            function (err, existingUser) {
                if (err) {
                    res.send(err);
                }
                else {
                    if(!existingUser){
                        let user = new Usermodel({"username": userData.email, "password": bcrypt.hashSync(userData.password, 10), "permissions": "user", "client": userData.client});
                                user.save((error, registeredUser) =>{
                                    if(error){
                                        console.log(error);
                                        res.status(401).send('User already exists');
                                    }else{
                                        res.status(200).send(registeredUser);
                                    }
                                });
                    } else {
                        console.log("user already exists");
                    }
                }
            });
        
    }  else{
        res.status(401).send('passwords do not match');
    }
})

app.post("/api/login", function(req,res){
    let userData = req.body

    Usermodel.findOne({username: userData.username}, 
        function (err, user) {
            if (err) {
                res.send(err);
            }
            else {
                if(!user){
                    res.status(401).send('User does not exist')
                }else
                {
                    if(bcrypt.compareSync(userData.password, user.password)){
                        let payload = { userID: user._id, userPermission: user.permissions, userCompany: user.client };
                        let token = jwt.sign(payload, 'secretKey');
                        res.status(200).send({token});    
                    }else{
                        res.status(401).send('password is incorrect');
                    }
                }
            }
        });
})

app.post("/api/SaveVessel", function (req, res) {
    var mod = new model(req.body);
    if (req.body.mode == "Save") {
        mod.save(function (err, data) {
            if (err) {
                res.send(err);
            }
            else {
                res.send({ data: "Record has been Inserted..!!" });
            }
        });
    }
    else {
        Vesselmodel.findByIdAndUpdate(req.body.id, { name: req.body.name, address: req.body.address },
            function (err, data) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send({ data: "Record has been Updated..!!" });
                }
            });


    }
})

app.get("/api/getVessel", function (req, res) {
    Vesselmodel.find({


    }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})

app.get("/api/getCompanies", function (req, res) {
    
    Vesselmodel.find().distinct('client', function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            let BusinessData = data + '';
            let arrayOfCompanies = [];
            arrayOfCompanies = BusinessData.split(",");
            res.send(arrayOfCompanies);
        }
    });
})

app.get("/api/getLatLon", function (req, res) {
    LatLonmodel.find({}, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})

app.get("/api/getLatestBoatLocation", function (req, res) {

    boatLocationmodel.aggregate([
        { $group: {
            _id : "$MMSI",
            "LON": { "$last": "$LON" },
            "LAT": { "$last": "$LAT" },
            "TIMESTAMP": { "$last": "$TIMESTAMP" }
        }}
    ]).exec(function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            res.send(data);

        }           
    });
})

app.listen(8080, function () {

    console.log('Example app listening on port 8080!')
})