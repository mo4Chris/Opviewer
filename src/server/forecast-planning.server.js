const fc_planning_helper = require('./helper/forecast-planning-helper.js')


// #################### Actual API ####################

/**
 * Server file with all the secure endpoints to the admin database.
 *
 * @param {import("express").Application} app Main application
 * @param {import("pino").Logger} logger Logger class
 * @param {(subject: string, body: string, recipient: string) => void} mailTo
 * @api public
 */

/*
###########################################################################
################################ Endpoints ################################
###########################################################################
*/

module.exports = function (
  app,
  logger
) {

    app.get("/api/fc-planning/getPlanning/:projectID", async function(req, res) {
        let forecast_project_id = req.params.projectID;

        let todaysPlanning = await fc_planning_helper.getTodaysForecastPlanning(forecast_project_id) || [];

        res.send(todaysPlanning);
    });

    app.get("/api/fc-planning/getPlanning/:projectID/:date", async function(req, res) {
        let forecast_project_id = req.params.projectID;
        let forecast_date = req.params.date;

        let todaysPlanning = await fc_planning_helper.getForecastPlanning(forecast_project_id, forecast_date) || [];
        
        res.send(todaysPlanning);
    });

    app.get("/api/fc-planning/getPlanningSettingsAndTurbines/:projectID/:windfarmName", async function(req, res) {
        let forecast_project_id = req.params.projectID;
        let windfarmName = req.params.windfarmName || 'AOWF_turbine_coordinates';
        let turbinesAndGates

        let planningOptions = await fc_planning_helper.getForecastPlanningOptions(forecast_project_id);
        
        await fc_planning_helper.getTurbinesAndGates(windfarmName).then(function(response) {
            turbinesAndGates = fc_planning_helper.combineTurbinesAndGates(response)
        });

        const returnData = {
            project_id: forecast_project_id,
            activity_options: planningOptions.activity_options,
            turbines: turbinesAndGates
        }
        res.send(returnData);
    });

}