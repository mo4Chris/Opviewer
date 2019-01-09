import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from "chart.js";
import * as annotation from "chartjs-plugin-annotation";
import { CommonService } from "../../../../common.service";
import { SovModel } from "../models/SovModel";
import { DatetimeService } from "../../../../supportModules/datetime.service";
import { SovType } from "../models/SovType";
import { SummaryModel } from "../models/Summary";
import { CalculationService } from "../../../../supportModules/calculation.service";

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
    sovHasLimiters = false;

    vessel2vesselActivityRoute = {'lat': 0, 'lon': 0, 'latCollection': [], 'lonCollection': [], 'vessel': "", 'ctvActivityOfTransfer': undefined};
   
    //used for comparison in the HTML
    SovTypeEnum = SovType;

    constructor(private commonService: CommonService, private datetimeService: DatetimeService, private modalService: NgbModal, private calculationService: CalculationService) {}

    openVesselMap(content, vesselname: string, toMMSI: number) {

        this.vessel2vesselActivityRoute.vessel = vesselname;

        this.sovModel.vessel2vessels.forEach(vessel2vessel => {
            vessel2vessel.CTVactivity.forEach(ctvActivity => {
                if(ctvActivity.mmsi == toMMSI) {
                    this.vessel2vesselActivityRoute.ctvActivityOfTransfer = ctvActivity;
                }
            });
        });

        this.vessel2vesselActivityRoute.lat = parseFloat(this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lat[Math.floor(this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lat[0].length / 2)]);
        this.vessel2vesselActivityRoute.lon = parseFloat(this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lon[Math.floor(this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lon[0].length / 2)]);
        this.vessel2vesselActivityRoute.latCollection = this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lat;
        this.vessel2vesselActivityRoute.lonCollection = this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lon;

        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    }

    objectToInt(objectvalue) {
        return this.calculationService.objectToInt(objectvalue);
    }

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
        this.GetAvailableRouteDatesForVessel();
        this.commonService.GetSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(sov => {         
            if (sov.length !== 0) { 
                this.sovModel.sovInfo = sov[0];            
                this.GetVesselRoute();

                //Currently transits are not being used, should be removed
                this.GetTransits();

                 this.commonService.GetPlatformTransfers(this.sovModel.sovInfo.mmsi, this.vesselObject.date).subscribe(platformTransfers => {
                     if (platformTransfers.length === 0) {
                        this.commonService.GetTurbineTransfers(this.vesselObject.mmsi, this.vesselObject.date).subscribe(turbineTransfers => {        
                            if(turbineTransfers.length === 0) {
                                this.sovModel.sovType = SovType.Unknown;
                            }
                           else {
                               this.sovModel.turbineTransfers = turbineTransfers;
                               this.sovModel.sovType = SovType.Turbine;

                               //IMPORTANT!!! server.js is currently using parameters for testing. Set to given body parameters.
                               this.commonService.GetVessel2vesselsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(vessel2vessels => {  
                                    this.sovModel.vessel2vessels = vessel2vessels; 
                            }); 
                           }
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform; 
                    }
                });


                this.locShowContent = true;
            }
            else {
                this.locShowContent = false;
            }


            this.showContent.emit(this.locShowContent);
            
            //Set the timer so data is first collected on time
            setTimeout(() => {
                Chart.pluginService.register(annotation);

                this.CalculateDailySummary();
                this.createOperationalStatsChart();
                this.createGangwayLimitationsChart();
                this.CheckForNullValues();
            }, 2000);
        });
    }

    GetTransits() {
        this.commonService.GetTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
            this.sovModel.transits = transits;                    
        });
    }

    GetAvailableRouteDatesForVessel() {
        this.commonService.GetDatesShipHasSailedForSov(this.vesselObject.mmsi).subscribe(dates => {
            for (let _i = 0; _i < dates.length; _i++) {
                dates[_i] = this.datetimeService.JSDateYMDToObjectDate(this.datetimeService.MatlabDateToJSDateYMD(dates[_i]));
            }

            var sailDates = dates;
            this.sailDates.emit(sailDates);
        });
    }

    GetVesselRoute() {
        var boatlocationData = [];

        boatlocationData.push(this.sovModel.sovInfo);
        var latitude = parseFloat(this.sovModel.sovInfo.lat[Math.floor(this.sovModel.sovInfo.lat[0].length / 2)]);
        var longitude = parseFloat(this.sovModel.sovInfo.lon[Math.floor(this.sovModel.sovInfo.lon[0].length / 2)]);

        if(("" + latitude) != "NaN" && ("" + longitude) != "NaN") {
            this.latitude.emit(latitude);
            this.longitude.emit(longitude);
            this.boatLocationData.emit(boatlocationData);
        }
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
        model.maxSignificantWaveHeightdDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function(o){return o.peakHeave;})));  
        model.maxWindSpeedDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function(o){return o.peakWindGust;})));     
        return model;
    }

    GetMatlabDurationToMinutes(serial) {
        return this.datetimeService.MatlabDurationToMinutes(serial);
    }

    //Properly change undefined values to N/a
    //For number resets to decimal, ONLY specify the ones needed, don't reset time objects
    CheckForNullValues() {
        this.sovModel.sovInfo = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.sovInfo);
        this.sovModel.sovInfo.distancekm = this.calculationService.GetDecimalValueForNumber(this.sovModel.sovInfo.distancekm);
        this.sovModel.summary = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.summary);

        if(this.sovModel.sovType == SovType.Turbine) {
            this.sovModel.turbineTransfers.forEach(transfer => {
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.duration = this.calculationService.GetDecimalValueForNumber(transfer.duration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
                transfer.peakWindGust = this.calculationService.GetDecimalValueForNumber(transfer.peakWindGust);
                transfer.peakWindAvg = this.calculationService.GetDecimalValueForNumber(transfer.peakWindAvg);
            });
        }
        else if(this.sovModel.sovType == SovType.Platform) {
            this.sovModel.platformTransfers.forEach(transfer => {
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.totalDuration = this.calculationService.GetDecimalValueForNumber(transfer.totalDuration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
            });
        }
        if(this.sovModel.transits.length > 0) {
            this.sovModel.transits.forEach(transit => {
                transit = this.calculationService.ReplaceEmptyColumnValues(transit);
            });
        }
        if(this.sovModel.vessel2vessels.length > 0) {
            this.sovModel.vessel2vessels.forEach(vessel2vessel => {
                vessel2vessel.CTVactivity = this.calculationService.ReplaceEmptyColumnValues(vessel2vessel.CTVactivity);          
                vessel2vessel.transfers.forEach(transfer => {
                    transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                    transfer.duration = this.calculationService.GetDecimalValueForNumber(transfer.duration);
                    transfer.peakWindGust = this.calculationService.GetDecimalValueForNumber(transfer.peakWindGust);
                    transfer.peakWindAvg = this.calculationService.GetDecimalValueForNumber(transfer.peakWindAvg);
                });       
            });
        }
    }

    createOperationalStatsChart() {

        var timeBreakdown = this.sovModel.sovInfo.timeBreakdown;
        if(timeBreakdown != undefined) {
            
            var sailingDuration = timeBreakdown.hoursSailing != undefined ? timeBreakdown.hoursSailing.toFixed(1) : 0;
            var waitingDuration = timeBreakdown.hoursWaiting != undefined ? timeBreakdown.hoursWaiting.toFixed(1) : 0;
            var CTVopsDuration = timeBreakdown.hoursOfCTVops != undefined ? timeBreakdown.hoursOfCTVops.toFixed(1) : 0;           

            var platformDuration = timeBreakdown.hoursAtPlatform != undefined ? timeBreakdown.hoursAtPlatform.toFixed(1) : 0;
            var turbineDuration = timeBreakdown.hoursAtTurbine != undefined ? timeBreakdown.hoursAtTurbine.toFixed(1) : 0;
    
            var exclusionZone = platformDuration + turbineDuration;

            if(sailingDuration > 0) {
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
    }

    createGangwayLimitationsChart() {

        var strokedLimiterCounter = this.sovModel.turbineTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'stroke').length + this.sovModel.platformTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'stroke').length;
        var boomAngleLimiterCounter  = this.sovModel.turbineTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'boom angle').length + this.sovModel.platformTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'boom angle').length;

        if(strokedLimiterCounter > 0 || boomAngleLimiterCounter > 0) {
            this.sovHasLimiters = true;
            setTimeout(() => {
                this.gangwayLimitationsChart = new Chart("gangwayLimitations", {
                    type: "pie",
                    data: {
                        datasets: [
                            {
                                data: [strokedLimiterCounter, boomAngleLimiterCounter],
                                backgroundColor: this.backgroundcolors,
                                radius: 8,
                                pointHoverRadius: 10,
                                borderWidth: 1
                            }
                        ],
                        labels: ["Stroke limited", "Boom angle limited"]
                    },
                    options: {
                        title: {
                            display: true,
                            position: "top",
                            text: "Gangway Limitations",
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

    private ResetTransfers() {
        this.sovModel = new SovModel();
        if(this.operationsChart != undefined) {
            this.operationsChart.destroy();
            this.operationalChartCalculated = false;
        }
        if(this.gangwayLimitationsChart != undefined) {
            this.gangwayLimitationsChart.destroy();
            this.sovHasLimiters = false;
        }
    }
}
