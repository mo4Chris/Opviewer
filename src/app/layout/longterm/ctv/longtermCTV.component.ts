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
import { ComprisonArrayElt, RawScatterData } from '../models/scatterInterface';
import { CorrelationGraph } from '../models/correlationgraph/correlationgraph.component';

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
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    comparisonArray: ComprisonArrayElt[] = [
        { x: 'date', y: 'vesselname', graph: 'bar', xLabel: 'Vessel', yLabel: 'Number of transfers', dataType: 'transfer', info:
            'Number of turbine transfers per month.', barCallback: (data) => this.usagePerMonth(data)},
        { x: 'startTime', y: 'speedInTransitAvgKMH', graph: 'scatter', xLabel: 'Time', yLabel: 'Speed [knots]', dataType: 'transit', info:
            'Average speed of when sailing from or to the windfield. Aborted attempts are not shown.',
        },
        { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]', dataType: 'transfer', info:
            'Shows the peak impact for each vessel during turbine transfers. The peak impact is computed as the maximum of all bumbs during transfer, ' +
            'and need not be the result of the initial approach.' },
        { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer', info:
            'Transfer score for each vessel in the selected period. Transfer score is an estimate for how stable the vessel connection is during ' +
            'transfer, rated between 1 and 10. Scores under 6 indicate unworkable conditions.',
            annotation: () => this.scatterPlot.drawHorizontalLine(6)},
        { x: 'startTime', y: 'MSI', graph: 'scatter', xLabel: 'Time', yLabel: 'Motion sickness index', dataType: 'transit', info:
            'Motion sickness index computed during the transit from the harbour to the wind field. This value is not normalized, ' +
            'meaning it scales with transit duration. Values exceeding 20 indicate potential problems.',
            annotation: () => this.scatterPlot.drawHorizontalLine(20, 'MSI threshold')},
        { x: 'Hs', y: 'score', graph: 'scatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer', info:
            'Hs versus docking scores. Low scores during low sea conditions might indicate a problem with the captain or fender.',
            annotation: () => this.scatterPlot.drawHorizontalLine(6)},
        { x: 'date', y: 'Hs', graph: 'bar', xLabel: 'Hs [m]', yLabel: 'Number of transfers', dataType: 'transfer', info:
            'Deployment distribution for various values of Hs', barCallback: (data) => this.usagePerHsBin(data),
            annotation: () => this.scatterPlot.drawHorizontalLine(20, 'MSI threshold')},
        { x: 'Hs', y: 'score', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer', info:
            'Transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and outliers are drawn separately.',
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
    CorrelationGraph: CorrelationGraph;

    // On (re)load
    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    buildPageWithCurrentInformation() {
        this.scatterPlot.vesselObject = this.vesselObject;
        if (this.vesselObject.mmsi.length > 0) {
            this.getVesselLabels({
                mmsi: this.vesselObject.mmsi,
                x: this.comparisonArray[0].x as string,
                y: this.comparisonArray[0].y as string,
                dateMin: this.vesselObject.dateMin,
                dateMax: this.vesselObject.dateMax }).subscribe(_ => {
                this.getGraphDataPerComparison();
            });
        } else {
            this.scatterPlot.destroyCurrentCharts();
        }
        this.myChart = this.scatterPlot.myChart;
        // this.CorrelationGraph = new CorrelationGraph(
        //     {
        //         mmsi: this.vesselObject.mmsi[0],
        //         matlabDates: [this.vesselObject.dateMin, this.vesselObject.dateMax],
        //         predictors: [{name: 'Hs', label: 'Hs'}],
        //     },
        //     this.calculationService,
        //     this.dateTimeService,
        //     this.newService
        //     );
        // this.CorrelationGraph.load();
        // this.CorrelationGraph.info();
    }

    // Data acquisition
    getVesselLabels(vessel: {mmsi: number[], x: string | number, y: string | number, dateMin: any, dateMax: any}) {
        const request = {
            mmsi: vessel.mmsi,
            reqFields: [],
            dateMin: vessel.dateMin,
            dateMax: vessel.dateMax
        };
        return this.newService
            .getTransfersForVesselByRange(request).pipe(
            map(
                (transfers) => {
                    for (let _j = 0; _j < transfers.length; _j++) {
                        this.scatterPlot.labelValues[_j] = transfers[_j].label[0].replace('_', ' ');
                    }
                    return {
                        label: [transfers[0].label],
                        startTime: transfers.map(transfer => transfer.date),
                        x: transfers.map(transfer => transfer[vessel.x]),
                        y: transfers.map(transfer => transfer[vessel.y]),
                    };
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
        const queryElt = {
            mmsi: this.vesselObject.mmsi,
            dateMin: this.vesselObject.dateMin,
            dateMax: this.vesselObject.dateMax,
            reqFields: [compElt.x, compElt.y],
            x: compElt.x,
            y: compElt.y
        };

        switch (compElt.dataType) {
            case 'transfer':
                this.newService.getTransfersForVesselByRange(queryElt).pipe(map(
                    (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData, graphIndex, compElt)
                    ), catchError(error => {
                    console.log('error: ' + error);
                    throw error;
                })).subscribe(null, null, () => {
                    onLoadedCB();
                });
                break;
            case 'transit':
                this.newService.getTransitsForVesselByRange(queryElt).pipe(map(
                    (rawScatterData: RawScatterData[]) => {
                        this.parseRawData(rawScatterData, graphIndex, compElt);
                    }
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

    parseRawData(rawScatterData: RawScatterData[], graphIndex: number, compElt: ComprisonArrayElt) {
        switch (compElt.graph) {
            case 'scatter': case 'areaScatter':
                this.scatterPlot.scatterDataArrayVessel[graphIndex] = rawScatterData.map((data) => {
                    const scatterData: {x: number|Date, y: number|Date, callback?: Function}[] = [];
                    let x: number|Date;
                    let y: number|Date;
                    data[compElt.x].forEach((_x, __i) => {
                        const _y = data[compElt.y][__i];
                        x = this.processData(this.comparisonArray[graphIndex].x, _x);
                        y = this.processData(this.comparisonArray[graphIndex].y, _y);
                        const matlabDate = Math.floor(data.date[__i]);
                        const navToDPRByDate = () => {
                            return this.navigateToVesselreport.emit({mmsi: data._id, matlabDate: matlabDate});
                        };
                        scatterData.push({x: x, y: y, callback: navToDPRByDate});
                    });
                    return scatterData;
                });
                break;
            case 'bar':
                this.scatterPlot.scatterDataArrayVessel[graphIndex] = rawScatterData.map(scatterElt => {
                    return compElt.barCallback(scatterElt);
                });
                break;
            default:
                console.error('Undefined graphtype detected in parseRawData!')
        }
    }

    usagePerMonth(rawScatterData: RawScatterData) {
        const groupedData = this.groupDataByMonth(rawScatterData);
        return [{x: groupedData.labels, y: groupedData.data.map(x => x.length)}];
    }

    usagePerHsBin(rawScatterData: RawScatterData) {
        const groupedData = this.groupDataByBin(rawScatterData, {Hs: this.calculationService.linspace(0, 5, 0.2)});
        const largestDataBin = groupedData.data.reduce((prev, curr, _i) => {
            if (curr.length > 0) {
                return _i;
            } else {
                return prev;
            }
        });
        return [{x: groupedData.labels.slice(0, largestDataBin), y: groupedData.data.map(x => x.length)}];
    }

    processData(Type: string, elt: number) {
        switch (Type) {
            case 'startTime': case 'date':
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
            case 'speed': case 'speedInTransitAvgKMH': case'speedInTransitKMH':
                return elt / 1.852;
            default:
                return NaN;
        }
    }

    groupDataByMonth(data: {date: number[], [prop: string]: any} ) {
        const month = Object.create(this.fromDate);
        month.year = this.fromDate.year;
        month.month = this.fromDate.month;
        month.day = 0;
        const monthLabels = [];
        const dataPerMonth = [];
        let matlabStartDate: number;
        let matlabStopDate: number;
        while (!month.after(this.toDate)) {
            // Creating nice labels to show in the bar plots
            if (month.month === 0) {
                monthLabels.push('Jan ' + month.year);
            } else {
                monthLabels.push(DatetimeService.shortMonths[month.month - 1]);
            }
            matlabStartDate = this.dateTimeService.objectToMatlabDate(month);
            // Getting the next month
            if (month.month === 11) {
                month.year += 1;
                month.month = 0;
            } else {
                month.month += 1;
            }
            matlabStopDate = this.dateTimeService.objectToMatlabDate(month);
            // Actually sorting the data
            dataPerMonth.push(data.date.filter(dateElt => dateElt >= matlabStartDate && dateElt < matlabStopDate ));
        }
        return {data: dataPerMonth, labels: monthLabels};
    }

    groupDataByBin(data, binData: {[prop: string]: number[]}) {
        const binParam: string = Object.keys(binData)[0];
        const bins: number[] = binData[binParam];
        const labels = [];
        const binnedData = [];

        for (let _i = 0; _i < bins.length - 1; _i++) {
            const lower = bins[_i];
            const upper = bins[_i + 1];
            // Creating nice labels to show in the bar plots
            labels.push(this.calculationService.roundNumber(lower, 10) + '-' + this.calculationService.roundNumber(upper, 10) );
            // Actually sorting the data
            binnedData.push(data[binParam].filter(dateElt => dateElt >= lower && dateElt < upper ));
        }
        return {data: binnedData, labels: labels};
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
