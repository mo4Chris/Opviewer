import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { CommonService } from '../../../common.service';

import { map, catchError } from 'rxjs/operators';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../../supportModules/datetime.service';
import { CalculationService } from '../../../supportModules/calculation.service';
import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component';
import { ComprisonArrayElt, RawScatterData, SOVRawScatterData } from '../models/scatterInterface';
import { Observable, forkJoin } from 'rxjs';
import { UtilizationGraphComponent } from './models/utilizationGraph.component';
import { LongtermVesselObjectModel } from '../longterm.component';

@Component({
selector: 'app-longterm-sov',
templateUrl: './longtermSOV.component.html',
styleUrls: ['./longtermSOV.component.scss']
})

export class LongtermSOVComponent implements OnInit {
    constructor(
        private newService: CommonService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        ) {
    }
    @Input() vesselObject: LongtermVesselObjectModel;
    @Input() tokenInfo;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    @ViewChild(UtilizationGraphComponent)
    utilizationGraph: UtilizationGraphComponent;

    comparisonArray: ComprisonArrayElt[] = [
        { x: 'turbine', y: 'platform', graph: 'bar', xLabel: 'Time', yLabel: 'Number of transfers',
        dataType: 'transfer', barCallback: this.usagePerMonth, info: `Number of turbine or platform
        transfers performed on a monthly basis. Platform transfers are indicated by the lighter colour.
        `},
        { x: 'startTime', y: 'duration', graph: 'scatter', xLabel: 'Time', yLabel: 'Duration',
        dataType: 'turbine', info: 'Turbine transfer duration' },
        { x: 'arrivalTimePlatform', y: 'visitDuration', graph: 'scatter', xLabel: 'Time', yLabel: 'Duration',
        dataType: 'platform', info: 'Platform transfer duration' },
        { x: 'Hs', y: 'duration', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Transfer duration [mns]', dataType: 'turbine',
        info: `Turbine transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and
            outliers are drawn separately. Transfers without valid transfer scores have been omitted.`,
        annotation: () => this.scatterPlot.drawHorizontalLine(20, 'MSI threshold')},
        {
            x: 'date', y: 'Hs', graph: 'bar', xLabel: 'Hs [m]', yLabel: 'Number of transfers', dataType: 'transfer', info:
                `Deployment distribution for various values of Hs. This gives an indication up to which conditions the vessel is deployed.
            Only bins in which the vessels have been deployed are shown. Both turbine and platform transfers are shown.
            `, barCallback: (data: SOVRawScatterData) => this.usagePerHsBin(data),
            annotation: () => this.scatterPlot.drawHorizontalLine(20, 'MSI threshold')
        },
        { x: 'Hs', y: 'visitDuration', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Transfer duration [mns]', dataType: 'platform',
        info: `Platform transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and
            outliers are drawn separately. Transfers without valid transfer scores have been omitted.`,
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
            this.getGraphDataPerComparison();
        } else {
            this.scatterPlot.destroyCurrentCharts();
        }
        this.myChart = this.scatterPlot.myChart;
        if (this.vesselObject.mmsi.length > 0) {
            this.utilizationGraph.updateChart();
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
        let handler: Observable<any>;
        this.comparisonArray.forEach((compElt, _i) => {
            loaded.push(false);
            const queryElt = {
                mmsi: this.vesselObject.mmsi,
                dateMin: this.vesselObject.dateMin,
                dateMax: this.vesselObject.dateMax,
                reqFields: [compElt.x, compElt.y],
            };
            switch (compElt.dataType) {
                case 'transfer':
                    handler = this.getCombinedTransferObservable(queryElt);
                    break;
                case 'turbine':
                    handler = this.newService.getTurbineTransfersForVesselByRangeForSOV(queryElt);
                    break;
                case 'platform':
                    handler = this.newService.getPlatformTransfersForVesselByRangeForSOV(queryElt);
                    break;
                case 'transit':
                    handler = this.newService.getTransitsForVesselByRangeForSOV(queryElt);
                    break;
                default:
                    console.error('Invalid data type!');
            }
            handler.pipe(
                map(rawScatterData => this.parseRawData(rawScatterData, _i, compElt)),
                catchError(error => {
                    console.log('error: ' + error);
                    throw error;
                })).subscribe(() => {
                    loaded[_i] = true;
                    proceedWhenAllLoaded();
            });
        });
    }

    parseRawData(rawScatterData:  RawScatterData[], graphIndex: number, compElt: ComprisonArrayElt) {
        rawScatterData.forEach((data, _i) => {
            if (data.label.length > 0) {
                this.scatterPlot.labelValues[_i] = data.label[0].replace('_', ' ');
            }
        });
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
                            return this.navigateToDPR({mmsi: data._id, matlabDate: matlabDate});
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
                console.error('Undefined graphtype detected in parseRawData!');
        }
    }

    navigateToDPR(navItem: {mmsi: number, matlabDate: number}) {
        this.navigateToVesselreport.emit(navItem);
    }

