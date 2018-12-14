import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import * as Chart from "chart.js";
import * as annotation from "chartjs-plugin-annotation";
import { CommonService } from "../../../../common.service";
import { SovModel } from "../models/SovModel";
import { DatetimeService } from "../../../../supportModules/datetime.service";
import { SovType } from "../models/SovType";
import { SummaryModel } from "../models/Summary";

@Component({
    selector: "app-sovreport",
    templateUrl: "./sovreport.component.html",
    styleUrls: ["./sovreport.component.scss"]
})
export class SovreportComponent implements OnInit {

    @Output() mapZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() boatLocationData: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() longitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() sailDates: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    locShowContent = false;

    @Input() vesselObject;

    operationsChart;
    gangwayLimitationsChart;
    chart;
    backgroundcolors = ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"];

    sovModel: SovModel = new SovModel();

    dateData = [];

    operationalChartCalculated = false;

    //used for comparison in the HTML
    SovTypeEnum = SovType;

    constructor(private commonService: CommonService, private datetimeService: DatetimeService) {}

    GetMatlabDateToJSTime(serial) {
        return this.datetimeService.MatlabDateToJSTime(serial);
    }

    GetMatlabDateToCustomJSTime(serial, format) {
        return this.datetimeService.MatlabDateToCustomJSTime(serial, format);
    }

    ngOnInit() {
        
    }

    BuildPageWithCurrentInformation() {
        this.mapZoomLvl.emit(8);
        this.ResetTransfers();
        this.commonService.GetSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(sov => {
            if (sov.length !== 0) {
                this.sovModel.sovInfo = sov[0];            
                var boatlocationData = [];
                boatlocationData.push(this.sovModel.sovInfo);
                var latitude = parseFloat(this.sovModel.sovInfo.lat[Math.floor(this.sovModel.sovInfo.lat[0].length / 2)]);
                var longitude = parseFloat(this.sovModel.sovInfo.lon[Math.floor(this.sovModel.sovInfo.lon[0].length / 2)]);

                this.latitude.emit(latitude);
                this.longitude.emit(longitude);
                this.boatLocationData.emit(boatlocationData);
                
                this.commonService.GetPlatformTransfers(this.sovModel.sovInfo.mmsi, this.vesselObject.date).subscribe(platformTransfers => {
                    if (platformTransfers.length === 0) {
                        this.commonService.GetTurbineTransfers(this.vesselObject.mmsi, this.vesselObject.date).subscribe(turbineTransfers => {         
                            if(turbineTransfers.length === 0) {
                                this.sovModel.sovType = SovType.Unknown;
                            }
                           else {
                               this.sovModel.turbineTransfers = turbineTransfers;
                               this.sovModel.sovType = SovType.Turbine;
                               this.commonService.GetVessel2vesselsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(vessel2vessels => {  
                                    this.sovModel.vessel2vessels = vessel2vessels;    
                                    
                                    //distinct per vessel activity
                                    var vessels2vesselsFiltered = vessel2vessels.filter((obj, pos, arr) => {
                                        return arr.map(mapObj => mapObj['toVesselname']).indexOf(obj['toVesselname']) === pos;
                                    });         
                                    vessels2vesselsFiltered.forEach(vessel2vessel => {
                                        this.sovModel.turbineActivities.push(vessel2vessel);
                                    }); 
                                });                       
                           }
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform; 
                    }
                });

                this.commonService.GetTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
                    this.sovModel.transits = transits;                    
                });
                this.locShowContent = true;
            }
            else {
                this.locShowContent = false;
            }

            this.commonService.GetDatesShipHasSailedForSov(this.vesselObject.mmsi).subscribe(dates => {
                for (let _i = 0; _i < dates.length; _i++) {
                    dates[_i] = this.datetimeService.JSDateYMDToObjectDate(this.datetimeService.MatlabDateToJSDateYMD(dates[_i]));
                }

                var sailDates = dates;
                this.sailDates.emit(sailDates);
            });

            this.showContent.emit(this.locShowContent);
            
            setTimeout(() => {
                Chart.pluginService.register(annotation);


                if(this.sovModel.sovType == SovType.Platform) {
                    this.createGangwayLimitationsChart();
                }

                //this.createWeatherLimitDocking1Graph();
                //this.createWeatherLimitDocking2Graph();
                //this.createWeatherLimitDocking3Graph();
                this.CalculateDailySummary();

                this.createOperationalStatsChart();

                this.CheckForNullValues();
            }, 1000);
        });
    }

