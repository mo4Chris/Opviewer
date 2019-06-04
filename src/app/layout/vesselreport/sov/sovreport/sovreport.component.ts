import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as annotation from 'chartjs-plugin-annotation';
import { CommonService } from '../../../../common.service';
import { SovModel } from '../models/SovModel';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { SovType } from '../models/SovType';
import { SummaryModel } from '../models/Summary';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { TurbineLocation } from '../../models/TurbineLocation';

@Component({
    selector: 'app-sovreport',
    templateUrl: './sovreport.component.html',
    styleUrls: ['./sovreport.component.scss']
})
export class SovreportComponent implements OnInit {

    @Output() mapZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() boatLocationData: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() turbineLocationData: EventEmitter<any> = new EventEmitter<any>();
    @Output() platformLocationData: EventEmitter<any> = new EventEmitter<any>();
    @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() longitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() sailDates: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() routeFound: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() vesselObject;
    @Input() mapPixelWidth;

    sovModel: SovModel = new SovModel();

    // used for comparison in the HTML
    SovTypeEnum = SovType;

    locShowContent = false;
    vessel2vesselActivityRoute = { 'lat': 0, 'lon': 0, 'latCollection': [], 'lonCollection': [], 'zoomLevel': 5, 'vessel': '', 'ctvActivityOfTransfer': undefined, 'hasTurbineTransfers': false, 'turbineLocations': Array<TurbineLocation>() };
    turbineLocations = new Array<any>();

