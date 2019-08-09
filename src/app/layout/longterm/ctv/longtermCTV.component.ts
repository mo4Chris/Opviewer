import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonService } from '../../../common.service';

import { map, catchError } from 'rxjs/operators';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
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
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        ) {
    }
    @Input() vesselObject: {dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[]};
    @Input() tokenInfo;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();

    comparisonArray = [
        { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer' },
        { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]', dataType: 'transfer' },
        { x: 'Hs', y: 'score', graph: 'scatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer' },
        { x: 'startTime', y: 'MSI', graph: 'scatter', xLabel: 'Time', yLabel: 'Motion sickness index', dataType: 'transit' },
        { x: 'transitTimeMinutes', y: 'MSI', graph: 'scatter', xLabel: 'Transit time [mns]', yLabel: 'Motion sickness index', dataType: 'transit' },
    ];

    myChart = [];
    allGraphsEmpty = false;
    scatterPlot = new ScatterplotComponent(
        this.vesselObject,
        this.comparisonArray,
        this.calculationService,
        this.dateTimeService
        );


    // On (re)load
    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    buildPageWithCurrentInformation() {
        this.scatterPlot.vesselObject = this.vesselObject;
        if (this.vesselObject.mmsi.length > 0) {
            this.getVesselLabels({
                mmsi: this.vesselObject.mmsi,
                x: this.comparisonArray[0].x,
                y: this.comparisonArray[0].y,
                dateMin: this.vesselObject.dateMin,
                dateMax: this.vesselObject.dateMax }).subscribe(_ => {
                this.getGraphDataPerComparison();
            });
        } else {
            this.scatterPlot.destroyCurrentCharts();
        }
        this.myChart = this.scatterPlot.myChart;
    }

    // Data acquisition
    getVesselLabels(vessel: {mmsi: number[], x: number|string, y: number | string, dateMin: any, dateMax: any}) {
        return this.newService
            .getTransfersForVesselByRange(vessel).pipe(
            map(
                (transfers) => {
                    for (let _j = 0; _j < transfers.length; _j++) {
                        this.scatterPlot.labelValues[_j] = transfers[_j].label[0].replace('_', ' ');
                    }
                }),
            catchError(error => {
                console.log('error ' + error);
                throw error;
            }));
    }

    getGraphDataPerComparison() {
        const loaded = [];
        const proceedWhenAllLoaded = () => {
            if (loaded.reduce((x, y) => x && y, true)) {
                this.scatterPlot.createValues();
                this.showContent.emit(true);
            }
        };
        this.comparisonArray.forEach((compElt, _i) => {
            loaded.push(false);
            const queryElt = { 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: compElt.x, y: compElt.y };
            switch (compElt.dataType) {
                case 'transfer':
                    this.newService.getTransfersForVesselByRange(queryElt).pipe(map(
                        rawScatterData => this.parseRawData(rawScatterData, _i)
                        ), catchError(error => {
                        console.log('error: ' + error);
                        throw error;
                    })).subscribe(null, null, () => {
                        loaded[_i] = true;
                        proceedWhenAllLoaded();
                    });
                    break;
                case 'transit':
                    this.newService.getTransitsForVesselByRange(queryElt).pipe(map(
                        rawScatterData => this.parseRawData(rawScatterData, _i)
                        ), catchError(error => {
                        console.log('error: ' + error);
                        throw error;
                    })).subscribe(null, null, () => {
                        loaded[_i] = true;
                        proceedWhenAllLoaded();
                    });
                    break;
            }
        });
    }

    parseRawData(rawScatterData:  {_id: number, label: string[], xVal: number[]|Date[], yVal: number[]|Date[]}[], _i: number) {
        this.scatterPlot.scatterDataArrayVessel[_i] = rawScatterData.map((data) => {
            const scatterData: {x: number|Date, y: number|Date}[] = [];
            let x: number|Date;
            let y: number|Date;
            data.xVal.forEach((_x, __i) => {
                const _y = data.yVal[__i];
                x = this.processData(this.comparisonArray[_i].x, _x);
                y = this.processData(this.comparisonArray[_i].y, _y);
                scatterData.push({x: x, y: y});
            });
            return scatterData;
        });
    }

    processData(Type: string, elt: number) {
        switch (Type) {
            case 'startTime':
                return this.scatterPlot.createTimeLabels(elt);
            case 'Hs':
                return elt;
            case 'score':
                return elt;
            case 'impactForceNmax':
                return elt / 1000;
            case 'MSI':
                return elt;
            case 'transitTimeMinutes':
                return elt;
            default:
                return NaN;
        }
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
    MatlabDateToUnixEpochViaDate(serial) {
        return this.dateTimeService.MatlabDateToUnixEpochViaDate(serial);
    }
}
