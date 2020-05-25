import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { CommonService } from '../../../../common.service';

import { map, catchError } from 'rxjs/operators';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { ComprisonArrayElt, RawScatterData, SOVRawScatterData } from '../models/scatterInterface';
import { Observable, forkJoin } from 'rxjs';
import { UtilizationGraphComponent } from './models/utilizationGraph.component';
import { LongtermVesselObjectModel } from '../longterm.component';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { LongtermProcessingService } from '../models/longterm-processing-service.service';

@Component({
  selector: 'app-longterm-sov',
  templateUrl: './longtermSOV.component.html',
  styleUrls: ['./longtermSOV.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LongtermSOVComponent implements OnInit, OnChanges {
    constructor(
        private newService: CommonService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        private permission: PermissionService,
        private parser: LongtermProcessingService,
        ) {
    }
    @Input() vesselObject: LongtermVesselObjectModel;
    @Input() tokenInfo;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    public comparisonArray: ComprisonArrayElt[] = [
        { x: 'turbine', y: 'platform', graph: 'bar', xLabel: 'Time', yLabel: 'Number of transfers',
        dataType: 'transfer', barCallback: this.usagePerMonth, info: `Number of turbine or platform
        transfers performed on a monthly basis. Platform transfers are indicated by the lighter colour.
        `},
        { x: 'startTime', y: 'duration', graph: 'scatter', xLabel: 'Time', yLabel: 'Duration',
        dataType: 'turbine', info: 'Turbine transfer duration for all transfers in the selected period.' },
        { x: 'arrivalTimePlatform', y: 'visitDuration', graph: 'scatter', xLabel: 'Time', yLabel: 'Duration',
        dataType: 'platform', info: 'Platform transfer duration for all transfers in the selected period.' },
        { x: 'Hs', y: 'duration', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Turbine transfer duration [mns]', dataType: 'turbine',
        info: `Turbine transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and
            outliers are drawn separately. Transfers without valid transfer scores have been omitted.`,
        annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold')},
        { x: 'date', y: 'Hs', graph: 'bar', xLabel: 'Hs [m]', yLabel: 'Number of transfers', dataType: 'transfer', info:
            `Deployment distribution for various values of Hs. This gives an indication up to which conditions the vessel is deployed.
            Only bins in which the vessels have been deployed are shown. Both turbine and platform transfers are shown.
            `, barCallback: (data: SOVRawScatterData) => this.usagePerHsBin(data),
            annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold')
        },
        { x: 'Hs', y: 'visitDuration', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Platform transfer duration [mns]', dataType: 'platform',
        info: `Platform transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and
            outliers are drawn separately. Transfers without valid transfer scores have been omitted.`,
            annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold')},
    ];

    public allGraphsEmpty = false; // Not working
    public vesselNames: string [];

    // On (re)load
    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    ngOnChanges() {
        this.vesselNames = this.vesselObject.vesselName;
    }

    navigateToDPR(navItem: {mmsi: number, matlabDate: number}) {
        this.navigateToVesselreport.emit(navItem);
    }

    processData(Type: string, elt: number) {
        switch (Type) {
            case 'startTime': case 'dayNum': case 'arrivalTimePlatform':
                return this.parser.createTimeLabels(elt);
            case 'impactForceNmax':
                return elt / 1000;
            default:
                return elt;
        }
    }

    usagePerMonth(data: SOVRawScatterData): {x: number[], y: number[], key: string}[] { // : {_id: number, label: string[], turbine: any, platform: any}d
        const turbInfo = {x: [], y: [], key: 'Turbine transfers:'};
        const platInfo = {x: [], y: [], key: 'Platform transfers:'};
        const vessel = this.parser.reduceLabels(this.vesselObject, [data.turbine._id]);

        const len = Math.max(data.turbine ? data.turbine.groups.length : 0, data.platform ? data.platform.groups.length : 0);
        const vessels = this.calculationService.fillArray(vessel[0], len);

        if (data.turbine) {
            turbInfo.x = vessels;
            turbInfo.y = data.turbine.groups.map(_group => _group.date.length);
        }
        if (data.platform) {
            platInfo.x = vessels;
            platInfo.y = data.platform.groups.map(_group => _group.date.length);
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
        return [{ x: groupedData.labels.slice(0, largestDataBin), y: groupedData.data.map(x => x.length), key: '# transfers:' }];
    }

    groupDataByBin(data: RawScatterData, binData: {param: string, val: number[] }): {data: number[][], labels: string[]} {
        if (data === null) {
            return {
                data: [],
                labels: [],
            };
        }
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

    groupDataByMonth(data: {date: number[]} ) {
        const dateObj = Object.create(this.fromDate);
        dateObj.year = this.fromDate.year;
        dateObj.month = this.fromDate.month;
        dateObj.day = 1;
        const monthLabels = [];
        const dataPerMonth = []; // : Array<{dates: number[], score: number[]}> = [];
        let matlabStartDate: number;
        let matlabStopDate: number;
        let _counter = 0; // Safety feature to prevent this loop from continuing indefinitely
        while (!dateObj.after(this.toDate) && _counter++ < 100) {
            // Creating nice labels to show in the bar plots
            if (dateObj.month === 1) {
                monthLabels.push('Jan ' + dateObj.year);
            } else {
                monthLabels.push(DatetimeService.shortMonths[dateObj.month - 1]);
            }
            matlabStartDate = this.dateTimeService.objectToMatlabDate(dateObj);
            // Getting the next month. Note: for NgbDates we have 1 januari means date.month === 1
            if (dateObj.month > 11) {
                dateObj.year += 1;
                dateObj.month = 1;
            } else {
                dateObj.month += 1;
            }
            matlabStopDate = this.dateTimeService.objectToMatlabDate(dateObj) - 1;
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
