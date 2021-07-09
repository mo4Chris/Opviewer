import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { TokenModel } from '@app/models/tokenModel';
import { ComprisonArrayElt, LongtermDataFilter, RawScatterData } from '../models/scatterInterface';
import { WavedataModel } from '@app/models/wavedataModel';
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

    RemoveFailedTransfers: LongtermDataFilter = {name: 'FailedTransferFilter', filter: (bin, hs) => hs !== 1, active: this.settings.LongtermFilterFailedTransfers};
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
            x: 'speedInTransitAvgKMH', y: 'MSI', graph: 'scatter', xLabel: 'Speed [' + this.settings.unit_speed + ']', yLabel: 'MSI % inbound', dataType: 'transitIn', info:
            'MSI averages in percent during transit versus speed. This graph displays the inbound MSI only. ',
        },
        {
            x: 'speedInTransitAvgKMH', y: 'MSI', graph: 'scatter', xLabel: 'Speed [' + this.settings.unit_speed + ']', yLabel: 'MSI % outbound', dataType: 'transitOut', info:
                'MSI averages in percent during transit versus speed. This graph displays the outbound MSI only. ',
        },
        {
            x: 'date', y: 'MSI', graph: 'scatter', xLabel: 'Time', yLabel: 'MSI % inbound', dataType: 'transitIn', info:
            'MSI averages in percent per day. This graph displays the inbound MSI only. ',
        },
        {
            x: 'date', y: 'MSI', graph: 'scatter', xLabel: 'Time', yLabel: 'MSI % outbound', dataType: 'transitOut', info:
            'MSI averages in percent per day. This graph displays the outbound MSI only. ',
        },
        {
            x: 'date', y: 'A8', graph: 'scatter', xLabel: 'Time', yLabel: 'WBV inbound', dataType: 'transitIn', info:
            'Whole Body Vibration scores per day (ISO 2631-1:1997). This graph displays the inbound WBV only. This is a figure indicating motion induced fatigue.',
            annotation: () => this.parser.drawMultipleHorizontalLines(
                [{yVal: 0.5, label:'Comfortable threshold', borderColor: 'rgb(255, 94, 19)'},
                {yVal: 1.15, label:'Unworkable threshold', borderColor: 'rgb(255, 0, 0)'}]
                ),
        },
        {
            x: 'date', y: 'A8', graph: 'scatter', xLabel: 'Time', yLabel: 'WBV outbound', dataType: 'transitOut', info:
            'Whole Body Vibration scores per day (ISO 2631-1:1997). This graph displays the outbound WBV only. This is a figure indicating motion induced fatigue.',
            annotation: () => this.parser.drawMultipleHorizontalLines(
                [{yVal: 0.5, label:'Comfortable threshold', borderColor: 'rgb(255, 94, 19)'},
                {yVal: 1.15, label:'Unworkable threshold', borderColor: 'rgb(255, 0, 0)'}]
                ),
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
            filters: [this.RemoveFailedTransfers]
        },
        {
            x: 'date', y: 'fuelUsedTotalM3', graph: 'scatter', xLabel: 'Time', yLabel: 'Daily fuel usage [L]', dataType: 'engine', info:
            'Total fuel usage per day.'
        },
        {
            x: 'date', y: 'fuelPerHourDepart', graph: 'scatter', xLabel: 'Time', yLabel: 'Fuel per hour [L/hr]', dataType: 'engine', info:
            'Average fuel usage per hour during departure. An increase in fuel usage could indicate issues with the maintainance of the vessel.'
        },
        {
            x: 'date', y: 'fuelPerHourReturn', graph: 'scatter', xLabel: 'Time', yLabel: 'Fuel per hour [L/hr]', dataType: 'engine', info:
            'Average fuel usage per hour during departure. An increase in fuel usage could indicate issues with the maintainance of the vessel.'
        }
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
        return [{ x: groupedData.labels.slice(0, largestDataBin + 1), y: groupedData.data.map(x => x.length) }];
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
            matlabStartDate = this.dateTimeService.ngbDateToMatlabDatenum(month);
            // Getting the next month
            if (month.month > 11) {
                month.year += 1;
                month.month = 1;
            } else {
                month.month += 1;
            }
            matlabStopDate = this.dateTimeService.ngbDateToMatlabDatenum(month);
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
    loadWavedata() {
        this.newService.getWavedataForRange({
            startDate: this.dateTimeService.ngbDateToMatlabDatenum(this.fromDate),
            stopDate: this.dateTimeService.ngbDateToMatlabDatenum(this.toDate),
            source: this.fieldname,
        }).subscribe(wavedata => {
            this.wavedataArray = <any> wavedata;
            this.mergedWavedata = WavedataModel.mergeWavedataArray(wavedata);
            this.wavedataAvailabe = true;
        });
    }

    // Utility
    getMatlabDateYesterday() {
        return this.dateTimeService.getMatlabDateYesterday();
    }
    getMatlabDateLastMonth() {
        return this.dateTimeService.getMatlabDatenumLastMonth();
    }
    getJSDateYesterdayYMD() {
        return this.dateTimeService.getYmdStringYesterday();
    }
    getJSDateLastMonthYMD() {
        return this.dateTimeService.getYmdStringLastMonth();
    }
    MatlabDateToJSDateYMD(serial) {
        return this.dateTimeService.matlabDatenumToYmdString(serial);
    }
    unixEpochtoMatlabDate(epochDate) {
        return this.dateTimeService.unixEpochtoMatlabDatenum(epochDate);
    }
    MatlabDateToUnixEpochViaDate(serial) {
        return this.dateTimeService.matlabDatenumToDate(serial);
    }
}

