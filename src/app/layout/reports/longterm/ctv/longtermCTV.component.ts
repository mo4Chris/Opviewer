import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { TokenModel } from '@app/models/tokenModel';
import { ComprisonArrayElt, RawScatterData } from '../models/scatterInterface';
import { WavedataModel, WaveSourceModel } from '@app/models/wavedataModel';
import { DeploymentGraphComponent } from './models/deploymentgraph/deploymentGraph.component';
import { VesselinfoComponent } from './models/vesselinfo/vesselinfo.component';
import { LongtermVesselObjectModel } from '../longterm.component';
import { SettingsService } from '@app/supportModules/settings.service';
import { LongtermProcessingService } from '../models/longterm-processing-service.service';

@Component({
    selector: 'app-longterm-ctv',
    templateUrl: './longtermCTV.component.html',
    styleUrls: ['./longtermCTV.component.scss']
})
export class LongtermCTVComponent implements OnInit, OnChanges {
    constructor(
        private newService: CommonService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        private settings: SettingsService,
        private parser: LongtermProcessingService,
    ) {
    }
    @Input() vesselObject: LongtermVesselObjectModel;
    @Input() tokenInfo: TokenModel;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Input() activeField: string;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

    comparisonArray: ComprisonArrayElt[] = [
        {
            x: 'date', y: 'score', graph: 'bar', xLabel: 'Vessel', yLabel: 'Number of transfers', dataType: 'transfer', info:
                `Number of turbine transfers per month. The lower (thick) part of the bins show the number of valid vessel to turbine
            transfers. The lighter part shows any other transfer made by the vessel (Tied off, impacts without properly attaching
            to the turbine, etc..).
            `, barCallback: (data: RawScatterData) => this.usagePerMonth(data)
        },
        {
            x: 'startTime', y: 'speedInTransitAvgKMH', graph: 'scatter', xLabel: 'Time', yLabel: 'Speed [' + this.settings.unit_speed + ']', dataType: 'transit', info:
                'Average speed of when sailing from or to the windfield. Transits other than harbour-field or back are not shown.',
        },
        {
            x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]', dataType: 'transfer', info:
                'Shows the peak impact for each vessel during turbine transfers. The peak impact is computed as the maximum of all bumbs during transfer, ' +
                'and need not be the result of the initial approach.'
        },
        {
            x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer', info:
                `Transfer score for each vessel in the selected period. Transfer score is an estimate for how stable the vessel
            connection is during  transfer, rated between 1 and 10. Scores under 6 indicate unworkable conditions.
            `, annotation: () => this.parser.drawHorizontalLine(6)
        },
        {
            x: 'startTime', y: 'msi', graph: 'scatter', xLabel: 'Time', yLabel: 'Motion sickness index', dataType: 'transit', info:
                'Motion sickness index computed during the transit from the harbour to the wind field. This value is not normalized, ' +
                'meaning it scales with transit duration. Values exceeding 20 indicate potential problems.',
            annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold')
        },
        {
            x: 'Hs', y: 'score', graph: 'scatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer', info:
                'Hs versus docking scores. Low scores during low sea conditions might indicate a problem with the captain or fender.',
            annotation: () => this.parser.drawHorizontalLine(6)
        },
        {
            x: 'date', y: 'Hs', graph: 'bar', xLabel: 'Hs [m]', yLabel: 'Number of transfers', dataType: 'transfer', info:
                `Deployment distribution for various values of Hs. This gives an indication up to which conditions the vessel is deployed.
            Only bins in which the vessels have been deployed are shown.
            `, barCallback: (data: RawScatterData) => this.usagePerHsBin(data),
            annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold')
        },
        {
            x: 'Hs', y: 'score', graph: 'areaScatter', xLabel: 'Hs [m]', yLabel: 'Transfer scores', dataType: 'transfer', info:
                'Transfer scores drawn as 95% confidence intervals for various Hs bins. The average of each bin and outliers are drawn separately. ' +
                'Transfers without valid transfer scores have been omitted, and transfers rated 1 are drawn as outliers but are not used for computing mean and spread.',
            annotation: () => this.parser.drawHorizontalLine(20, 'MSI threshold'),
            filterCB: (elt) => elt == 1
        },
    ];
    
    wavedataArray: WavedataModel[];

    public vesselNames = [];
    public allGraphsEmpty = false; // Not working
    public fieldname: string;
    public mergedWavedata: {
        timeStamp: any[],
        Hs: any[],
        Tp: any[],
        waveDir: any[],
        wind: any[],
        windDir: any[]
    };
    public wavedataAvailabe = false;

    // On (re)load
    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    ngOnChanges () {
        this.vesselNames = this.vesselObject.vesselName;
        this.updateActiveField(this.activeField);
    }

    navigateToDPR(navItem: { mmsi: number, matlabDate: number }) {
        this.navigateToVesselreport.emit(navItem);
    }

    usagePerMonth(rawScatterData: RawScatterData) {
        const groupedData = this.groupDataByMonth(rawScatterData);
        const validScoresPerMonth = groupedData.data.map(x => x.scores.reduce((prev, curr) => prev + !isNaN(curr), 0));
        const invalidScoresPerMonth = groupedData.data.map(x => x.scores.reduce((prev, curr) => prev + isNaN(curr), 0));
        return [
            { x: groupedData.labels, y: validScoresPerMonth },
            { x: groupedData.labels, y: invalidScoresPerMonth }
        ];
    }

    usagePerHsBin(rawScatterData: RawScatterData) {
        const groupedData = this.groupDataByBin(rawScatterData, { Hs: this.calculationService.linspace(0, 5, 0.2) });
        const largestDataBin = groupedData.data.reduce((prev, curr, _i) => {
            if (curr.length > 0) {
                return _i;
            } else {
                return prev;
            }
        });
        return [{ x: groupedData.labels.slice(0, largestDataBin), y: groupedData.data.map(x => x.length) }];
    }

    groupDataByMonth(data: { date: number[], score?: number[], [prop: string]: any }) {
        const month = Object.create(this.fromDate);
        month.year = this.fromDate.year;
        month.month = this.fromDate.month;
        month.day = 1;
        const monthLabels = [];
        const dataPerMonth = []; // : Array<{dates: number[], score: number[]}> = [];
        let matlabStartDate: number;
        let matlabStopDate: number;
        let _counter = 0;
        while (!month.after(this.toDate) && _counter++ < 100) {
            // Creating nice labels to show in the bar plots
            if (month.month === 1) {
                monthLabels.push('Jan ' + month.year);
            } else {
                monthLabels.push(DatetimeService.shortMonths[month.month - 1]);
            }
            matlabStartDate = this.dateTimeService.objectToMatlabDate(month);
            // Getting the next month
            if (month.month > 11) {
                month.year += 1;
                month.month = 1;
            } else {
                month.month += 1;
            }
            matlabStopDate = this.dateTimeService.objectToMatlabDate(month);
            // Actually sorting the data
            const dataInMonth = data.date.map(dateElt => dateElt >= matlabStartDate && dateElt < matlabStopDate);
            dataPerMonth.push({
                dates: data.date.filter((_, _i) => dataInMonth[_i]),
                scores: data.score.filter((_, _i) => dataInMonth[_i]),
            });
        }
        return { data: dataPerMonth, labels: monthLabels };
    }

    groupDataByBin(data, binData: { [prop: string]: number[] }) {
        const binParam: string = Object.keys(binData)[0];
        const bins: number[] = binData[binParam];
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

    // Wavedata shenanigans
    loadWavedata() {
        this.newService.getWavedataForRange({
            startDate: this.dateTimeService.objectToMatlabDate(this.fromDate),
            stopDate: this.dateTimeService.objectToMatlabDate(this.toDate),
            source: this.fieldname,
        }).subscribe(wavedata => {
            this.wavedataArray = wavedata;
            this.mergedWavedata = WavedataModel.mergeWavedataArray(wavedata);
            this.wavedataAvailabe = true;
        });
    }
    updateActiveField(source_id: string) {
        // Called whenever longterm.components selects / deselects field
        this.fieldname = source_id;
        if (source_id === '') {
            this.wavedataArray = null;
            this.mergedWavedata = null;
            this.wavedataAvailabe = false;
        } else {
            this.loadWavedata();
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

