const fc_planning_models = require('../models/forecast-planning-models.js');
const geo_turbines_and_gates = require('../models/geo.js');

function getTodaysForecastPlanning(forecast_project_id) {

    todaysDate = new Date().toLocaleString().split(',')[0].replace(/\//g, "-");

    return fc_planning_models.forecastSovActiviesModel.findOne({
        forecast_id: forecast_project_id,
        date: todaysDate,
    }, function(err, data) {
        if (err) return err;
        return(data);
      }, {});
    
};
module.exports.getTodaysForecastPlanning = getTodaysForecastPlanning;


function getForecastPlanning(forecast_project_id, date) {
    return fc_planning_models.forecastSovActiviesModel.findOne({
        forecast_id: forecast_project_id,
        date: date,
    }, function(err, data) {
        if (err) return err;
        return(data);
      }, 
      {});
};
module.exports.getForecastPlanning = getForecastPlanning;

function getForecastPlanningOptions(forecast_project_id) {
    return fc_planning_models.forecastSovActivityOptionsModel.findOne({
        forecast_id: forecast_project_id,
        active: { $ne: false}
    }, function(err, data) {
        if (err) return err;
        return(data);
      }, {});
    
};
module.exports.getForecastPlanningOptions = getForecastPlanningOptions;

function getTurbinesAndGates (sitename) {
    return geo_turbines_and_gates.TurbineAndGatesModel.findOne({
        filename: sitename,
        active: { $ne: false}
    }, function(err, data) {
        if (err) return err;
        return(data);
      }, {});
}
module.exports.getTurbinesAndGates = getTurbinesAndGates;

function combineTurbinesAndGates (turbinesAndGates) {
    locations = turbinesAndGates.name;
    gates = turbinesAndGates.gates;
    
    resultArray = []

    locations.forEach((location,index) => {
        gatesArray = [];
        gates[index].forEach(gate => {
            gatesArray.push({"gate_name": gate.gate_name, "gate_id": gate.gate_id})
        })
        resultArray.push({
            location_name: location,
            gates: gatesArray
        })
    });
    return resultArray;
}
module.exports.combineTurbinesAndGates = combineTurbinesAndGates;