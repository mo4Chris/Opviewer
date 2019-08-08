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
        { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores' },
        { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]' },
        { x: 'Hs', y: 'score', graph: 'scatter', xLabel: 'Hs (m)', yLabel: 'Transfer scores' },
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
        Chart.pluginService.register(ChartAnnotation);
    }

    buildPageWithCurrentInformation() {
        this.scatterPlot.vesselObject = this.vesselObject;
        if (this.vesselObject.mmsi.length > 0) {
            this.getTransfersForVesselByRange({
                mmsi: this.vesselObject.mmsi,
                x: this.comparisonArray[0].x,
                y: this.comparisonArray[0].y,
                dateMin: this.vesselObject.dateMin,
                dateMax: this.vesselObject.dateMax }).subscribe(_ => {
                this.getGraphDataPerComparison();
            });
        } else {
            this.scatterPlot.createValues();
        }
        this.myChart = this.scatterPlot.myChart;
    }

    // Data acquisition
    getTransfersForVesselByRange(vessel: {mmsi: number[], x: number|string, y: number | string, dateMin: any, dateMax: any}) {
        for (let _i = 0; _i < this.comparisonArray.length; _i++) {
        return this.newService
            .getTransfersForVesselByRange(vessel).pipe(
            map(
                (transfers) => {
                    this.transferData = transfers;
                    for (let _j = 0; _j < this.transferData.length; _j++) {
                        this.scatterPlot.labelValues[_j] = this.transferData[_j].label[0].replace('_', ' ');
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
                this.scatterPlot.createValues();
                this.showContent.emit(true);
            }
        };
        for (let _i = 0; _i < this.comparisonArray.length; _i++) {
        loaded.push(false);
        this.newService.getTransfersForVesselByRange({ 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: this.comparisonArray[_i].x, y: this.comparisonArray[_i].y }).pipe(
            map(
            (rawScatterData) => {
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
            }), catchError(error => {
                console.log('error: ' + error);
                throw error;
            })).subscribe(null, null, () => {
                loaded[_i] = true;
                proceedWhenAllLoaded();
            });
        }
    }

    processData(Type: string, elt: number) {
        switch (Type) {
            case 'startTime':
                return this.scatterPlot.createTimeLabels(elt);
            case 'Hs':
                return this.calculateHsData(elt);
            case 'score':
                return this.calculateScoreData(elt);
            case 'impactForceNmax':
                return this.calculateImpactData(elt);
            default:
                return NaN;
        }
    }

    // Formatting function for each type of graph used
    calculateImpactData(impact: number) {
        // Formatting impacts
        return impact / 1000;
    }

    calculateScoreData(score: number) {
        // Format score
        return score;
    }

    calculateHsData(hs: number) {
        return hs;
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
