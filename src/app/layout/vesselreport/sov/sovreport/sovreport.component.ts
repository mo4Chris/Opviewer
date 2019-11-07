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
import { map, catchError } from 'rxjs/operators';
import { isArray } from 'util';
import { WeatherOverviewChart } from '../../models/weatherChart';


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
    weatherOverviewChart: WeatherOverviewChart;
    operationalChartCalculated = false;
    weatherOverviewChartCalculated = false;
    sovHasLimiters = false;
    backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];
    HOCArray = [];
    HOCTotal = 0;
    HOCTotalOld = 0;
    HOCTotalNew = 0;
    ToolboxArray = [];
    ToolboxTotal = 0;
    ToolboxTotalOld = 0;
    ToolboxTotalNew = 0;
    VesselNonAvailabilityArray = [];
    dpArray = [];
    WeatherDowntimeArray = [];
    fuelChanged = false;
    incidentsChanged = false;
    nonAvailabilityChanged = false;
    weatherDowntimeChanged = false;
    cateringChanged = false;
    remarksChanged = false;
    poBChanged = false;
    dpChanged = false;
    alert = {type : '', message: ''};
    times = [];
    allHours = [];
    all5Minutes = [];
    totalCargoIn = 0;
    totalCargoOut = 0;
    totalPaxIn = 0;
    totalPaxOut = 0;

    v2vCargoIn = 0;
    v2vCargoOut = 0;
    v2vPaxIn = 0;
    v2vPaxOut = 0;

    showAlert = false;
    timeout;
    remarks = '';

    cateringObject = {};
    peopleonBoard = {
        marine: 0,
        marineContractors: 0,
        project: 0
    };
    PoBTotal = 0;

    liquidsObject = {
        fuel: {oldValue: 0 , loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
        luboil: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
        domwater: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
        potwater: {oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
    };

    missedPaxCargo = [];

    helicopterPaxCargo = [];

    constructor(
        private commonService: CommonService,
        private datetimeService: DatetimeService,
        private modalService: NgbModal,
        private calculationService: CalculationService,
        private gmapService: GmapService
    ) { }


    updateHOCTotal() {
        this.HOCTotal = 0;
        this.HOCTotalNew = this.HOCTotalOld;
        if (this.HOCArray.length !== 0) {
            this.HOCArray.forEach(element => {
                this.HOCTotal = this.HOCTotal + +element.amount;
                this.HOCTotalNew = this.HOCTotalNew + +element.amount;
            });
        }
    }

    updateToolboxTotal() {
        this.ToolboxTotal = 0;
        this.ToolboxTotalNew = this.ToolboxTotalOld;
        if (this.ToolboxArray.length !== 0) {
            this.ToolboxArray.forEach(element => {
                this.ToolboxTotal = this.ToolboxTotal + +element.amount;
                this.ToolboxTotalNew = this.ToolboxTotalNew + +element.amount;
            });
        }
    }

    updatev2vPaxCargoTotal() {
        this.v2vCargoIn = 0;
        this.v2vCargoOut = 0;
        this.v2vPaxIn = 0;
        this.v2vPaxOut = 0;
        if (this.sovModel.vessel2vessels.length > 0) {
            for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
                this.v2vPaxIn = this.v2vPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.v2vPaxIn + 0;
                this.v2vPaxOut = this.v2vPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.v2vPaxOut + 0;
                this.v2vCargoIn = this.v2vCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.v2vCargoIn + 0;
                this.v2vCargoOut = this.v2vCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.v2vCargoOut + 0;
            }
        }
    }

    createTimes() {
        const quarterHours = ['00', '15', '30', '45'];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 4; j++) {
                let time = i + ':' + quarterHours[j];
                if (i < 10) {
                time = '0' + time;
                }
                this.times.push(time);
            }
        }
    }

    createSeperateTimes() {
        this.allHours = [];
        this.all5Minutes = [];

        for (let i = 0; i < 24; i++) {
            let time = i + '';
            if (i < 10) {
            time = '0' + time;
            }
            this.allHours.push(time);
        }
        for (let i = 0; i < 60; i += 5) {
            let time = i + '';
            if (i < 10) {
            time = '0' + time;
            }
            this.all5Minutes.push(time);
        }
    }

    updateFuel() {
        this.liquidsObject.fuel.newValue = +(+this.liquidsObject.fuel.oldValue + +this.liquidsObject.fuel.loaded - +this.liquidsObject.fuel.consumed - +this.liquidsObject.fuel.discharged).toFixed(1);
    }

    updateLuboil() {
        this.liquidsObject.luboil.newValue = +(+this.liquidsObject.luboil.oldValue + +this.liquidsObject.luboil.loaded - +this.liquidsObject.luboil.consumed - +this.liquidsObject.luboil.discharged).toFixed(1);
    }

    updateDomwater() {
        this.liquidsObject.domwater.newValue = +(+this.liquidsObject.domwater.oldValue + +this.liquidsObject.domwater.loaded - +this.liquidsObject.domwater.consumed - +this.liquidsObject.domwater.discharged).toFixed(1);
    }

    updatePotwater() {
        this.liquidsObject.potwater.newValue = +(+this.liquidsObject.potwater.oldValue + +this.liquidsObject.potwater.loaded - +this.liquidsObject.potwater.consumed - this.liquidsObject.potwater.discharged).toFixed(1);
    }

    updatePoB() {
        this.PoBTotal = 0;
        this.PoBTotal = (+this.PoBTotal + +this.peopleonBoard.marineContractors + +this.peopleonBoard.marine + +this.peopleonBoard.project);
    }

    updatePaxCargoTotal() {
        this.totalPaxIn = 0;
        this.totalPaxOut = 0;
        this.totalCargoIn = 0;
        this.totalCargoOut = 0;

        if (this.sovModel.sovType === this.SovTypeEnum.Turbine && this.sovModel.turbineTransfers.length > 0) {
            for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
                this.totalPaxIn = this.totalPaxIn + +this.sovModel.turbineTransfers[i].paxIn || this.totalPaxIn + 0;
                this.totalPaxOut = this.totalPaxOut + +this.sovModel.turbineTransfers[i].paxOut || this.totalPaxOut + 0;
                this.totalCargoIn = this.totalCargoIn + +this.sovModel.turbineTransfers[i].cargoIn || this.totalCargoIn + 0;
                this.totalCargoOut = this.totalCargoOut + +this.sovModel.turbineTransfers[i].cargoOut || this.totalCargoOut + 0;
            }
        } else if (this.sovModel.sovType === this.SovTypeEnum.Platform && this.sovModel.platformTransfers.length > 0) {
            for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
                this.totalPaxIn = this.totalPaxIn + +this.sovModel.platformTransfers[i].paxIn || this.totalPaxIn + 0;
                this.totalPaxOut = this.totalPaxOut + +this.sovModel.platformTransfers[i].paxOut || this.totalPaxOut + 0;
                this.totalCargoIn = this.totalCargoIn + +this.sovModel.platformTransfers[i].cargoIn || this.totalCargoIn + 0;
                this.totalCargoOut = this.totalCargoOut + +this.sovModel.platformTransfers[i].cargoOut || this.totalCargoOut + 0;
            }
        }

        if (this.missedPaxCargo.length > 0) {
            for (let i = 0; i < this.missedPaxCargo.length; i++) {
                this.totalPaxIn = this.totalPaxIn + +this.missedPaxCargo[i].paxIn;
                this.totalPaxOut = this.totalPaxOut + +this.missedPaxCargo[i].paxOut;
                this.totalCargoIn = this.totalCargoIn + +this.missedPaxCargo[i].cargoIn;
                this.totalCargoOut = this.totalCargoOut + +this.missedPaxCargo[i].cargoOut;
            }
        }
        if (this.helicopterPaxCargo.length > 0) {
            for (let i = 0; i < this.helicopterPaxCargo.length; i++) {
                this.totalPaxIn = this.totalPaxIn + +this.helicopterPaxCargo[i].paxIn ;
                this.totalPaxOut = this.totalPaxOut + +this.helicopterPaxCargo[i].paxOut;
                this.totalCargoIn = this.totalCargoIn + +this.helicopterPaxCargo[i].cargoIn ;
                this.totalCargoOut = this.totalCargoOut + +this.helicopterPaxCargo[i].cargoOut;
            }
        }

        if (this.sovModel.vessel2vessels.length > 0) {
            for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
                this.totalPaxIn = this.totalPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.totalPaxIn + 0;
                this.totalPaxOut = this.totalPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.totalPaxOut + 0;
                this.totalCargoIn = this.totalCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.totalCargoIn + 0;
                this.totalCargoOut = this.totalCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.totalCargoOut + 0;
            }
        }
    }

    openVesselMap(content, vesselname: string, toMMSI: number) {
        const routemap = document.getElementById('routeMap');
        const v2vHandler = new Vessel2VesselActivity({
            sovModel: this.sovModel,
            htmlMap: routemap,
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

    addHoCToArray() {
        this.HOCArray.push({value: '', amount: 1});
    }

    addToolboxToArray() {
        this.ToolboxArray.push({value: '', amount: 1});
    }

    addVesselNonAvailabilityToArray() {
        this.VesselNonAvailabilityArray.push({reason: 'DC small breakdown', from: '00:00', to: '00:00'});
    }
    addWeatherDowntimeToArray() {
        this.WeatherDowntimeArray.push({decidedBy: 'Siemens Gamesa', from: '00:00', to: '00:00', vesselsystem: 'Gangway'});
    }

    addMissedTransferToArray() {
        this.missedPaxCargo.push({location: '', from: {hour: '00', minutes: '00' }, to: {hour: '00', minutes: '00'}, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0});
    }

    addHelicopterTransferToArray() {
        this.helicopterPaxCargo.push({from: {hour: '00', minutes: '00' }, to: {hour: '00', minutes: '00'}, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0});
    }

    addDPToArray() {
        this.dpArray.push({from: {hour: '00', minutes: '00'}, to: {hour: '00', minutes: '00'}});
    }

    removeLastFromMissedTransferArray() {
        this.missedPaxCargo.pop();
    }

    removeLastFromHelicopterTransferArray() {
        this.helicopterPaxCargo.pop();
    }
    removeLastFromDPArray() {
        this.dpArray.pop();
    }

    removeLastFromToolboxArray() {
        this.ToolboxArray.pop();
    }

    removeLastFromHOCArray() {
        this.HOCArray.pop();
    }

    removeLastFromVesselNonAvailabilityArray() {
        this.VesselNonAvailabilityArray.pop();
    }

    removeLastFromWeatherDowntimeArray() {
        this.WeatherDowntimeArray.pop();
    }

    setDPRInputFields() {
        this.commonService.getSovDprInput({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date}).subscribe(SovDprInput => {
            if (SovDprInput.length > 0) {
                this.HOCArray = SovDprInput[0].hoc;
                this.ToolboxArray = SovDprInput[0].toolbox;
                this.VesselNonAvailabilityArray = SovDprInput[0].vesselNonAvailability;
                this.WeatherDowntimeArray = SovDprInput[0].weatherDowntime;
                this.liquidsObject = SovDprInput[0].liquids;
                this.peopleonBoard = SovDprInput[0].PoB;
                this.remarks = SovDprInput[0].remarks;
                this.cateringObject = SovDprInput[0].catering;
                this.dpArray = SovDprInput[0].dp;
                this.HOCTotalOld = SovDprInput[0].HOCAmountOld;
                this.HOCTotalNew = SovDprInput[0].HOCAmountNew;
                this.ToolboxTotalOld = SovDprInput[0].ToolboxAmountOld;
                this.ToolboxTotalNew = SovDprInput[0].ToolboxAmountNew;
                this.missedPaxCargo = SovDprInput[0].missedPaxCargo;
                this.helicopterPaxCargo = SovDprInput[0].helicopterPaxCargo;
            }

        }, null, () => {

        });
    }

    saveMissedPaxCargo() {
        this.commonService.saveMissedPaxCargo({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, MissedPaxCargo: this.missedPaxCargo }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.nonAvailabilityChanged = false;
    }

    saveHelicopterPaxCargo() {
        this.commonService.saveHelicopterPaxCargo({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, HelicopterPaxCargo: this.helicopterPaxCargo }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.nonAvailabilityChanged = false;
    }

    savev2vPaxInput() {
        this.commonService.updateSOVv2vPaxInput({
            mmsi: this.vesselObject.mmsi,
            date: this.vesselObject.date,
            transfers: this.sovModel.vessel2vessels[0] .transfers
        }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.nonAvailabilityChanged = false;
    }


    savePlatformPaxInput(transfer) {
        this.commonService.updateSOVPlatformPaxInput({
            _id: transfer._id,
            mmsi: this.vesselObject.mmsi,
            paxIn: transfer.paxIn,
            paxOut: transfer.paxOut,
            cargoIn: transfer.cargoIn,
            cargoOut: transfer.cargoOut
        }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.nonAvailabilityChanged = false;
    }

    saveTurbinePaxInput(transfer) {
        this.commonService.updateSOVTurbinePaxInput({_id: transfer._id, mmsi: this.vesselObject.mmsi, paxIn: transfer.paxIn, paxOut: transfer.paxOut, cargoIn: transfer.cargoIn, cargoOut: transfer.cargoOut }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.nonAvailabilityChanged = false;
    }

    ngOnInit() {
        this.createTimes();
        this.createSeperateTimes();
        Chart.pluginService.register(annotation);
        
        window.onbeforeprint = (evt) => {
            // Only update size of the container: the graphs will auto rescale
            const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
            for (let _i = 0; _i < containers.length; _i++) {
                const container = <HTMLDivElement> containers[_i];
                container.style.width = '260mm';
            }
        };
        window.onafterprint = (evt) => {
            // Only update size of the container: the graphs will auto rescale
            const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
            for (let _i = 0; _i < containers.length; _i++) {
                const container = <HTMLDivElement> containers[_i];
                container.style.width = '100%';
            }
        };
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
                            this.updatePaxCargoTotal();
                            this.updateHOCTotal();
                            this.updatePoB();
                            this.updateToolboxTotal();
                            this.updatev2vPaxCargoTotal();
                            this.getVesselRoute();
                        });
                    } else {
                        this.sovModel.platformTransfers = platformTransfers;
                        this.sovModel.sovType = SovType.Platform;
                        this.turbinesLoaded = true;
                        this.updatePaxCargoTotal();
                        this.updateHOCTotal();
                        this.updatePoB();
                        this.updateToolboxTotal();
                        this.updatev2vPaxCargoTotal();
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
                }, null, () => {
                    this.cycleTimeLoaded = true;
                    this.checkIfAllLoaded();
                });
                this.setDPRInputFields();
                this.locShowContent = true;
            } else {
                // Skip check if all data is loaded if there is none
                this.buildPageWhenAllLoaded();
                if (sov.length > 0) {
                    this.sovModel.sovInfo = sov[0];
                }
                this.setDPRInputFields();
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

    // ToDo: Common used by platform and turbine
    private GetDailySummary(model: SummaryModel, transfers: any[]) {
        model.maxSignificantWaveHeightdDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function (o) { return o.Hs; })));
        model.maxWindSpeedDuringOperations = this.calculationService.GetDecimalValueForNumber(Math.max.apply(Math, transfers.map(function (o) { return o.peakWindGust; })));
        return model;
    }

    GetMatlabDurationToMinutes(serial) {
        return this.datetimeService.MatlabDurationToMinutes(serial);
    }

    // universe functie van maken ipv 6x dezelfde functie
    saveFuelStats() {
        this.commonService.saveFuelStatsSovDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, liquids: this.liquidsObject}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                console.log('danger');
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.fuelChanged = false;
    }

    saveIncidentStats() {

        this.ToolboxArray = this.ToolboxArray.filter(function (result, _i) {
            return +result.amount !== 0;
        });

        this.HOCArray = this.HOCArray.filter(function (result, _i) {
            return +result.amount !== 0;
        });

        this.commonService.saveIncidentDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, toolbox: this.ToolboxArray, hoc: this.HOCArray, ToolboxAmountNew: this.ToolboxTotalNew, HOCAmountNew: this.HOCTotalNew}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.incidentsChanged = false;
    }


    saveWeatherDowntimeStats() {
        this.commonService.saveNonAvailabilityDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, vesselNonAvailability: this.VesselNonAvailabilityArray}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });

        this.commonService.saveWeatherDowntimeDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, weatherDowntime: this.WeatherDowntimeArray}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.weatherDowntimeChanged = false;
    }

    saveCateringStats() {
        this.commonService.saveCateringStats({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, catering: this.cateringObject}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.cateringChanged = false;
    }

    saveDPStats() {
        this.commonService.saveDPStats({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, dp: this.dpArray}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.cateringChanged = false;
    }

    savePoBStats() {
        this.commonService.savePoBStats({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, peopleonBoard: this.peopleonBoard}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.poBChanged = false;
    }

    saveRemarksStats() {
        this.commonService.saveRemarksStats({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, remarks: this.remarks}).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
        this.remarksChanged = false;
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
            this.gangwayActive = naCountGangway !== this.sovModel.turbineTransfers.length;
        } else if (this.sovModel.sovType === SovType.Platform) {
            this.sovModel.platformTransfers.forEach(transfer => {
                transfer.gangwayUtilisation === undefined || transfer.gangwayUtilisation === '_NaN_' ? naCountGangway ++ : naCountGangway = naCountGangway;
                transfer = this.calculationService.ReplaceEmptyColumnValues(transfer);
                transfer.totalDuration = this.calculationService.GetDecimalValueForNumber(transfer.totalDuration);
                transfer.gangwayDeployedDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayDeployedDuration);
                transfer.gangwayReadyDuration = this.calculationService.GetDecimalValueForNumber(transfer.gangwayReadyDuration);
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

    testValidWeatherField(weatherField: number[]) {
        return isArray(weatherField) && weatherField.reduce((curr: boolean, val: any) => curr || typeof(val) === 'number', false);
    }

    createWeatherOverviewChart() {
        const weather =  this.sovModel.sovInfo.weatherConditions;
        if (weather !== undefined) {
            this.weatherOverviewChartCalculated = true;
            const timeStamps = weather.time.map(matlabTime => this.datetimeService.MatlabDateToUnixEpoch(matlabTime));
            const dsets = [];
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
            const waveParams = Object.keys(weather).filter(key => key !== 'time' && key !== 'wavesource');
            waveParams.forEach(param => {
                const data = weather[param];
                if (isArray(data) && data.some((elt, _i) => elt && elt !== '_NaN_' && data[_i + 1])) {
                    const label = param.replace('waveHs', 'Hs').replace('waveTp', 'Tp');
                    let unit = '';
                    let axisID = 'hidden';
                    switch (label) {
                        case 'Hs':
                            unit = 'm';
                            axisID = 'Hs';
                            break;
                        case 'waveDirection': case 'windDirection': case 'waveDir': case 'windDir':
                            unit = 'deg';
                            axisID = 'waveDir';
                            break;
                        case 'Tp':
                            unit = 's';
                            axisID = 'Tp';
                            break;
                        case 'Wind': case 'WindAvg': case 'WindGust': case 'windAvg': case 'windGust':
                            unit = 'km/h';
                            axisID = 'Wind';
                            break;
                        default:
                            console.error('Unhandled unit: ' + label);
                    }
                    dsets.push({
                        data: data.map((dataElt, i) => {
                            if (typeof(dataElt) === 'number' && dataElt >= 0) {
                                return {x: timeStamps[i], y: dataElt};
                            } else {
                                return {x: timeStamps[i], y: NaN};
                            }
                        }),
                        label: label,
                        pointHoverRadius: 5,
                        pointHitRadius: 30,
                        unit: unit,
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        yAxisID: axisID,
                        hidden: false // dsets.length !== 0
                    });
                }
            });

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
            dsets.push({
                data: dockingData,
                label: 'Vessel transfers',
                pointHoverRadius: 0,
                pointHitRadius: 0,
                pointRadius: 0,
                borderWidth: 0,
                yAxisID: 'hidden',
                lineTension: 0,
            });
            if (this.weatherOverviewChart) {
                this.weatherOverviewChart.destroy();
            }
            setTimeout(() => {
                this.weatherOverviewChart = new WeatherOverviewChart(dsets, timeStamps, chartTitle);
            }, 300);
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

    private ResetTransfers() {
        this.routeLoaded = false;
        this.platformsLoaded = false;
        this.turbinesLoaded = false;
        this.v2vLoaded = false;
        this.cycleTimeLoaded = false;
        this.sovLoaded = false;
        this.fuelChanged = false;
        this.incidentsChanged = false;
        this.nonAvailabilityChanged = false;
        this.weatherDowntimeChanged = false;
        this.cateringChanged = false;
        this.remarksChanged = false;
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