    // Charts
    operationsChart;
    gangwayLimitationsChart;
    weatherOverviewChart
    operationalChartCalculated = false;
    weatherOverviewChartCalculated = false;
    sovHasLimiters = false;
    backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];

    iconMarkerSailedBy = {
        url: '../../../../assets/images/visitedTurbineIcon.png',
        scaledSize: {
          width: 10,
          height: 10
        }
    }
    
    iconMarkerNotVisited = {
        url: '../../../../assets/images/turbineIcon.png',
        scaledSize: {
          width: 10,
          height: 10
        }
    }

    constructor(private commonService: CommonService, private datetimeService: DatetimeService, private modalService: NgbModal, private calculationService: CalculationService) { }

    openVesselMap(content, vesselname: string, toMMSI: number) {
        this.vessel2vesselActivityRoute.vessel = vesselname;
        this.sovModel.vessel2vessels.forEach(vessel2vessel => {
            vessel2vessel.CTVactivity.forEach(ctvActivity => {
                if (ctvActivity.mmsi === toMMSI) {
                    this.vessel2vesselActivityRoute.ctvActivityOfTransfer = ctvActivity;
                    if("object" == typeof(ctvActivity.turbineVisits)) {
                        this.vessel2vesselActivityRoute.hasTurbineTransfers = true;
                    }
                }
            });
        });
        //Set up for turbines locations view on map
        if(this.vessel2vesselActivityRoute.hasTurbineTransfers) {
            this.turbineLocations.forEach(turbineLocation => {
                for(let index = 0; index < turbineLocation.lat.length; index++) {
                    let isVisited = false;
                    this.vessel2vesselActivityRoute.ctvActivityOfTransfer.turbineVisits.forEach(turbineVisit => {
                        if(turbineLocation.name[index] == turbineVisit.location) {
                            isVisited = true
                            return
                        }
                    });
                    if (isVisited){
                        this.vessel2vesselActivityRoute.turbineLocations.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], ""));
                    }else{
                        this.vessel2vesselActivityRoute.turbineLocations.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], turbineLocation.name[index]));
                    }
                };
            });
        }
        let map = document.getElementById('routeMap');
        const mapProperties = this.calculationService.GetPropertiesForMap(map.offsetWidth, this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lat, this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lon);
        this.vessel2vesselActivityRoute.lat = mapProperties.avgLatitude;
        this.vessel2vesselActivityRoute.lon = mapProperties.avgLongitude;
        this.vessel2vesselActivityRoute.zoomLevel = mapProperties.zoomLevel;
        this.vessel2vesselActivityRoute.latCollection = this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lat;
        this.vessel2vesselActivityRoute.lonCollection = this.vessel2vesselActivityRoute.ctvActivityOfTransfer.map.lon;
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }

    objectToInt(objectvalue) {
        return this.calculationService.objectToInt(objectvalue);
    }

    GetMatlabDateToJSTime(serial) {
        return this.datetimeService.MatlabDateToJSTime(serial);
    }

    getMatlabDateToCustomJSTime(serial, format) {
        return this.datetimeService.MatlabDateToCustomJSTime(serial, format);
    }

    GetDecimalValueForNumber(value, endpoint = null) {
        return this.calculationService.GetDecimalValueForNumber(value, endpoint);
    }

    ngOnInit() {
        Chart.pluginService.register(annotation);
    }

    buildPageWithCurrentInformation() {
        this.ResetTransfers();
        setTimeout(()=>{
            this.GetAvailableRouteDatesForVessel();
        }, 1000)
        
        this.commonService.getSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(sov => {
            if (sov.length !== 0 && sov[0].seCoverageSpanHours != "_NaN_") {
                this.sovModel.sovInfo = sov[0];
                setTimeout(()=>{
                    this.commonService.getPlatformTransfers(this.sovModel.sovInfo.mmsi, this.vesselObject.date).subscribe(platformTransfers => {
                        if (platformTransfers.length === 0) {
                            this.commonService.getTurbineTransfers(this.vesselObject.mmsi, this.vesselObject.date).subscribe(turbineTransfers => {
                                if (turbineTransfers.length === 0) {
                                    this.sovModel.sovType = SovType.Unknown;
                                } else {
                                    this.sovModel.turbineTransfers = turbineTransfers;
                                    this.sovModel.sovType = SovType.Turbine;
                                }
                            });
                        } else {
                            this.sovModel.platformTransfers = platformTransfers;
                            this.sovModel.sovType = SovType.Platform;
                        }
                        this.getVesselRoute();
                    });
                });

                this.commonService.getVessel2vesselsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(vessel2vessels => {
                    this.sovModel.vessel2vessels = vessel2vessels;
                });
                this.commonService.getCycleTimesForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(cycleTimes => {
                    this.sovModel.cycleTimes = cycleTimes;
                });
                this.locShowContent = true;
                // Set the timer so data is first collected on time
                // ToDo clear timeout when data has been loaded
                setTimeout(() => {
                    this.CalculateDailySummary();
                    this.createOperationalStatsChart();
                    this.createGangwayLimitationsChart();
                    this.createWeatherOverviewChart();
                    this.CheckForNullValues();
                    this.loaded.emit(true);
                }, 1500);
            } else {
                this.locShowContent = false;
                this.loaded.emit(true);
            }
            this.showContent.emit(this.locShowContent);
        });
    }

    GetTransits() {
        this.commonService.getTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
            this.sovModel.transits = transits;
        });
    }

    GetAvailableRouteDatesForVessel() {
        this.commonService.getDatesShipHasSailedForSov(this.vesselObject.mmsi).subscribe(dates => {
            for (let _i = 0; _i < dates.length; _i++) {
                dates[_i] = this.datetimeService.JSDateYMDToObjectDate(this.datetimeService.MatlabDateToJSDateYMD(dates[_i]));
            }
            const sailDates = dates;
            this.sailDates.emit(sailDates);
        });
    }

    getVesselRoute() {
        const boatlocationData = [];
        boatlocationData.push(this.sovModel.sovInfo);
        if (('' + this.sovModel.sovInfo.lat) !== '_NaN_' && ('' + this.sovModel.sovInfo.lon) !== '_NaN_') {
            const mapProperties = this.calculationService.GetPropertiesForMap(this.mapPixelWidth, this.sovModel.sovInfo.lat, this.sovModel.sovInfo.lon);
            this.boatLocationData.emit(boatlocationData);
            this.latitude.emit(mapProperties.avgLatitude);
            this.longitude.emit(mapProperties.avgLongitude);
            this.mapZoomLvl.emit(mapProperties.zoomLevel);
            this.routeFound.emit(true);
        }
        else {
            this.routeFound.emit(false);
        }
        // Loads in relevant turbine data for visited parks
        this.commonService.getSovDistinctFieldnames(this.vesselObject.mmsi, this.vesselObject.date).subscribe(data => {
            this.commonService.getSpecificPark({ 'park': data }).subscribe(locdata => {
                if (locdata.length !== 0) {
                    //this.turbineLocations = locdata;
                    let transfers = [];
                    let sovType = 'Unknown';
                    if(this.sovModel.sovType == SovType.Platform) {
                        transfers = this.sovModel.platformTransfers;
                        sovType = 'Platform';
                    }
                    else if(this.sovModel.sovType == SovType.Turbine) {
                        transfers = this.sovModel.turbineTransfers;
                        sovType = 'Turbine';
                    }
                    let locationData = { 'turbineLocations': locdata, 'transfers': transfers, 'type': sovType, 'vesselType': 'SOV' };
                    this.turbineLocations = locationData.turbineLocations;
                    this.turbineLocationData.emit(locationData);
                }
            });
        });
        // Loads in relevant data for visited platforms
        this.commonService.getPlatformLocations('').subscribe(locdata => {
            if (locdata.length !== 0) {
                //this.turbineLocations = locdata;
                const transfers = this.sovModel.platformTransfers;
                // /const sovType = 'Platform';
                let locationData = {'turbineLocations': locdata, 'transfers': transfers, 'type': 'Platforms', 'vesselType': 'SOV' };
                this.platformLocationData.emit(locationData);
            }
            else{
                console.log('Request to get platform locations returned 0 results!')
            }
        });
    }

    CalculateDailySummary() {
        let summaryModel = new SummaryModel();

        summaryModel.NrOfDaughterCraftLaunches = 0;
        summaryModel.NrOfHelicopterVisits = 0;

        if (this.sovModel.turbineTransfers.length > 0 && this.sovModel.sovType === SovType.Turbine) {
            const turbineTransfers = this.sovModel.turbineTransfers;

            const avgTimeDocking = turbineTransfers.reduce(function (sum, a, i, ar) { sum += a.duration; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);
            // Average time vessel docking
            let totalVesselDockingDuration = 0;
            let nmrVesselTransfers = 0;
            this.sovModel.vessel2vessels.forEach(vessel2vessel => {
                let totalDockingDurationOfVessel2vessel = 0;
                vessel2vessel.transfers.forEach(transfer => {
                    totalDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel + transfer.duration;
                    nmrVesselTransfers += 1;
                });
                const averageDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel / vessel2vessel.transfers.length;
                totalVesselDockingDuration = totalVesselDockingDuration + averageDockingDurationOfVessel2vessel;
            });
            summaryModel.NrOfVesselTransfers = nmrVesselTransfers;
            summaryModel.AvgTimeVesselDocking = this.calculationService.GetDecimalValueForNumber(totalVesselDockingDuration / this.sovModel.vessel2vessels.length);

            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
        } else if (this.sovModel.platformTransfers.length > 0 && this.sovModel.sovType === SovType.Platform) {
            const platformTransfers = this.sovModel.platformTransfers;

            const avgTimeInWaitingZone = platformTransfers.reduce(function (sum, a, i, ar) { sum += a.timeInWaitingZone; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
            summaryModel.AvgTimeInWaitingZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInWaitingZone);

            const avgTimeInExclusionZone = platformTransfers.reduce(function (sum, a, i, ar) { sum += a.visitDuration; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
            summaryModel.AvgTimeInExclusionZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInExclusionZone);

            const avgTimeDocking = platformTransfers.reduce(function (sum, a, i, ar) { sum += a.totalDuration; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);

            const avgTimeTravelingToPlatforms = platformTransfers.reduce(function (sum, a, i, ar) { sum += a.approachTime; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
            summaryModel.AvgTimeTravelingToPlatforms = this.datetimeService.MatlabDurationToMinutes(avgTimeTravelingToPlatforms);

            summaryModel = this.GetDailySummary(summaryModel, platformTransfers);
        }

        this.sovModel.summary = summaryModel;
    }

    // Common used by platform and turbine
    private GetDailySummary(model: SummaryModel, transfers: any[]) {
        model.maxSignificantWaveHeightdDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function (o) { return o.Hs; })));
        model.maxWindSpeedDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function (o) { return o.peakWindGust; })));
        return model;
    }

    GetMatlabDurationToMinutes(serial) {
        return this.datetimeService.MatlabDurationToMinutes(serial);
    }

    // Properly change undefined values to N/a
    // For number resets to decimal, ONLY specify the ones needed, don't reset time objects
    CheckForNullValues() {
        this.sovModel.sovInfo = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.sovInfo);
        this.sovModel.sovInfo.distancekm = this.calculationService.GetDecimalValueForNumber(this.sovModel.sovInfo.distancekm);
        this.sovModel.summary = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.summary);
        if (this.sovModel.sovType === SovType.Turbine) {
            this.sovModel.turbineTransfers.forEach(transfer => {
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.duration = this.calculationService.GetDecimalValueForNumber(transfer.duration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
                transfer.gangwayUtilisation = this.calculationService.GetDecimalValueForNumber(transfer.gangwayUtilisation);
                transfer.peakWindGust = this.calculationService.GetDecimalValueForNumber(transfer.peakWindGust);
                transfer.peakWindAvg = this.calculationService.GetDecimalValueForNumber(transfer.peakWindAvg);
            });
        } else if (this.sovModel.sovType === SovType.Platform) {
            this.sovModel.platformTransfers.forEach(transfer => {
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.totalDuration = this.calculationService.GetDecimalValueForNumber(transfer.totalDuration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
            });
        }
        if (this.sovModel.transits.length > 0) {
            this.sovModel.transits.forEach(transit => {
                transit = this.calculationService.ReplaceEmptyColumnValues(transit);
            });
        }
        if (this.sovModel.vessel2vessels.length > 0) {
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
        const timeBreakdown = this.sovModel.sovInfo.timeBreakdown;
        if (timeBreakdown !== undefined) {
            const sailingDuration = timeBreakdown.hoursSailing !== undefined ? timeBreakdown.hoursSailing.toFixed(1) : 0;
            const waitingDuration = timeBreakdown.hoursWaiting !== undefined ? timeBreakdown.hoursWaiting.toFixed(1) : 0;
            const CTVopsDuration = timeBreakdown.hoursOfCTVops !== undefined ? timeBreakdown.hoursOfCTVops.toFixed(1) : 0;
            const platformDuration = timeBreakdown.hoursAtPlatform !== undefined ? timeBreakdown.hoursAtPlatform.toFixed(1) : 0;
            const turbineDuration = timeBreakdown.hoursAtTurbine !== undefined ? timeBreakdown.hoursAtTurbine.toFixed(1) : 0;
            const exclusionZone = platformDuration + turbineDuration;
            if (sailingDuration > 0 || waitingDuration > 0) {
                this.operationalChartCalculated = true;
                setTimeout(() => {
                    this.operationsChart = new Chart('operationalStats', {
                        type: 'pie',
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
                            labels: ['Sailing', 'Waiting', 'Exclusion zone', 'CTV operations duration']
                        },
                        options: {
                            title: {
                                display: true,
                                position: 'top',
                                text: 'Operational activity',
                                fontSize: 25
                            },
                            responsive: true,
                            radius: 6,
                            pointHoverRadius: 6
                        }
                    });
                });
            }
        }
    }

    createGangwayLimitationsChart() {
        const strokedLimiterCounter = this.sovModel.turbineTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'stroke').length + this.sovModel.platformTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'stroke').length;
        const boomAngleLimiterCounter = this.sovModel.turbineTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'boom angle').length + this.sovModel.platformTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === 'boom angle').length;
        if (strokedLimiterCounter > 0 || boomAngleLimiterCounter > 0) {
            this.sovHasLimiters = true;
            setTimeout(() => {
                this.gangwayLimitationsChart = new Chart('gangwayLimitations', {
                    type: 'pie',
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
                        labels: ['Stroke limited', 'Boom angle limited']
                    },
                    options: {
                        title: {
                            display: true,
                            position: 'top',
                            text: 'Gangway Limitations',
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

    createWeatherOverviewChart() {
        let weather =  this.sovModel.sovInfo.weatherConditions;
        if (weather !== undefined) {
            let hasData = false;
            let timeStamps = Array();
            weather.time.forEach((timeObj, index) =>{
                timeStamps[index] = this.datetimeService.MatlabDateToUnixEpoch(timeObj);
                });
            let Hs = Array();
            let Tp = Array();
            let waveDirection = Array();
            let windGust = Array();
            let windAvg  = Array();
            let chartTitle;
            if (weather.wavesource == "_NaN_"){
                //chartTitle = 'Weather overview';
                chartTitle = '';
            }else{
                chartTitle = [
                    //'Weather overview', 
                    'Source: ' + weather.wavesource];
            }
            // Loading each of the weather sources if they exist and are not NaN
            if (weather.waveHs[0] && typeof(weather.waveHs[0]) == "number"){
                hasData = true;
                weather.waveHs.forEach((val, index) => {
                    Hs[index] = {
                        x:timeStamps[index],
                        y:val
                    };
                });
            }
            if (weather.waveTp[0] && typeof(weather.waveTp[0]) == "number"){
                hasData = true;
                weather.waveTp.forEach((val, index) => {
                    Tp[index] = {
                        x:timeStamps[index],
                        y:val
                    };
                });
            }
            if (weather.waveDirection[0] && typeof(weather.waveDirection[0]) == "number"){
                hasData = true;
                weather.waveDirection.forEach((val, index) => {
                    waveDirection[index] = {
                        x:timeStamps[index],
                        y:val
                    };
                });
            }
            if (weather.windGust[0] && typeof(weather.windGust[0]) == "number"){
                hasData = true;
                weather.windGust.forEach((val, index) => {
                    windGust[index] = {
                        x:timeStamps[index],
                        y:val
                    };
                });
            }
            if (weather.windAvg[0] && typeof(weather.windAvg[0]) == "number"){
                hasData = true;
                weather.windAvg.forEach((val, index) => {
                    windAvg[index] = {
                        x:timeStamps[index],
                        y:val
                    };
                });
            }
            if (timeStamps.length > 0 && hasData) {
                this.weatherOverviewChartCalculated = true;
                setTimeout(() => {
                    this.weatherOverviewChart = new Chart('weatherOverview', {
                        type: 'line',
                        data: {
                            datasets: [
                                {
                                    data: Hs,
                                    pointHoverRadius: 10,
                                    backgroundColor: 'blue',
                                    borderWidth: 3,
                                    fill: false,
                                    label: "Hs (m)",
                                    hidden: Hs.length == 0,
                                    yAxisID: 'Hs'
                                },
                                {
                                    data: Tp,
                                    pointHoverRadius: 10,
                                    backgroundColor: 'red',
                                    borderWidth: 3,
                                    fill: false,
                                    label: "Tp (s)",
                                    hidden: true,
                                    yAxisID: 'Tp'
                                },
                                {
                                    data: waveDirection,
                                    pointHoverRadius: 10,
                                    backgroundColor: 'green',
                                    borderWidth: 3,
                                    fill: false,
                                    label: "Wave direction (deg)",
                                    hidden: true,
                                    yAxisID: 'Direction'
                                },
                                {
                                    data: windGust,
                                    pointHoverRadius: 10,
                                    backgroundColor: 'magenta',
                                    borderWidth: 3,
                                    fill: false,
                                    label: "Wind gust (m/s)",
                                    hidden: true,
                                    yAxisID: 'Wind'
                                },
                                {
                                    data: windAvg,
                                    pointHoverRadius: 10,
                                    backgroundColor: 'yellow',
                                    borderWidth: 3,
                                    fill: false,
                                    label: "Wind average (m/s)",
                                    hidden: windAvg.length == 0,
                                    yAxisID: 'Wind'
                                }
                            ],
                        },
                        options: {
                            title: {
                                display: chartTitle !== '',
                                position: 'right',
                                text: chartTitle,
                                fontSize: 15,
                                padding: 5,
                                fontStyle: 'normal',
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 0
                            },
                            hover: {
                                animationDuration: 0
                            },
                            responsiveAnimationDuration: 0,
                            scales : {
                                xAxes: [{
                                  scaleLabel: {
                                    display: true,
                                    labelString: 'Local time'
                                  },
                                  type: 'time',
                                  time: {
                                    min: this.datetimeService.MatlabDateToUnixEpoch(weather.time[0]),
                                    max: this.datetimeService.MatlabDateToUnixEpoch(weather.time[-1]),
                                    unit: 'hour'
                                }
                                }],
                                yAxes: [{
                                    id: 'Wind',
                                    display: 'auto',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Wind speed (m/s)'
                                    },
                                    ticks:{
                                        type: 'linear',
                                        suggestedMin: true,
                                    },
                                },
                                {
                                    id: 'Hs',
                                    display: 'auto',
                                    suggestedMax: 2,
                                    beginAtZero: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Hs (m)'
                                    },
                                    ticks:{
                                        type: 'linear',
                                        suggestedMin: true,
                                    },
                                },
                                {
                                    id: 'Tp',
                                    display: 'auto',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Tp (s)'
                                    },
                                    ticks:{
                                        type: 'linear',
                                        suggestedMin: true,
                                    },
                                },
                                {
                                    id: 'Direction',
                                    display: 'auto', 
                                    max: 360,
                                    beginAtZero: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Direction (deg)'
                                    },
                                    ticks:{
                                        type: 'linear',
                                        suggestedMin: true,
                                    },
                                }]
                            }
                        }
                    });
                });
            }
        }
    }

    private ResetTransfers() {
        this.sovModel = new SovModel();
        if (this.operationsChart !== undefined) {
            this.operationsChart.destroy();
            this.operationalChartCalculated = false;
        }
        if (this.gangwayLimitationsChart !== undefined) {
            this.gangwayLimitationsChart.destroy();
            this.sovHasLimiters = false;
        }
    }
}
