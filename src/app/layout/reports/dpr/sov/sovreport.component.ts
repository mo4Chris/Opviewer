import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as annotation from 'chartjs-plugin-annotation';
import { CommonService } from '@app/common.service';
import { SovModel } from './models/SovModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SovType } from './models/SovType';
import { SummaryModel } from './models/Summary';
import { CalculationService } from '@app/supportModules/calculation.service';
import { GmapService } from '@app/supportModules/gmap.service';
import { MapZoomLayer } from '@app/models/mapZoomLayer';
import { Vessel2VesselActivity } from './models/vessel2vesselActivity';
import { map, catchError } from 'rxjs/operators';
import { isArray } from 'util';
import { WeatherOverviewChart } from '../models/weatherChart';
import { SettingsService } from '@app/supportModules/settings.service';
import { SovData } from './models/SovData';
import { AlertService } from '@app/supportModules/alert.service';
import { TokenModel } from '@app/models/tokenModel';


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

    @Input() tokenInfo: TokenModel;
    @Input() vesselObject;
    @Input() mapPixelWidth: number;

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
    turbineLocations = new Array<any>();
    fieldName = '';

    // Charts
    backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];

    summaryInfo = {
        departureFromHarbour: 'N/a',
        arrivalAtHarbour: 'N/a',
        distance: 'N/a',
    };


    constructor(
        private commonService: CommonService,
        private datetimeService: DatetimeService,
        private calculationService: CalculationService,
        private settings: SettingsService,
        private alert: AlertService,
    ) {
        this.alert.timeout = 7000;
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

    printPage() {
        const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');

        for (let _i = 0; _i < containers.length; _i++) {
            const container = <HTMLDivElement> containers[_i];
            container.style.width = '225mm';
        }
        setTimeout(function() {  window.print(); }, 50);
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
        this.commonService.getSov(this.vesselObject).subscribe(sov => {
            if (sov.length !== 0 && sov[0].seCoverageSpanHours !== '_NaN_') {
                this.sovModel.sovInfo = sov[0];
                if (sov[0].utcOffset) {
                    this.datetimeService.vesselOffset = sov[0].utcOffset;
                }
                // this.createOperationalStatsChart();
                // All code beyond this point should be changed to a forkJoin statement, which executes after all subscriptions have returned (which can be done in parallel)
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
                            this.getVesselRoute();
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform;
                        this.turbinesLoaded = true;
                        this.getVesselRoute();
                    }
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
                    this.sovModel.cycleTimes.forEach(cycle => {
                        cycle['avgSpeed'] = this.switchUnit(cycle.avgSpeedKts, 'knots', this.settings.unit_speed);
                        cycle['maxSpeed'] = this.switchUnit(cycle.maxSpeedKts, 'knots', this.settings.unit_speed);
                        cycle['sailedDistance'] = this.switchUnit(cycle.sailedDistanceNM, 'NM', this.settings.unit_distance);
                        cycle['turbineDistance'] = this.switchUnit(cycle.turbineDistanceNM, 'NM', this.settings.unit_distance);
                    });
                }, null, () => {
                    this.cycleTimeLoaded = true;
                    this.checkIfAllLoaded();
                });
                this.locShowContent = true;
            } else {
                // Skip check if all data is loaded if there is none
                this.buildPageWhenAllLoaded();
                if (sov.length > 0) {
                    this.sovModel.sovInfo = sov[0];
                }
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
        try {
            this.CalculateDailySummary();
        } catch (e) {
            console.error(e);
        }
        try {
            this.CheckForNullValues();
        } catch (e) {
            console.error(e);
        }
        this.loaded.emit(true);
    }

    GetTransits() {
        this.commonService.getTransitsForSov(this.vesselObject.mmsi, this.vesselObject.date).subscribe(transits => {
            this.sovModel.transits = transits;
        });
    }

    GetAvailableRouteDatesForVessel() {
        this.commonService.getDatesShipHasSailedForSov(this.vesselObject).subscribe(genData => {
            this.dateData.general = genData;
        }, null,
            () => {
                this.pushSailingDates();
            }
        );
        this.commonService.getDatesWithTransfersForSOV(this.vesselObject).subscribe(transferDates => {
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
        this.commonService.getSovDistinctFieldnames(this.vesselObject).subscribe(data => {
            if (this.sovModel.vessel2vessels.length > 0) {
                this.sovModel.vessel2vessels[0].CTVactivity.forEach(activity => {
                    if (isArray(activity.turbineVisits)) {
                        activity.turbineVisits.forEach(visit => {
                            if (!data.some(elt => elt === visit.fieldname)) {
                                data.push(visit.fieldname);
                            }
                        });
                    }
                });
            }

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
                    // tslint:disable-next-line:whitespace
                    if (this.turbineLocations[0].SiteName) {
                        this.fieldName = this.turbineLocations[0].SiteName;
                    }
                }
            }, null, () => {
                this.routeLoaded = true;
                this.checkIfAllLoaded();
            });
        });
        // Loads in relevant data for visited platforms
        this.commonService.getPlatformLocations('').subscribe(locdata => {
            if (locdata.length !== 0) {
                const transfers = this.sovModel.platformTransfers;
                const locationData = {
                    turbineLocations: locdata,
                    transfers: transfers,
                    type: 'Platforms',
                    vesselType: 'SOV'
                };
                this.platformLocationData.emit(locationData);
            } else {
                console.error('Request to get platform locations returned 0 results!');
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
                        if (typeof (transfer.duration) !== 'string') {
                            totalDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel + transfer.duration;
                            nmrVesselTransfers += 1;
                        }
                    }
                });
                const averageDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel / nmrVesselTransfers;
                totalVesselDockingDuration = totalVesselDockingDuration + averageDockingDurationOfVessel2vessel;
            });
            summaryModel.NrOfVesselTransfers = nmrVesselTransfers;
            summaryModel.AvgTimeVesselDocking = this.datetimeService.MatlabDurationToMinutes(totalVesselDockingDuration / this.sovModel.vessel2vessels.length);

            summaryModel = this.GetDailySummary(summaryModel, turbineTransfers);
        } else {
            summaryModel = this.GetDailySummary(summaryModel, []);
        }

        this.sovModel.summary = summaryModel;
    }

    // ToDo: Common used by platform and turbine
    private GetDailySummary(model: SummaryModel, transfers: any[]) {
        const maxHs = this.calculationService.getNanMax(transfers.map(_t => _t.Hs));
        model.maxSignificantWaveHeightdDuringOperations = this.calculationService.GetDecimalValueForNumber(maxHs, ' m');
        const maxWindspeed = this.calculationService.getNanMax(transfers.map(_t => _t.peakWindGust));
        model.maxWindSpeedDuringOperations = this.switchUnit(maxWindspeed, 'km/h', this.settings.unit_speed);

        const info = this.sovModel.sovInfo;
        model.TotalSailDistance = this.switchUnit(info.distancekm, 'km', this.settings.unit_distance);
        model.departureFromHarbour = this.GetMatlabDateToJSTime(info.departureFromHarbour);
        model.arrivalAtHarbour = this.GetMatlabDateToJSTime(info.arrivalAtHarbour);
        return model;
    }

    private switchUnit(value: number | string, oldUnit: string, newUnit: string) {
        return this.calculationService.switchUnitAndMakeString(value, oldUnit, newUnit);
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
                transfer.duration = <any> this.calculationService.GetDecimalValueForNumber(transfer.duration);
                transfer.gangwayDeployedDuration = <any> this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = <any> this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
                transfer.gangwayUtilisation = <any> this.calculationService.GetDecimalValueForNumber(transfer.gangwayUtilisation);
                transfer.peakWindGust = <any> this.switchUnit(transfer.peakWindGust, 'km/h', this.settings.unit_speed);
                transfer.peakWindAvg = <any> this.switchUnit(transfer.peakWindAvg, 'km/h', this.settings.unit_speed);
            });
            this.gangwayActive = naCountGangway !== this.sovModel.turbineTransfers.length;
        } else if (this.sovModel.sovType === SovType.Platform) {
            this.sovModel.platformTransfers.forEach(transfer => {
                transfer.gangwayUtilisation === undefined || transfer.gangwayUtilisation === '_NaN_' ? naCountGangway ++ : naCountGangway = naCountGangway;
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.totalDuration = <any> this.calculationService.GetDecimalValueForNumber(transfer.totalDuration);
                transfer.gangwayDeployedDuration = <any> this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = <any> this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
                transfer.peakWindGust = <any> this.switchUnit(transfer.peakWindGust, 'km/h', this.settings.unit_speed);
                transfer.peakWindAvg = <any> this.switchUnit(transfer.peakWindAvg, 'km/h', this.settings.unit_speed);
                transfer.Hs = this.GetDecimalValueForNumber(transfer.Hs, ' m');
                transfer.gangwayUtilisationLimiter = this.formatGangwayLimiter(transfer.gangwayUtilisationLimiter);
            });
            this.gangwayActive = naCountGangway !== this.sovModel.platformTransfers.length;
        } else {
            this.gangwayActive = false;
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
                    transfer.duration = <any> this.calculationService.GetDecimalValueForNumber(transfer.duration);
                    transfer.peakWindGust = this.switchUnit(transfer.peakWindGust, 'km/h', this.settings.unit_speed);
                    transfer.peakWindAvg = this.switchUnit(transfer.peakWindAvg, 'km/h', this.settings.unit_speed);
                });
            });
        }
    }



    formatGangwayLimiter(raw_limiter: string) {
        switch (raw_limiter) {
            case 'tele_pos':
                return 'Telescopic position';
            case 'boom_ang':
                return 'Booming angle';
            default:
                return raw_limiter;
        }
    }

    private ResetTransfers() {
        this.routeLoaded = false;
        this.platformsLoaded = false;
        this.turbinesLoaded = false;
        this.v2vLoaded = false;
        this.cycleTimeLoaded = false;
        this.sovLoaded = false;
        this.sovModel = new SovModel();
        this.fieldName = '';
        // if (this.operationsChart !== undefined) {
        //     this.operationsChart.destroy();
        //     this.operationalChartCalculated = false;
        // }
        // if (this.gangwayLimitationsChart !== undefined) {
        //     this.gangwayLimitationsChart.destroy();
        //     this.sovHasLimiters = false;
        // }
    }
}
