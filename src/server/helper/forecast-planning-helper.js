const fc_planning_models = require('../models/forecast-planning-models.js');
const geo_turbines_and_gates = require('../models/geo.js');

function getTodaysForecastPlanning(forecast_project_id) {

    todaysDate = new Date().toLocaleString().split(',')[0].replace(/\//g, "-");

    return fc_planning_models.forecastSovActiviesModel.findOne({
        forecast_id: forecast_project_id,
        date: todaysDate,
        active: { $ne: false}
    }, {}, { sort: { 'date' : -1 }}).exec();
    
};
module.exports.getTodaysForecastPlanning = getTodaysForecastPlanning;


function getForecastPlanning(forecast_project_id, date) {
    return fc_planning_models.forecastSovActiviesModel.findOne({
        forecast_id: forecast_project_id,
        date: date,
        active: { $ne: false}
    }, {}, { sort: { 'date' : -1 }}).exec();
};
module.exports.getForecastPlanning = getForecastPlanning;

function getForecastPlanningOptions(forecast_project_id) {
    return fc_planning_models.forecastSovActivityOptionsModel.findOne({
        forecast_id: forecast_project_id,
        active: { $ne: false}
    }, {}, {}).exec();
    
};
module.exports.getForecastPlanningOptions = getForecastPlanningOptions;

function getTurbinesAndGates (sitename) {
    return geo_turbines_and_gates.TurbineAndGatesModel.findOne({
        filename: sitename,
        active: { $ne: false}
    }, {}, {}).exec();
}
module.exports.getTurbinesAndGates = getTurbinesAndGates;

function combineTurbinesAndGates (turbinesAndGates) {
    turbines = turbinesAndGates.name;
    gates = turbinesAndGates.gates;
    
    resultArray = []

    turbines.forEach((turbine,index) => {
        gatesArray = [];
        gates[index].forEach(gate => {
            gatesArray.push({gateName: gate})
        })
        resultArray.push({
            turbine_name: turbine,
            gates: gatesArray
        })
    });
    return resultArray;
}
module.exports.combineTurbinesAndGates = combineTurbinesAndGates;