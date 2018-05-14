var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");

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

var Schema = mongo.Schema;

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
    // boatLocationmodel.find({
       
    // }, function (err, data) {
    //     if (err) {
    //         res.send(err);
    //     }
    //     else {
    //         res.send(data);
    //     }
    // });

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