import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonService } from '../../../common.service';

import { map, catchError } from 'rxjs/operators';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../../supportModules/datetime.service';
import { CalculationService } from '../../../supportModules/calculation.service';
import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component';
import { TokenModel } from '../../../models/tokenModel';

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
    @Input() tokenInfo: TokenModel;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();

    comparisonArray: ComprisonArrayElt[] = [
        { x: 'date', y: 'vesselname', graph: 'bar', xLabel: 'Vessel', yLabel: 'Number of transfers', dataType: 'transfer', info:
            'Number of turbine transfers in the selected period.'},
        { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]', dataType: 'transfer', info:
            'Shows the peak impact for each vessel during turbine transfers. The peak impact is computed as the maximum of all bumbs during transfer, and need not be the result of the initial approach' },
        { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer', info:
            'Transfer score for each vessel in the selected period. Transfer score is an estimate for how stable the vessel connection is during transfer, rated between 1 and 10. Scores under 6 indicate unworkable conditions.',
            annotation: () => this.scatterPlot.drawHorizontalLine(6)},
        { x: 'Hs', y: 'score', graph: 'scatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer', info:
            'Peak impacts verses Hs. Higher impacts during low sea conditions indicate either a damaged fender or unsafe vessel handling.',
            annotation: () => this.scatterPlot.drawHorizontalLine(6)},
        { x: 'startTime', y: 'MSI', graph: 'scatter', xLabel: 'Time', yLabel: 'Motion sickness index', dataType: 'transit', info:
            'Motion sickness index computed during the transit from the harbour to the wind field. This value is not normalized, meaning it scales with transit duration. Values exceeding 20 indicate potential problems.',
            annotation: () => this.scatterPlot.drawHorizontalLine(20, 'MSI threshold')},
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
            this.contructSingleGraph(compElt, _i, () => {
                loaded[_i] = true;
                proceedWhenAllLoaded();
            });
        });
    }

    contructSingleGraph(compElt: ComprisonArrayElt, graphIndex: number, onLoadedCB?: () => void) {
        const queryElt = { 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: compElt.x, y: compElt.y };
        switch (compElt.dataType) {
            case 'transfer':
                this.newService.getTransfersForVesselByRange(queryElt).pipe(map(
                    rawScatterData => this.parseRawData(rawScatterData, graphIndex, compElt.graph)
                    ), catchError(error => {
                    console.log('error: ' + error);
                    throw error;
                })).subscribe(null, null, () => {
                    onLoadedCB();
                });
                break;
            case 'transit':
                this.newService.getTransitsForVesselByRange(queryElt).pipe(map(
                    (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData, graphIndex, compElt.graph)
                    ), catchError(error => {
                    console.log('error: ' + error);
                    throw error;
                })).subscribe(null, null, () => {
                    onLoadedCB();
                });
                break;
            default:
                console.error('Invalid data type!');
        }
    }

    parseRawData(rawScatterData: RawScatterData[], graphIndex: number, graphType: string) {
        switch (graphType) {
            case 'scatter':
                this.scatterPlot.scatterDataArrayVessel[graphIndex] = rawScatterData.map((data) => {
                    const scatterData: {x: number|Date, y: number|Date}[] = [];
                    let x: number|Date;
                    let y: number|Date;
                    data.xVal.forEach((_x, __i) => {
                        const _y = data.yVal[__i];
                        x = this.processData(this.comparisonArray[graphIndex].x, _x);
                        y = this.processData(this.comparisonArray[graphIndex].y, _y);
                        scatterData.push({x: x, y: y});
                    });
                    return scatterData;
                });
                break;
            case 'bar':
                this.scatterPlot.scatterDataArrayVessel[graphIndex] = rawScatterData.map((data) => {
                    return [{x: data.label[0], y: data.xVal.length}];
                });
            break;
        }
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
            case 'vesselname':
                return elt;
            case 'date':
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

interface ComprisonArrayElt {
    x: string;
    y: string;
    graph: string;
    xLabel: string;
    yLabel: string;
    dataType: string;
    info: string;
    annotation?: () => {};
}

interface RawScatterData {
    _id: number;
    label: string[];
    xVal: number[];
    yVal: number[];
}