    processData(Type: string, elt: number) {
        switch (Type) {
            case 'startTime': case 'dayNum': case 'arrivalTimePlatform':
                return this.scatterPlot.createTimeLabels(elt);
            case 'impactForceNmax':
                return elt / 1000;
            default:
                return elt;
        }
    }

    usagePerMonth(data): {x: number[], y: number[], key: string}[] { // : {_id: number, label: string[], turbine: any, platform: any}
        const turbInfo = {x: [], y: [], key: 'Turbine transfers:'};
        const platInfo = {x: [], y: [], key: 'Platform transfers:'};
        if (data.turbine) {
            turbInfo.x = data.turbine.groups.labels;
            turbInfo.y = data.turbine.groups.dates.map((elts: Array<number>) => elts.length);
        }
        if (data.platform) {
            platInfo.x = data.platform.groups.labels;
            platInfo.y = data.platform.groups.dates.map(elts => elts.length);
        }
        return [turbInfo, platInfo];
    }

    usagePerHsBin(rawScatterData: SOVRawScatterData) {
        let groupedData: {data: number[][], labels: string[]};
        const hsBins = this.calculationService.linspace(0, 5, 0.2);
        if (rawScatterData.turbine) {
            groupedData = this.groupDataByBin(rawScatterData.turbine, {param: 'Hs', val: hsBins});
        }
        if (rawScatterData.platform) {
            const groupedPlatforms = this.groupDataByBin(rawScatterData.turbine, {param: 'Hs', val: hsBins});
            if (groupedData) {
                groupedData.data.forEach((elt, _i) => {
                    elt.concat(groupedPlatforms.data[_i]);
                });
            } else {
                groupedData = groupedPlatforms;
            }
        }
        const largestDataBin = groupedData.data.reduce((prev, curr, _i) => {
            if (curr.length > 0) {
                return <number> _i;
            } else {
                return <number> prev;
            }
        }, 0);
        return [{ x: groupedData.labels.slice(0, largestDataBin), y: groupedData.data.map(x => x.length) }];
    }
    groupDataByBin(data: RawScatterData, binData: {param: string, val: number[] }): {data: number[][], labels: string[]} {
        const binParam: string = binData.param;
        const bins: number[] = binData.val;
        bins[0] = 0.0001; // To stop roundNumber from returning 0 as N/a
        const labels = [];
        const binnedData = [];
        for (let _i = 0; _i < bins.length - 1; _i++) {
            const lower = bins[_i];
            const upper = bins[_i + 1];
            // Creating nice labels to show in the bar plots
            labels.push(this.calculationService.roundNumber(lower, 10) + '-' + this.calculationService.roundNumber(upper, 10));
            // Actually sorting the data
            binnedData.push(data[binParam].filter(dateElt => dateElt >= lower && dateElt < upper));
        }
        return { data: binnedData, labels: labels };
    }

    getCombinedTransferObservable(queryElt: {
        mmsi: number[],
        dateMin: number,
        dateMax: number,
        reqFields: string[],
    }): Observable<any> {
        // Retrieves data for both turbine and platform transfer stats
        const index = (arr: Array<any>, _mmsi: number) => {
            let content = null;
            arr.some((elt) => {
                if (elt._id === _mmsi) {
                    content = elt;
                    return true;
                }
                return false;
            });
            if (content) {
                content.groups = this.groupDataByMonth(content);
            }
            return content;
        };
        const queryEltTurb = { ... queryElt, ... {reqFields: ['startTime', 'duration', 'Hs']}};
        const queryEltPlatform = { ... queryElt, ... {reqFields: ['date', 'arrivalTimePlatform', 'visitDuration', 'Hs']}};
        return forkJoin(
            this.newService.getTurbineTransfersForVesselByRangeForSOV(queryEltTurb),
            this.newService.getPlatformTransfersForVesselByRangeForSOV(queryEltPlatform)
        ).pipe(
            map(([turbine, platform]) => {
                const output = [];
                queryElt.mmsi.forEach((_mmsi: number, _i) => {
                    const local = {
                        _id: _mmsi,
                        label: [''],
                        turbine: null,
                        platform: null,
                    };
                    local.turbine = index(turbine, _mmsi);
                    local.platform = index(platform, _mmsi);
                    if (local.turbine) {
                        local.label = local.turbine.label;
                        output.push(local);
                    } else if (local.platform) {
                        local.label = local.platform.label;
                        output.push(local);
                    }
                });
                return output;
            }
        ));
    }

    groupDataByMonth(data: {date: number[]} ) {
        const month = Object.create(this.fromDate);
        month.year = this.fromDate.year;
        month.month = this.fromDate.month;
        month.day = 0;
        const monthLabels = [];
        const dataPerMonth = []; // : Array<{dates: number[], score: number[]}> = [];
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
            const dataInMonth = data.date.map(dateElt => dateElt >= matlabStartDate && dateElt < matlabStopDate );
            dataPerMonth.push(
                data.date.filter((_, _i) => dataInMonth[_i]),
            );
        }
        return {dates: dataPerMonth, labels: monthLabels};
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
