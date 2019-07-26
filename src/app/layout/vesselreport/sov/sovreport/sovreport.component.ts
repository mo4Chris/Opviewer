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
import { GmapService } from '../../../../supportModules/gmap.service';
import { MapZoomLayer } from '../../../../models/mapZoomLayer';
import { Vessel2VesselActivity } from '../models/vessel2vesselActivity';

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
    @Output() sailDates: EventEmitter<any> = new EventEmitter<any>();
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() routeFound: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() vesselObject;
    @Input() mapPixelWidth;

    sovModel: SovModel = new SovModel();
    private sovLoaded = false;
    private routeLoaded = false;
    private turbinesLoaded = false;
    private platformsLoaded = false;
    private v2vLoaded = false;
    private cycleTimeLoaded = false;

    dateData = {general: undefined, transfer: undefined};

    // used for comparison in the HTML
    SovTypeEnum = SovType;

    locShowContent = false;
    gangwayActive = false;
    vessel2vesselActivityRoute: Vessel2VesselActivity;
    turbineLocations = new Array<any>();

    // Charts
    private v2v_data_layer: MapZoomLayer;
    operationsChart;
    gangwayLimitationsChart;
    weatherOverviewChart;
    operationalChartCalculated = false;
    weatherOverviewChartCalculated = false;
    sovHasLimiters = false;
    backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];

    constructor(
        private commonService: CommonService,
        private datetimeService: DatetimeService,
        private modalService: NgbModal,
        private calculationService: CalculationService,
        private gmapService: GmapService
        ) { }

    openVesselMap(content, vesselname: string, toMMSI: number) {
        const map = document.getElementById('routeMap');
        const v2vHandler = new Vessel2VesselActivity({
            sovModel: this.sovModel,
            htmlMap: map,
            vessel: vesselname,
            mmsi: toMMSI,
            turbineLocations: this.turbineLocations
        });
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
        this.vessel2vesselActivityRoute = v2vHandler;
    }

    build_v2v_map(googleMap) {
        if (this.v2v_data_layer === undefined) {
            this.v2v_data_layer = new MapZoomLayer(googleMap, 1);
        } else {
            this.v2v_data_layer.reset();
            this.v2v_data_layer.setMap(googleMap);
        }
        // Set up for turbines locations view on map
        this.vessel2vesselActivityRoute.addVesselRouteToMapZoomLayer(this.v2v_data_layer);
        this.vessel2vesselActivityRoute.addTurbinesToMapZoomLayer(this.v2v_data_layer);
        this.v2v_data_layer.draw();
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
        this.buildPageWhenRouteLoaded();
    }

    buildPageWhenRouteLoaded() {
        this.GetAvailableRouteDatesForVessel();
        this.commonService.getSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(sov => {
            if (sov.length !== 0 && sov[0].seCoverageSpanHours !== '_NaN_') {
                this.sovModel.sovInfo = sov[0];
                this.commonService.getPlatformTransfers(this.sovModel.sovInfo.mmsi, this.vesselObject.date).subscribe(platformTransfers => {
                    if (platformTransfers.length === 0) {
                        this.commonService.getTurbineTransfers(this.vesselObject.mmsi, this.vesselObject.date).subscribe(turbineTransfers => {
                            if (turbineTransfers.length === 0) {
                                this.sovModel.sovType = SovType.Unknown;
                            } else {
                                this.sovModel.turbineTransfers = turbineTransfers;
                                this.sovModel.sovType = SovType.Turbine;
                            }
                        }, null, () => {
                            this.turbinesLoaded = true;
                            this.checkIfAllLoaded();
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform;
                        this.turbinesLoaded = true;
                        this.checkIfAllLoaded();
                    }
                    this.getVesselRoute();
                }, null, () => {
                    this.platformsLoaded = true;
                    this.checkIfAllLoaded();
                });
                this.commonService.getVessel2vesselsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(vessel2vessels => {
                    this.sovModel.vessel2vessels = vessel2vessels;
                }, null, () => {
                    this.v2vLoaded = true;
                    this.checkIfAllLoaded();
                });
                this.commonService.getCycleTimesForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(cycleTimes => {
                    this.sovModel.cycleTimes = cycleTimes;
                }, null, () => {
                    this.cycleTimeLoaded = true;
                    this.checkIfAllLoaded();
                });
                this.locShowContent = true;
            } else {
                // Skip check if all data is loaded if there is none
                this.buildPageWhenAllLoaded();
                this.locShowContent = false;
            }
            this.showContent.emit(this.locShowContent);
        }, null, () => {
            this.sovLoaded = true;
            this.checkIfAllLoaded();
        });
    }

    checkIfAllLoaded() {
        if (this.sovLoaded && this.routeLoaded && this.turbinesLoaded && this.platformsLoaded && this.v2vLoaded && this.cycleTimeLoaded) {
            this.buildPageWhenAllLoaded();
        }
    }

    buildPageWhenAllLoaded() {
        this.CalculateDailySummary();
        this.createOperationalStatsChart();
        this.createGangwayLimitationsChart();
        this.createWeatherOverviewChart();
        this.CheckForNullValues();
        this.loaded.emit(true);
    }

    GetTransits() {
        this.commonService.getTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
            this.sovModel.transits = transits;
        });
    }

    GetAvailableRouteDatesForVessel() {
        this.commonService.getDatesShipHasSailedForSov(this.vesselObject.mmsi).subscribe(genData => {
            this.dateData.general = genData;
        }, null,
            () => {
                this.pushSailingDates();
            }
        );
        this.commonService.getDatesWithTransfersForSOV(this.vesselObject.mmsi).subscribe(transferDates => {
            this.dateData.transfer = transferDates;
        }, null,
            () => {
                this.pushSailingDates();
            }
        );
    }

    pushSailingDates() {
        if (this.dateData.transfer && this.dateData.general) {
            const transferDates = [];
            const transitDates  = [];
            const otherDates    = [];
            let formattedDate;
            let hasTransfers: boolean;
            this.dateData.general.forEach(generalDataInstance => {
                formattedDate = this.datetimeService.JSDateYMDToObjectDate(this.datetimeService.MatlabDateToJSDateYMD(generalDataInstance.dayNum));
                hasTransfers = this.dateData.transfer.reduce((acc, val) => acc || val === generalDataInstance.dayNum, false);
                if (generalDataInstance.distancekm && hasTransfers) {
                    transferDates.push(formattedDate);
                } else if (generalDataInstance.distancekm) {
                    transitDates.push(formattedDate);
                } else {
                    otherDates.push(formattedDate);
                }
            });
            const sailInfo = {transfer: transferDates, transit: transitDates, other: otherDates};
            this.sailDates.emit(sailInfo);
        }
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
        } else {
            this.routeFound.emit(false);
        }
        // Loads in relevant turbine data for visited parks
        this.commonService.getSovDistinctFieldnames(this.vesselObject.mmsi, this.vesselObject.date).subscribe(data => {
            this.commonService.getSpecificPark({ 'park': data }).subscribe(locdata => {
                if (locdata.length !== 0) {
                    // this.turbineLocations = locdata;
                    let transfers = [];
                    let sovType = 'Unknown';
                    if (this.sovModel.sovType === SovType.Platform) {
                        transfers = this.sovModel.platformTransfers;
                        sovType = 'Platform';
                    } else if (this.sovModel.sovType === SovType.Turbine) {
                        transfers = this.sovModel.turbineTransfers;
                        sovType = 'Turbine';
                    }
                    const locationData = { 'turbineLocations': locdata, 'transfers': transfers, 'type': sovType, 'vesselType': 'SOV' };
                    this.turbineLocations = locationData.turbineLocations;
                    this.turbineLocationData.emit(locationData);
                }
            }, null, () => {
                this.routeLoaded = true;
                this.checkIfAllLoaded();
            });
        });
        // Loads in relevant data for visited platforms
        this.commonService.getPlatformLocations('').subscribe(locdata => {
            if (locdata.length !== 0) {
                // this.turbineLocations = locdata;
                const transfers = this.sovModel.platformTransfers;
                // /const sovType = 'Platform';
                const locationData = {'turbineLocations': locdata, 'transfers': transfers, 'type': 'Platforms', 'vesselType': 'SOV' };
                this.platformLocationData.emit(locationData);
            } else {
                console.log('Request to get platform locations returned 0 results!');
            }
        });
    }

    CalculateDailySummary() {
        let summaryModel = new SummaryModel();

        summaryModel.NrOfDaughterCraftLaunches = 0;
        summaryModel.NrOfHelicopterVisits = 0;

        if (this.sovModel.platformTransfers.length > 0 && this.sovModel.sovType === SovType.Platform) {
            const platformTransfers = this.sovModel.platformTransfers;

            const avgTimeInWaitingZone = this.calculationService.getNanMean(platformTransfers.map(x => x.timeInWaitingZone));
            summaryModel.AvgTimeInWaitingZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInWaitingZone);

            const avgTimeInExclusionZone = this.calculationService.getNanMean(platformTransfers.map(x => x.visitDuration));
            summaryModel.AvgTimeInExclusionZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInExclusionZone);

            const avgTimeDocking = this.calculationService.getNanMean(platformTransfers.map(x => x.totalDuration));
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);

            const avgTimeTravelingToPlatforms = this.calculationService.getNanMean(platformTransfers.map(x => x.approachTime));
            summaryModel.AvgTimeTravelingToPlatforms = this.datetimeService.MatlabDurationToMinutes(avgTimeTravelingToPlatforms);

            summaryModel = this.GetDailySummary(summaryModel, platformTransfers);
        } else if (this.sovModel.turbineTransfers.length > 0 && this.sovModel.sovType === SovType.Turbine) {
            const turbineTransfers = this.sovModel.turbineTransfers;

            const avgTimeDocking = this.calculationService.getNanMean(turbineTransfers.map(x => x.duration));
            summaryModel.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);
            // Average time vessel docking
            let totalVesselDockingDuration = 0;
            let nmrVesselTransfers = 0;
            this.sovModel.vessel2vessels.forEach(vessel2vessel => {
                let totalDockingDurationOfVessel2vessel = 0;
                vessel2vessel.transfers.forEach(transfer => {
                    if (transfer) {
                        totalDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel + transfer.duration;
                        nmrVesselTransfers += 1;
                    }
                });
                const averageDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel / nmrVesselTransfers;
                totalVesselDockingDuration = totalVesselDockingDuration + averageDockingDurationOfVessel2vessel;
            });
            summaryModel.NrOfVesselTransfers = nmrVesselTransfers;
            summaryModel.AvgTimeVesselDocking = this.calculationService.GetDecimalValueForNumber(totalVesselDockingDuration / this.sovModel.vessel2vessels.length);

            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
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
        let naCountGangway = 0;
        this.sovModel.sovInfo = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.sovInfo);
        this.sovModel.sovInfo.distancekm = this.calculationService.GetDecimalValueForNumber(this.sovModel.sovInfo.distancekm);
        this.sovModel.summary = this.calculationService.ReplaceEmptyColumnValues(this.sovModel.summary);
        if (this.sovModel.sovType === SovType.Turbine) {
            this.sovModel.turbineTransfers.forEach(transfer => {
                transfer.gangwayUtilisation === undefined || transfer.gangwayUtilisation === '_NaN_' ? naCountGangway ++ : naCountGangway = naCountGangway;
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
                transfer.gangwayUtilisation === undefined || transfer.gangwayUtilisation === '_NaN_' ? naCountGangway ++ : naCountGangway = naCountGangway;
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.totalDuration = this.calculationService.GetDecimalValueForNumber(transfer.totalDuration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
            });
        }
        if (naCountGangway == this.sovModel.turbineTransfers.length || naCountGangway == this.sovModel.platformTransfers.length) {
            this.gangwayActive = false;
        } else {
            this.gangwayActive = true;
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
        const weather =  this.sovModel.sovInfo.weatherConditions;
        if (weather !== undefined) {
            let hasData = false;
            const timeStamps = Array();
            weather.time.forEach((timeObj, index) => {
                timeStamps[index] = this.datetimeService.MatlabDateToUnixEpoch(timeObj);
                });
            const Hs = Array();
            const Tp = Array();
            const waveDirection = Array();
            const windGust = Array();
            const windAvg  = Array();
            let chartTitle;
            if (weather.wavesource === '_NaN_') {
                // chartTitle = 'Weather overview';
                chartTitle = '';
            } else {
                chartTitle = [
                    // 'Weather overview',
                    'Source: ' + weather.wavesource];
            }
            // Loading each of the weather sources if they exist and are not NaN
            if (weather.waveHs[0] && typeof(weather.waveHs[0]) === 'number') {
                hasData = true;
                weather.waveHs.forEach((val, index) => {
                    Hs[index] = {
                        x: timeStamps[index],
                        y: val
                    };
                });
            }
            if (weather.waveTp[0] && typeof(weather.waveTp[0]) === 'number') {
                hasData = true;
                weather.waveTp.forEach((val, index) => {
                    Tp[index] = {
                        x: timeStamps[index],
                        y: val
                    };
                });
            }
            if (weather.waveDirection[0] && typeof(weather.waveDirection[0]) === 'number') {
                hasData = true;
                weather.waveDirection.forEach((val, index) => {
                    waveDirection[index] = {
                        x: timeStamps[index],
                        y: val
                    };
                });
            }
            if (weather.windGust[0] && typeof(weather.windGust[0]) === 'number') {
                hasData = true;
                weather.windGust.forEach((val, index) => {
                    windGust[index] = {
                        x: timeStamps[index],
                        y: val / 3.6
                    };
                });
            }
            if (weather.windAvg[0] && typeof(weather.windAvg[0]) === 'number') {
                hasData = true;
                weather.windAvg.forEach((val, index) => {
                    windAvg[index] = {
                        x: timeStamps[index],
                        y: val / 3.6
                    };
                });
            }
            // Now create collection with all the dockings and v2v operations
            const dockingData = new Array;
            let start;
            let stop;
            this.sovModel.platformTransfers.forEach((transfer) => {
                start = this.datetimeService.MatlabDateToUnixEpoch(transfer.arrivalTimePlatform);
                stop = this.datetimeService.MatlabDateToUnixEpoch(transfer.departureTimePlatform);
                dockingData.push({x: start , y: 1});
                dockingData.push({x: stop , y: 1});
                dockingData.push({x: stop + 0.0001 , y: NaN});
            });
            this.sovModel.turbineTransfers.forEach((transfer) => {
                start = this.datetimeService.MatlabDateToUnixEpoch(transfer.startTime);
                stop = this.datetimeService.MatlabDateToUnixEpoch(transfer.stopTime);
                dockingData.push({x: start , y: 1});
                dockingData.push({x: stop , y: 1});
                dockingData.push({x: stop + 0.0001 , y: NaN});
            });
            this.sovModel.vessel2vessels.forEach((vessel) => {
                vessel.transfers.forEach(transfer => {
                    start = this.datetimeService.MatlabDateToUnixEpoch(transfer.startTime);
                    stop = this.datetimeService.MatlabDateToUnixEpoch(transfer.stopTime);
                    dockingData.push({x: start , y: 1});
                    dockingData.push({x: stop , y: 1});
                    dockingData.push({x: stop + 0.0001 , y: NaN});
                });
            });
            Chart.Tooltip.positioners.custom = function(elements, position) {
                const item = this._data.datasets;
                elements = elements.filter(function (value, _i) {
                    return item[value._datasetIndex].yAxisID !== 'hidden';
                });
                let x_mean = 0;
                elements.forEach(elt => {
                    x_mean += elt._model.x;
                });
                x_mean = x_mean / elements.length;
                let y_mean = 0;
                elements.forEach(elt => {
                    y_mean += elt._model.y;
                });
                y_mean = y_mean / elements.length;
                return{
                    x: x_mean,
                    y: y_mean
                };
              };

            if (timeStamps.length > 0 && hasData) {
                if (this.weatherOverviewChartCalculated) {
                    this.destroyOldCharts();
                }
                this.weatherOverviewChartCalculated = true;
                setTimeout(() => {
                    this.weatherOverviewChart = new Chart('weatherOverview', {
                        type: 'line',
                        data: {
                            datasets: [
                                {
                                    label: 'Hs (m)',
                                    data: Hs,
                                    pointHoverRadius: 5,
                                    pointHitRadius: 30,
                                    pointRadius: 0,
                                    backgroundColor: 'blue',
                                    borderColor: 'blue',
                                    borderWidth: 2,
                                    fill: false,
                                    hidden: Hs.length === 0,
                                    yAxisID: 'Hs'
                                },
                                {
                                    label: 'Tp (s)',
                                    data: Tp,
                                    pointHoverRadius: 5,
                                    pointHitRadius: 30,
                                    pointRadius: 0,
                                    backgroundColor: 'red',
                                    borderColor: 'red',
                                    borderWidth: 2,
                                    fill: false,
                                    hidden: true,
                                    yAxisID: 'Tp'
                                },
                                {
                                    label: 'Wave direction (deg)',
                                    data: waveDirection,
                                    pointHoverRadius: 5,
                                    pointHitRadius: 30,
                                    pointRadius: 0,
                                    backgroundColor: 'green',
                                    borderColor: 'green',
                                    borderWidth: 2,
                                    fill: false,
                                    hidden: true,
                                    yAxisID: 'Direction'
                                },
                                {
                                    label: 'Wind gust (m/s)',
                                    data: windGust,
                                    pointRadius: 0,
                                    pointHoverRadius: 5,
                                    pointHitRadius: 30,
                                    backgroundColor: 'magenta',
                                    borderColor: 'magenta',
                                    borderWidth: 2,
                                    fill: false,
                                    hidden: true,
                                    yAxisID: 'Wind'
                                },
                                {
                                    label: 'Wind average (m/s)',
                                    data: windAvg,
                                    pointHoverRadius: 5,
                                    pointHitRadius: 30,
                                    pointRadius: 0,
                                    backgroundColor: 'orange',
                                    borderColor: 'orange',
                                    borderWidth: 2.5,
                                    fill: false,
                                    hidden: windAvg.length === 0,
                                    yAxisID: 'Wind'
                                },
                                {
                                    label: 'Vessel tranfers',
                                    data: dockingData,
                                    pointHoverRadius: 0,
                                    pointHitRadius: 0,
                                    pointRadius: 0,
                                    borderWidth: 0,
                                    yAxisID: 'hidden',
                                    lineTension: 0,
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
                                    ticks: {
                                        type: 'linear',
                                        maxTicksLimit: 7,
                                        suggestedMin: 0,
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
                                    ticks: {
                                        type: 'linear',
                                        maxTicksLimit: 7,
                                        suggestedMin: 0,
                                    }
                                },
                                {
                                    id: 'Tp',
                                    display: 'auto',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Tp (s)'
                                    },
                                    ticks: {
                                        type: 'linear',
                                        maxTicksLimit: 7,
                                    },
                                },
                                {
                                    id: 'Direction',
                                    display: 'auto',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Direction (deg)'
                                    },
                                    ticks: {
                                        type: 'linear',
                                        maxTicksLimit: 7,
                                        suggestedMin: 0,
                                        suggestedMax: 360
                                    },
                                }, {
                                    id: 'hidden',
                                    display: false,
                                    ticks: {
                                        type: 'linear',
                                        maxTicksLimit: 7,
                                        min: 0,
                                        suggestedMax: 1
                                    },
                                }]
                            },
                            tooltips: {
                                position: 'custom',
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        const dset = data.datasets[tooltipItem.datasetIndex];
                                        let label = dset.label || '';
                                        if (label) {
                                            label += ': ';
                                            label += Math.round(dset.data[tooltipItem.index].y * 10) / 10;
                                        }
                                        return label;
                                    },
                                },
                                mode: 'index',
                                filter: function (tooltip, data) {
                                    return data.datasets[tooltip.datasetIndex].yAxisID !== 'hidden';
                                },
                            }
                        }
                    });
                });
            }
        }
    }
    datasetIsActive(dset, dsetIndex, chart) {
        const meta = chart.getDatasetMeta(dsetIndex);
        let hidden;
        if (meta.hidden === null) {
            hidden = dset.hidden === true;
        } else {
            hidden = meta.hidden;
        }
        const final = !hidden;
        return (final);
    }
    destroyOldCharts(): void {
        this.weatherOverviewChart.destroy();
    }

    private ResetTransfers() {
        this.routeLoaded = false;
        this.platformsLoaded = false;
        this.turbinesLoaded = false;
        this.v2vLoaded = false;
        this.cycleTimeLoaded = false;
        this.sovLoaded = false;
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
