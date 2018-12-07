import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import * as Chart from "chart.js";
import * as annotation from "chartjs-plugin-annotation";
import { CommonService } from "../../../../common.service";
import { SovModel } from "../models/sov-model";
import { DatetimeService } from "../../../../supportModules/datetime.service";
import { SovType } from "../models/SovType";
import { SummaryModel } from "../models/Summary";

@Component({
    selector: "app-sovreport",
    templateUrl: "./sovreport.component.html",
    styleUrls: ["./sovreport.component.scss"]
})
export class SovreportComponent implements OnInit {
    @Output() overviewZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() detailZoomLvl: EventEmitter<number> = new EventEmitter<number>();

    @Input() vesselObject;

    operationsChart;
    gangwayLimitationsChart;
    chart;
    backgroundcolors = ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"];

    loaded = false;
    sovModel: SovModel = new SovModel();

    dateData = [];

    operationalChartCalculated = false;

    //used for comparison in the HTML
    SovTypeEnum = SovType;

    constructor(private commonService: CommonService, private datetimeService: DatetimeService) {}

    ngOnInit() {
        this.overviewZoomLvl.emit(9);
        this.detailZoomLvl.emit(10);

        this.BuildPageWithCurrentInformation();
    }

    GetMatlabDateToJSTime(serial) {
        return this.datetimeService.MatlabDateToJSTime(serial);
    }

