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

var ScatterSchema = new Schema({
    name: { type: String },
    timestamp: { type: String },
    mmsi: { type: Number },
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
    detector: { type: String },
}, { versionKey: false });
var Transfermodel = mongo.model('transfers', TransferSchema, 'transfers');

var LatLonSchema = new Schema({
    filename: { type: String },
    SiteName: { type: String }
}, { versionKey: false });
var LatLonmodel = mongo.model('turbineLocations', LatLonSchema, 'turbineLocations');

var boatLocationSchema = new Schema({
    vesselname: { type: String },
    nicename: { type: String },
    client: { type: String },
    mmsi: { type: Number },
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
    console.log(req.userId);
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
    let userData = req.body;

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

app.post("/api/saveTransfer", function (req, res) {
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
        }
        else {
            res.send({ data: "Succesfully saved the comment" });
        }
    });
})

app.post("/api/getCommentsForVessel", function (req, res) {
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
        }
        else {
            res.send(data);

        }
    });
})

app.get("/api/getVessel", function (req, res) {
    Vesselmodel.find({

    }, null ,{
        sort:{
           client: 'asc', nicename:'asc'
        }
    }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})

app.post("/api/getVesselsForCompany", function (req, res) {
    let companyName = req.body[0].client;
    Vesselmodel.find({
        client: companyName

    }, null ,{
        sort:{
            nicename: 'asc'
        }
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

app.post("/api/getDistinctFieldnames", function (req, res) {
    
    Transfermodel.find({"mmsi": req.body.mmsi, "date": req.body.date}).distinct('fieldname', function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            let fieldnameData = data + '';
            let arrayOfFields = [];
            arrayOfFields = fieldnameData.split(",");
            res.send(arrayOfFields);
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

app.post("/api/GetSpecificPark", function (req, res) {

    LatLonmodel.find({ 
            filename : {$in:req.body.park }
    }, function (err, data) {
        if (err) {
            console.log(err);
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

app.post("/api/getRouteForBoat", function(req, res){
    boatLocationmodel.find({
        "TIMESTAMP" : { $regex: req.body.dateNormal, $options: 'i' },
        "MMSI": req.body.mmsi
    }, function(err, data){
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            res.send(data); 
        }    
    });
})

app.post("/api/getLatestBoatLocationForCompany", function (req, res) {
    let companyName = req.body[0].companyName;
    let companyMmsi = [];
    
    Vesselmodel.find({ client: companyName }, function(err, data){
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            for(i = 0; i< data.length;){
                companyMmsi.push(data[i].mmsi);
                i++;
            }

            boatLocationmodel.aggregate([
                { 
                    "$match": { 
                        MMSI : {$in:companyMmsi }
                    }
                },
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
        }    
    });
})

app.post("/api/getDatesWithValues", function (req, res) {
    Transfermodel.find({ mmsi: req.body.mmsi }).distinct('date', function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            let dateData = data + '';
            let arrayOfDates = [];
            arrayOfDates = dateData.split(",");
            res.send(arrayOfDates);
        }
    });
})

app.post("/api/GetTransfersForVessel", function (req, res) {
    Transfermodel.find({ mmsi: req.body.mmsi , date: req.body.date }, function(err, data){
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            res.send(data); 
        }    
    });

})

app.post("/api/getScatter", function (req, res) {
    Scattermodel.find({}, function (err, data) {
        if (err) {
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