    CalculateDailySummary() {
        let summaryModel = new SummaryModel();
        
        summaryModel.NrOfDaughterCraftLaunches = 0;
        summaryModel.NrOfHelicopterVisits = 0;

        if(this.sovModel.turbineTransfers.length > 0 && this.sovModel.sovType == SovType.Turbine) {
            var turbineTransfers = this.sovModel.turbineTransfers;
            
            var avgTimeDocking = turbineTransfers.reduce(function(sum, a,i,ar) { sum += a.duration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);

            summaryModel.NrOfVesselTransfers = this.sovModel.vessel2vessels.length;
            // var avgDurationVesselDocking = this.sovModel.vessel2vessels.reduce(function(sum, a,i,ar) { sum += a.duration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            // summaryModel.AvgTimeVesselDocking = this.datetimeService.MatlabDurationToMinutes(avgDurationVesselDocking);

            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
        }
        else if(this.sovModel.platformTransfers.length > 0 && this.sovModel.sovType == SovType.Platform) {
            var platformTransfers = this.sovModel.platformTransfers;

            var avgTimeInWaitingZone = platformTransfers.reduce(function(sum, a,i,ar) { sum += a.timeInWaitingZone;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeInWaitingZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInWaitingZone);

            var avgTimeInExclusionZone = platformTransfers.reduce(function(sum, a,i,ar) { sum += a.visitDuration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeInExclusionZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInExclusionZone);

            var avgTimeDocking = platformTransfers.reduce(function(sum, a,i,ar) { sum += a.totalDuration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);

            var avgTimeTravelingToPlatforms = platformTransfers.reduce(function(sum, a,i,ar) { sum += a.approachTime;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeTravelingToPlatforms = this.datetimeService.MatlabDurationToMinutes(avgTimeTravelingToPlatforms);
            
            summaryModel = this.GetDailySummary(summaryModel, platformTransfers);
        }

        this.sovModel.summary = summaryModel;
    }

    //Common used by platform and turbine
    private GetDailySummary(model: SummaryModel, transfers: any[]) {
        model.maxSignificantWaveHeightdDuringOperations = Math.max.apply(Math, transfers.map(function(o){return o.peakHeave;}));  
        model.maxWindSpeedDuringOperations = Math.max.apply(Math, transfers.map(function(o){return o.peakWindGust;}));     
        return model;
    }

    GetMatlabDurationToMinutes(serial) {
        return this.datetimeService.MatlabDurationToMinutes(serial);
    }

    CheckForNullValues() {

        this.sovModel.sovInfo = this.ReplaceEmptyColumnValues(this.sovModel.sovInfo);
        this.sovModel.summary = this.ReplaceEmptyColumnValues(this.sovModel.summary);

        if(this.sovModel.sovType == SovType.Turbine && this.sovModel.turbineTransfers.length > 0) {
            this.sovModel.turbineTransfers.forEach(transfer => {
                transfer = this.ReplaceEmptyColumnValues(transfer);
            });
        }
        else if(this.sovModel.sovType == SovType.Platform && this.sovModel.platformTransfers.length > 0) {
            this.sovModel.platformTransfers.forEach(transfer => {
                transfer = this.ReplaceEmptyColumnValues(transfer);
            });
        }
        if(this.sovModel.transits.length > 0) {
            this.sovModel.transits.forEach(transit => {
                transit = this.ReplaceEmptyColumnValues(transit);
            });
        }
        if(this.sovModel.vessel2vessels.length > 0) {
            this.sovModel.vessel2vessels.forEach(vessel2vessel => {
                vessel2vessel = this.ReplaceEmptyColumnValues(vessel2vessel);
            });
        }
        if(this.sovModel.turbineActivities.length > 0) {
            this.sovModel.turbineActivities.forEach(turbineActivity => {
                turbineActivity = this.ReplaceEmptyColumnValues(turbineActivity);
            });
        }
    }

    private ReplaceEmptyColumnValues(resetObject: any) {
        var keys = Object.keys(resetObject);  
        keys.forEach(key => {
            if(typeof(resetObject[key]) == typeof("")) {
                resetObject[key] = resetObject[key].replace('_NaN_', 'N/a');
            }
        });
        return resetObject;
    }

    getDistanceInKm() {
        return parseFloat(this.sovModel.sovInfo.distancekm).toFixed(1);
    }

    createOperationalStatsChart() {

        var timeBreakdown = this.sovModel.sovInfo.timeBreakdown;
        console.log(timeBreakdown);
        if(timeBreakdown != undefined) {
            
            var sailingDuration = timeBreakdown.hoursSailing != undefined ? timeBreakdown.hoursSailing.toFixed(1) : 0;
            var waitingDuration = timeBreakdown.hoursWaiting != undefined ? timeBreakdown.hoursWaiting.toFixed(1) : 0;
            var CTVopsDuration = timeBreakdown.hoursOfCTVops != undefined ? timeBreakdown.hoursOfCTVops.toFixed(1) : 0;           

            var platformDuration = timeBreakdown.hoursAtPlatform != undefined ? timeBreakdown.hoursAtPlatform.toFixed(1) : 0;
            var turbineDuration = timeBreakdown.hoursAtTurbine != undefined ? timeBreakdown.hoursAtTurbine.toFixed(1) : 0;
    
            var exclusionZone = platformDuration + turbineDuration;

            this.operationalChartCalculated = true;
    
            setTimeout(() => {
                this.operationsChart = new Chart("operationalStats", {
                    type: "pie",
                    data: {
                        datasets: [
                            {
                                data: [sailingDuration, waitingDuration, exclusionZone, CTVopsDuration],
                                backgroundColor: this.backgroundcolors,
                                radius: 8,
                                pointHoverRadius: 10,
                                borderWidth: 1
                            }
                        ],
                        labels: ["Sailing", "Waiting", "Exclusion zone", "CTV operations duration"]
                    },
                    options: {
                        title: {
                            display: true,
                            position: "top",
                            text: "Operational activity",
                            fontSize: 25
                        },
                        responsive: true,
                        radius: 6,
                        pointHoverRadius: 6
                    }
                });
            }, 500);
        }
    }

    createGangwayLimitationsChart() {
        this.gangwayLimitationsChart = new Chart("gangwayLimitations", {
            type: "pie",
            data: {
                datasets: [
                    {
                        data: [24, 43],
                        backgroundColor: this.backgroundcolors,
                        radius: 8,
                        pointHoverRadius: 10,
                        borderWidth: 1
                    }
                ],
                labels: ["Boom angle limited", "Stroke limited"]
            },
            options: {
                title: {
                    display: true,
                    position: "top",
                    text: "Work activity details",
                    fontSize: 25
                },
                responsive: true,
                radius: 6,
                pointHoverRadius: 6
            }
        });
    }

    // createWeatherLimitDocking1Graph() {
    //     this.chart = new Chart("weatherLimitDocking1Graph", {
    //         type: "line",
    //         data: {
    //             labels: [
    //                 "15:00",
    //                 "16:00",
    //                 "17:00",
    //                 "18:00",
    //                 "19:00",
    //                 "20:00",
    //                 "21:00"
    //             ],
    //             datasets: [
    //                 {
    //                     data: [80, 75, 5, 10, 5, 60, 60],
    //                     label: "Wind",
    //                     borderColor: "#3e95cd",
    //                     fill: false,
    //                     steppedLine: true
    //                 },
    //                 {
    //                     data: [100, 90, 25, 25, 10, 75, 80],
    //                     label: "DP",
    //                     borderColor: "#3cba9f",
    //                     fill: false,
    //                     steppedLine: true
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             title: {
    //                 display: true,
    //                 position: "top",
    //                 text: "Docking #1",
    //                 fontSize: 25
    //             },
    //             annotation: {
    //                 annotations: [
    //                     {
    //                         type: "line",
    //                         drawTime: "afterDatasetsDraw",
    //                         id: "average",
    //                         mode: "horizontal",
    //                         scaleID: "y-axis-0",
    //                         value: 30,
    //                         borderWidth: 2,
    //                         borderColor: "red"
    //                     },
    //                     {
    //                         type: "box",
    //                         drawTime: "beforeDatasetsDraw",
    //                         id: "region",
    //                         xScaleID: "x-axis-0",
    //                         yScaleID: "y-axis-0",
    //                         xMin: "17:00",
    //                         xMax: "20:00",
    //                         backgroundColor: "rgba(200,230,201,0.5)"
    //                     }
    //                 ]
    //             },
    //             scales: {
    //                 xAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Time"
    //                         }
    //                     }
    //                 ],
    //                 yAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Utilasation %"
    //                         }
    //                     }
    //                 ]
    //             }
    //         }
    //     });
    // }

    // createWeatherLimitDocking2Graph() {
    //     this.chart = new Chart("weatherLimitDocking2Graph", {
    //         type: "line",
    //         data: {
    //             labels: [
    //                 "15:00",
    //                 "16:00",
    //                 "17:00",
    //                 "18:00",
    //                 "19:00",
    //                 "20:00",
    //                 "21:00"
    //             ],
    //             datasets: [
    //                 {
    //                     data: [80, 75, 5, 10, 5, 60, 60],
    //                     label: "Wind",
    //                     borderColor: "#3e95cd",
    //                     fill: false,
    //                     steppedLine: true
    //                 },
    //                 {
    //                     data: [100, 90, 25, 25, 10, 75, 80],
    //                     label: "DP",
    //                     borderColor: "#3cba9f",
    //                     fill: false,
    //                     steppedLine: true
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             title: {
    //                 display: true,
    //                 position: "top",
    //                 text: "Docking #2",
    //                 fontSize: 25
    //             },
    //             annotation: {
    //                 annotations: [
    //                     {
    //                         type: "line",
    //                         drawTime: "afterDatasetsDraw",
    //                         id: "average",
    //                         mode: "horizontal",
    //                         scaleID: "y-axis-0",
    //                         value: 5,
    //                         borderWidth: 2,
    //                         borderColor: "red"
    //                     },
    //                     {
    //                         type: "box",
    //                         drawTime: "beforeDatasetsDraw",
    //                         id: "region",
    //                         xScaleID: "x-axis-0",
    //                         yScaleID: "y-axis-0",
    //                         xMin: "16:00",
    //                         xMax: "19:00",
    //                         backgroundColor: "rgba(200,230,201,0.5)"
    //                     }
    //                 ]
    //             },
    //             scales: {
    //                 xAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Time"
    //                         }
    //                     }
    //                 ],
    //                 yAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Utilasation %"
    //                         }
    //                     }
    //                 ]
    //             }
    //         }
    //     });
    // }

    // createWeatherLimitDocking3Graph() {
    //     this.chart = new Chart("weatherLimitDocking3Graph", {
    //         type: "line",
    //         data: {
    //             labels: [
    //                 "15:00",
    //                 "16:00",
    //                 "17:00",
    //                 "18:00",
    //                 "19:00",
    //                 "20:00",
    //                 "21:00"
    //             ],
    //             datasets: [
    //                 {
    //                     data: [80, 75, 5, 10, 5, 60, 60],
    //                     label: "Wind",
    //                     borderColor: "#3e95cd",
    //                     fill: false,
    //                     steppedLine: true
    //                 },
    //                 {
    //                     data: [100, 90, 25, 25, 10, 75, 80],
    //                     label: "DP",
    //                     borderColor: "#3cba9f",
    //                     fill: false,
    //                     steppedLine: true
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             title: {
    //                 display: true,
    //                 position: "top",
    //                 text: "Docking #3",
    //                 fontSize: 25
    //             },
    //             annotation: {
    //                 annotations: [
    //                     {
    //                         type: "line",
    //                         drawTime: "afterDatasetsDraw",
    //                         id: "average",
    //                         mode: "horizontal",
    //                         scaleID: "y-axis-0",
    //                         value: 50,
    //                         borderWidth: 2,
    //                         borderColor: "red"
    //                     },
    //                     {
    //                         type: "box",
    //                         drawTime: "beforeDatasetsDraw",
    //                         id: "region",
    //                         xScaleID: "x-axis-0",
    //                         yScaleID: "y-axis-0",
    //                         xMin: "19:00",
    //                         xMax: "21:00",
    //                         backgroundColor: "rgba(200,230,201,0.5)"
    //                     }
    //                 ]
    //             },
    //             scales: {
    //                 xAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Time"
    //                         }
    //                     }
    //                 ],
    //                 yAxes: [
    //                     {
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Utilasation %"
    //                         }
    //                     }
    //                 ]
    //             }
    //         }
    //     });
    // }

    private ResetTransfers() {
        this.sovModel = new SovModel();
        
        if(this.operationsChart != undefined) {
            this.operationsChart.destroy();
            this.operationalChartCalculated = false;
        }
        if(this.gangwayLimitationsChart != undefined) {
            this.gangwayLimitationsChart.destroy();
        }
    }
}