    BuildPageWithCurrentInformation() {
        this.ResetTransfers();
        this.commonService.GetSov(this.vesselObject.mmsi).subscribe(sov => {
            if (sov.length !== 0) {
                this.sovModel.vesselname = sov[0].vesselname;
                this.sovModel.mmsi = sov[0].mmsi;          
                this.commonService.GetPlatformTransfers(this.sovModel.mmsi, this.vesselObject.date).subscribe(platformTransfers => {
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
                this.commonService.GetStationaryPeriodsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(stationaryPeriods => {
                    this.sovModel.stationaryPeriods = stationaryPeriods;       
                });
            }
            this.loaded = true;
            
            setTimeout(() => {
                Chart.pluginService.register(annotation);
                this.createOperationalStatsChart();

                if(this.sovModel.sovType == SovType.Platform) {
                    this.createGangwayLimitationsChart();
                }

                this.createWeatherLimitDocking1Graph();
                this.createWeatherLimitDocking2Graph();
                this.createWeatherLimitDocking3Graph();
                this.CalculateDailySummary();
                this.CheckForNullValues();
            }, 1000);
        });
    }

    CalculateDailySummary() {
        let summaryModel = new SummaryModel();
        
        var sumSailingDuration = 0;
        this.sovModel.transits.forEach(transit => {
            sumSailingDuration = sumSailingDuration + transit.transitTimeMinutes;
        });
        if(sumSailingDuration > 0) {
            summaryModel.TotalSailDuration = this.datetimeService.MinutesToHours(sumSailingDuration);
            summaryModel.HasSailed = true;
        }
        else {
            summaryModel.HasSailed = false;
        }
        
        summaryModel.NrOfDaughterCraftLaunches = 0;
        summaryModel.NrOfHelicopterVisits = 0;

        if(this.sovModel.turbineTransfers.length > 0 && this.sovModel.sovType == SovType.Turbine) {
            var turbineTransfers = this.sovModel.turbineTransfers;
            
            var avgTimeDocking = turbineTransfers.reduce(function(sum, a,i,ar) { sum += a.duration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);

            summaryModel.NrOfVesselTransfers = this.sovModel.vessel2vessels.length;
            var avgDurationVesselDocking = this.sovModel.vessel2vessels.reduce(function(sum, a,i,ar) { sum += a.duration;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
            summaryModel.AvgTimeVesselDocking = this.datetimeService.MatlabDurationToMinutes(avgDurationVesselDocking);

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

            var avgTimeTravelingToPlatforms = platformTransfers.reduce(function(sum, a,i,ar) { sum += a.aproachTime;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
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

        if(this.sovModel.sovType == SovType.Turbine && this.sovModel.turbineTransfers.length > 0) {
            this.sovModel.turbineTransfers = this.ReplaceEmptyColumnValues(this.sovModel.turbineTransfers);
        }
        else if(this.sovModel.sovType == SovType.Platform && this.sovModel.platformTransfers.length > 0) {
            this.sovModel.platformTransfers = this.ReplaceEmptyColumnValues(this.sovModel.platformTransfers);
        }

        if(this.sovModel.stationaryPeriods.length > 0) {
            this.sovModel.stationaryPeriods = this.ReplaceEmptyColumnValues(this.sovModel.stationaryPeriods);
        }
        if(this.sovModel.transits.length > 0) {
            this.sovModel.transits = this.ReplaceEmptyColumnValues(this.sovModel.transits);
        }
        if(this.sovModel.vessel2vessels.length > 0) {
            this.sovModel.vessel2vessels = this.ReplaceEmptyColumnValues(this.sovModel.vessel2vessels);
        }
        if(this.sovModel.turbineActivities.length > 0) {
            this.sovModel.turbineActivities = this.ReplaceEmptyColumnValues(this.sovModel.turbineActivities);
        }
    }

    private ReplaceEmptyColumnValues(collection: any[]) {
        var keys = Object.keys(collection[0]);  
        collection.forEach(transfer => {
            keys.forEach(key => {
                if(typeof(transfer[key]) == typeof("")) {
                    transfer[key] = transfer[key].replace('_NaN_', 'N/a');
                }
            });
        });
        return collection;
    }

    createOperationalStatsChart() {

        var sumSailingDuration = 0;
        var sumWaitingDuration = 0;
        var sumExclusionZone = 0;

        this.sovModel.transits.forEach(transit => {
            sumSailingDuration = sumSailingDuration + transit.transitTimeMinutes;
        });

        if(this.sovModel.sovType == SovType.Platform) {
            this.sovModel.platformTransfers.forEach(platformTransfer => {
                sumWaitingDuration = sumWaitingDuration + platformTransfer.timeInWaitingZone;
                sumExclusionZone = sumExclusionZone + platformTransfer.visitDuration;
            });
        }
        else if(this.sovModel.sovType == SovType.Turbine) {
            this.sovModel.turbineTransfers.forEach(turbineTransfer => {
                sumWaitingDuration = sumWaitingDuration + turbineTransfer.gangwayReadyDuration;
                sumExclusionZone = sumExclusionZone + turbineTransfer.gangwayDeployedDuration;
            });
        }

        if(sumSailingDuration > 0 && sumWaitingDuration > 0 && sumExclusionZone > 0) {
            this.operationalChartCalculated = true;
            var totalSum = sumSailingDuration + sumWaitingDuration + sumExclusionZone;
            var sailingDurationPerc = ((sumSailingDuration / totalSum) * 100).toFixed(1);
            var sumWaitingDurationPerc = ((sumWaitingDuration / totalSum) * 100).toFixed(1);
            var sumExclusionZonePerc = ((sumExclusionZone / totalSum) * 100).toFixed(1);


            setTimeout(() => {
                this.operationsChart = new Chart("operationalStats", {
                    type: "pie",
                    data: {
                        datasets: [
                            {
                                data: [sailingDurationPerc, sumWaitingDurationPerc, sumExclusionZonePerc],
                                backgroundColor: this.backgroundcolors,
                                radius: 8,
                                pointHoverRadius: 10,
                                borderWidth: 1
                            }
                        ],
                        labels: ["Sailing", "Waiting", "Exclusion zone"]
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

    createWeatherLimitDocking1Graph() {
        this.chart = new Chart("weatherLimitDocking1Graph", {
            type: "line",
            data: {
                labels: [
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00"
                ],
                datasets: [
                    {
                        data: [80, 75, 5, 10, 5, 60, 60],
                        label: "Wind",
                        borderColor: "#3e95cd",
                        fill: false,
                        steppedLine: true
                    },
                    {
                        data: [100, 90, 25, 25, 10, 75, 80],
                        label: "DP",
                        borderColor: "#3cba9f",
                        fill: false,
                        steppedLine: true
                    }
                ]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    position: "top",
                    text: "Docking #1",
                    fontSize: 25
                },
                annotation: {
                    annotations: [
                        {
                            type: "line",
                            drawTime: "afterDatasetsDraw",
                            id: "average",
                            mode: "horizontal",
                            scaleID: "y-axis-0",
                            value: 30,
                            borderWidth: 2,
                            borderColor: "red"
                        },
                        {
                            type: "box",
                            drawTime: "beforeDatasetsDraw",
                            id: "region",
                            xScaleID: "x-axis-0",
                            yScaleID: "y-axis-0",
                            xMin: "17:00",
                            xMax: "20:00",
                            backgroundColor: "rgba(200,230,201,0.5)"
                        }
                    ]
                },
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Time"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Utilasation %"
                            }
                        }
                    ]
                }
            }
        });
    }

    createWeatherLimitDocking2Graph() {
        this.chart = new Chart("weatherLimitDocking2Graph", {
            type: "line",
            data: {
                labels: [
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00"
                ],
                datasets: [
                    {
                        data: [80, 75, 5, 10, 5, 60, 60],
                        label: "Wind",
                        borderColor: "#3e95cd",
                        fill: false,
                        steppedLine: true
                    },
                    {
                        data: [100, 90, 25, 25, 10, 75, 80],
                        label: "DP",
                        borderColor: "#3cba9f",
                        fill: false,
                        steppedLine: true
                    }
                ]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    position: "top",
                    text: "Docking #2",
                    fontSize: 25
                },
                annotation: {
                    annotations: [
                        {
                            type: "line",
                            drawTime: "afterDatasetsDraw",
                            id: "average",
                            mode: "horizontal",
                            scaleID: "y-axis-0",
                            value: 5,
                            borderWidth: 2,
                            borderColor: "red"
                        },
                        {
                            type: "box",
                            drawTime: "beforeDatasetsDraw",
                            id: "region",
                            xScaleID: "x-axis-0",
                            yScaleID: "y-axis-0",
                            xMin: "16:00",
                            xMax: "19:00",
                            backgroundColor: "rgba(200,230,201,0.5)"
                        }
                    ]
                },
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Time"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Utilasation %"
                            }
                        }
                    ]
                }
            }
        });
    }

    createWeatherLimitDocking3Graph() {
        this.chart = new Chart("weatherLimitDocking3Graph", {
            type: "line",
            data: {
                labels: [
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00"
                ],
                datasets: [
                    {
                        data: [80, 75, 5, 10, 5, 60, 60],
                        label: "Wind",
                        borderColor: "#3e95cd",
                        fill: false,
                        steppedLine: true
                    },
                    {
                        data: [100, 90, 25, 25, 10, 75, 80],
                        label: "DP",
                        borderColor: "#3cba9f",
                        fill: false,
                        steppedLine: true
                    }
                ]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    position: "top",
                    text: "Docking #3",
                    fontSize: 25
                },
                annotation: {
                    annotations: [
                        {
                            type: "line",
                            drawTime: "afterDatasetsDraw",
                            id: "average",
                            mode: "horizontal",
                            scaleID: "y-axis-0",
                            value: 50,
                            borderWidth: 2,
                            borderColor: "red"
                        },
                        {
                            type: "box",
                            drawTime: "beforeDatasetsDraw",
                            id: "region",
                            xScaleID: "x-axis-0",
                            yScaleID: "y-axis-0",
                            xMin: "19:00",
                            xMax: "21:00",
                            backgroundColor: "rgba(200,230,201,0.5)"
                        }
                    ]
                },
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Time"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Utilasation %"
                            }
                        }
                    ]
                }
            }
        });
    }

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
