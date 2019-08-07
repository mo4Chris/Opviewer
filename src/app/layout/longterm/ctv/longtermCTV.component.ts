    import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
    import { CommonService } from '../../../common.service';


    import * as moment from 'moment';
    import { ActivatedRoute, Router } from '@angular/router';
    import { map, catchError } from 'rxjs/operators';
    import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
    import { UserService } from '../../../shared/services/user.service';
    import * as Chart from 'chart.js';
    import * as ChartAnnotation from 'chartjs-plugin-annotation';
    import { DatetimeService } from '../../../supportModules/datetime.service';
    import { CalculationService } from '../../../supportModules/calculation.service';
    import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component';

    @Component({
    selector: 'app-longterm-ctv',
    templateUrl: './longtermCTV.component.html',
    styleUrls: ['./longtermCTV.component.scss']
    })



    export class LongtermCTVComponent implements OnInit {

    constructor(
        private newService: CommonService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private userService: UserService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        ) {
    }
    @Input() vesselObject;
    @Input() tokenInfo;
    //   @Input() hoveredDate: NgbDate;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    //   @Input() modalReference: NgbModalRef;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();

    comparisonArray = [
        { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores' },
        { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]' }
    ];

    myChart = [];
    transferData;
    scatterPlot = new ScatterplotComponent(
        this.vesselObject,
        this.comparisonArray,
        this.calculationService,
        this.dateTimeService
        );


    // On (re)load
    ngOnInit() {
        console.log('Running ctv child init')
        Chart.pluginService.register(ChartAnnotation);
    }

    buildPageWithCurrentInformation() {
        console.log('Building CTV longterm module with current information')
        this.scatterPlot.vesselObject = this.vesselObject;
        this.newService.getTransfersForVesselByRange({
            mmsi: this.vesselObject.mmsi,
            x: this.comparisonArray[0].x,
            y: this.comparisonArray[0].y,
            dateMin: this.vesselObject.dateMin,
            dateMax: this.vesselObject.dateMax }).subscribe(_ => {
            this.getGraphDataPerComparison();
            setTimeout(() => this.showContent.emit(true), 1050);
        });
    }

    // Data acquisition

    searchTransfersByNewSpecificDate() {
        const minValueAsMomentDate = moment(this.fromDate.day + '-' + this.fromDate.month + '-' + this.fromDate.year, 'DD-MM-YYYY');
        const maxpickerValueAsMomentDate = moment(this.toDate.day + '-' + this.toDate.month + '-' + this.toDate.year, 'DD-MM-YYYY');

        minValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        minValueAsMomentDate.format();

        maxpickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        maxpickerValueAsMomentDate.format();

        const momentMinDateAsIso = moment(minValueAsMomentDate).unix();
        const dateMinAsMatlab = this.unixEpochtoMatlabDate(momentMinDateAsIso);
        const momentMaxDateAsIso = moment(maxpickerValueAsMomentDate).unix();
        const dateMaxAsMatlab = this.unixEpochtoMatlabDate(momentMaxDateAsIso);

        this.vesselObject.dateMin = dateMinAsMatlab;
        this.vesselObject.dateMax = dateMaxAsMatlab;

        this.vesselObject.dateNormalMin = this.MatlabDateToJSDateYMD(dateMinAsMatlab);
        this.vesselObject.dateNormalMax = this.MatlabDateToJSDateYMD(dateMaxAsMatlab);

        const mmsiArray = [];
        // if (this.dropdownValues !== undefined && this.dropdownValues[0].mmsi !== []) {
        //   for (let _j = 0; _j < this.dropdownValues.length; _j++) {
        //     mmsiArray.push(this.dropdownValues[_j].mmsi);
        //   }
        //   this.vesselObject.mmsi = mmsiArray;
        // }

        this.buildPageWithCurrentInformation();
    }

    getTransfersForVesselByRange(vessel) {
        for (let _i = 0; _i < this.comparisonArray.length; _i++) {
        return this.newService
            .getTransfersForVesselByRange({ 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: this.comparisonArray[_i].x, y: this.comparisonArray[_i].y }).pipe(
            map(
                (transfers) => {
                this.transferData = transfers;
                for (let _j = 0; _j < this.transferData.length; _j++) {
                    this.scatterPlot.labelValues[_j].label = this.transferData[_j].label[0];
                }
                }),
            catchError(error => {
                console.log('error ' + error);
                throw error;
            }));
        }
    }
    getGraphDataPerComparison() {
        const loaded = [];
        const proceedWhenAllLoaded = () => {
            if (loaded.reduce((x, y) => x && y, true)) {
                console.log('All graph data parsed and loaded!')
                this.scatterPlot.setScatterPointsVessel();
            }
        };
        for (let _i = 0; _i < this.comparisonArray.length; _i++) {
        loaded.push(false);
        this.newService.getTransfersForVesselByRange({ 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: this.comparisonArray[_i].x, y: this.comparisonArray[_i].y }).pipe(
            map(
            (scatterData) => {
                this.scatterPlot.graphData[_i] = scatterData.map(data => {
                    switch (data.y) {
                        case 'score':
                            data.map( x => this.calculateScoreData(x));
                        break;
                        case 'impactForceNmax':
                            data.map( x => this.calculateImpactData(x));
                        break;
                    }
                });
            }), catchError(error => {
                console.log('error: ' + error);
                throw error;
            })).subscribe(null, null, () => {
                loaded[_i] = true;
                proceedWhenAllLoaded();
            });
        }
    }


    calculateImpactData(scatterData) {
        const obj = [];
        for (let _i = 0, arr_i = 0; _i < scatterData.xVal.length; _i++) {
        if (scatterData.xVal[_i] !== null && typeof scatterData.xVal[_i] !== 'object') {
            obj[arr_i] = {
            'x': scatterData.xVal[_i],
            'y': (scatterData.yVal[_i] / 1000)
            };
            arr_i++;
        }
        }
        return obj;
    }

    calculateScoreData(scatterData) {
        const obj = [];
        for (let _i = 0, arr_i = 0; _i < scatterData.xVal.length; _i++) {
        if (scatterData.xVal[_i] !== null && typeof scatterData.xVal[_i] !== 'object') {
            obj[arr_i] = {
            'x': scatterData.xVal[_i],
            'y': scatterData.yVal[_i]
            };
            arr_i++;
        }
        }
        return obj;
    }

    // Utility
    getMatlabDateYesterday() {
        return this.dateTimeService.getMatlabDateYesterday();
    }
    getMatlabDateLastMonth() {
        return this.dateTimeService.getMatlabDateLastMonth();
    }
    getJSDateYesterdayYMD() {
        return this.dateTimeService.getJSDateYesterdayYMD();
    }
    getJSDateLastMonthYMD() {
        return this.dateTimeService.getJSDateLastMonthYMD();
    }
    MatlabDateToJSDateYMD(serial) {
        return this.dateTimeService.MatlabDateToJSDateYMD(serial);
    }
    unixEpochtoMatlabDate(epochDate) {
        return this.dateTimeService.unixEpochtoMatlabDate(epochDate);
    }
    getMMSIFromParameter() {
        let mmsi;
        this.route.params.subscribe(params => mmsi = parseFloat(params.boatmmsi));
        return mmsi;
    }
    getVesselNameFromParameter() {
        let vesselName;
        this.route.params.subscribe(params => vesselName = params.vesselName);
        return vesselName;
    }
    MatlabDateToUnixEpochViaDate(serial) {
        return this.dateTimeService.MatlabDateToUnixEpochViaDate(serial);
    }
    }
