import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import * as Chart from "chart.js";
import * as annotation from "chartjs-plugin-annotation";
import { CommonService } from "../../../../common.service";
import { SovModel } from "../models/sov-model";
import { DatetimeService } from "../../../../supportModules/datetime.service";
import { SovType } from "../models/SovType";
import { SummaryModel } from "../models/Summary";
import { ConditionDuringOperationModel } from "../models/ConditionDuringOperation";

@Component({
    selector: "app-sovreport",
    templateUrl: "./sovreport.component.html",
    styleUrls: ["./sovreport.component.scss"]
})
export class SovreportComponent implements OnInit {
    @Output() overviewZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() detailZoomLvl: EventEmitter<number> = new EventEmitter<number>();

    @Input() vesselObject;

    mapTypeId = "roadmap";
    streetViewControl = false;

    chart;
    backgroundcolors = ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"];

    loaded = false;
    sovModel: SovModel = new SovModel();

    //used for comparison in the HTML
    SovTypeEnum = SovType;

    noDataFound = false;

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
                                this.commonService.GetTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
                                    this.commonService.GetVessel2vesselsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(vessel2vessels => {
                                        if(transits.length === 0 && vessel2vessels === 0) {
                                            this.noDataFound = true;
                                        }
                                        
                                        this.sovModel.transits = transits;
                                        this.sovModel.vessel2vessels = vessel2vessels;
                                        this.sovModel.sovType = SovType.Unknown;
                                    });
                                });
                            }
                           else {
                               this.sovModel.turbineTransfers = turbineTransfers;
                               this.sovModel.sovType = SovType.Turbine;
                           }
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform;
                    }
                });
            }
            this.loaded = true;

            setTimeout(() => {
                Chart.pluginService.register(annotation);
                this.createOperationalPieChart();
                this.createworkActivityPieChart();
                this.createWOWandNoAccessPieChart();
                this.createWeatherLimitDocking1Graph();
                this.createWeatherLimitDocking2Graph();
                this.createWeatherLimitDocking3Graph();
                this.CalculateDailySummary();
                this.CalculateConditions();
            }, 500);
        });
    }

    CalculateDailySummary() {
        let summaryModel = new SummaryModel();

        if(this.sovModel.turbineTransfers.length > 0) {
            var turbineTransfers = this.sovModel.turbineTransfers;
            
            summaryModel.NrOfVesselTransfers = turbineTransfers.length;
            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
        }
        else if(this.sovModel.platformTransfers.length > 0) {
            var platformTransfers = this.sovModel.platformTransfers;
            summaryModel.NrOfPlatformsVisited = platformTransfers.length;
            
            var maxTimeInWaitingZoneSerial = Math.max.apply(Math, platformTransfers.map(function(o){ return o.Tentry1000mWaitingRange; }));
            summaryModel.TimeInWaitingZone = this.datetimeService.MatlabDateToJSTime(maxTimeInWaitingZoneSerial);

            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
        }
        this.sovModel.summary = summaryModel;
    }

    GetDailySummary(model: SummaryModel, transfers: any[]) {
        var maxIndex = transfers.length - 1;
        model.TotalSailDuration = this.datetimeService.MatlabDateToJSTimeDifference(transfers[0].startTime, transfers[maxIndex].stopTime);

        model.WindSpeedDuringOperations = Math.max.apply(Math, transfers.map(function(o){return o.peakWindGust.toFixed(1);}));
        model.AvgWindSpeedDuringOperations = transfers.reduce(function(sum, a,i,ar) { sum += a.peakWindAvg;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0).toFixed(1);
            
        model.HsDuringOperations = Math.max.apply(Math, transfers.map(function(o){return o.Hs;}));
        model.AvgHsDuringOperations = transfers.reduce(function(sum, a,i,ar) { sum += a.Hs;  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0).toFixed(1);
                
        var maxTimeInExclusionZoneSerial = Math.max.apply(Math, transfers.map(function(o){ return o.stopTime - o.startTime; }));
        model.TimeInExclusionZone = this.datetimeService.MatlabDateToJSTime(maxTimeInExclusionZoneSerial);
        var avgTimeInExclusionZoneSerial = transfers.reduce(function(sum, a,i,ar) { sum += (a.stopTime - a.startTime);  return i==ar.length-1?(ar.length==0?0:sum/ar.length):sum},0);
        model.AvgTimeInExclusionZone = this.datetimeService.MatlabDateToJSTime(avgTimeInExclusionZoneSerial);
        
        return model;
    }

    CalculateConditions() {
        let conditions: ConditionDuringOperationModel[] = [];
        this.sovModel.turbineTransfers.forEach(turbineTransfer => {
            var condition = new ConditionDuringOperationModel(
                this.datetimeService.MatlabDateToCustomJSTime(turbineTransfer.startTime, 'HH:mm'), turbineTransfer.peakWindGust.toFixed(1), turbineTransfer.peakHeave, turbineTransfer.DPutilisation, null
            );
            conditions.push(condition);
        });
        this.sovModel.conditions = conditions;
    }


    createOperationalPieChart() {
        this.chart = new Chart("operationalPieChart", {
            type: "pie",
            data: {
                datasets: [
                    {
                        data: [78, 10, 12],
                        backgroundColor: this.backgroundcolors,
                        radius: 8,
                        pointHoverRadius: 10,
                        borderWidth: 1
                    }
                ],
                labels: ["Traveling", "Approved", "Docking"]
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
    }

    createworkActivityPieChart() {
        this.chart = new Chart("workActivityPieChart", {
            type: "pie",
            data: {
                datasets: [
                    {
                        data: [24, 43, 33],
                        backgroundColor: this.backgroundcolors,
                        radius: 8,
                        pointHoverRadius: 10,
                        borderWidth: 1
                    }
                ],
                labels: ["Working", "WOWeather", "Non-access"]
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

    createWOWandNoAccessPieChart() {
        this.chart = new Chart("WOWandNoAccessPieChart", {
            type: "pie",
            data: {
                datasets: [
                    {
                        data: [39, 6, 33, 18, 4],
                        backgroundColor: this.backgroundcolors,
                        radius: 8,
                        pointHoverRadius: 10,
                        borderWidth: 1
                    }
                ],
                labels: [
                    "Wave height",
                    "Wave period",
                    "Wind speed",
                    "Wave #4",
                    "Wave #5"
                ]
            },
            options: {
                title: {
                    display: true,
                    position: "top",
                    text: "WOW and no access details",
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
        this.noDataFound = false;
        this.sovModel = new SovModel();
    }
}
