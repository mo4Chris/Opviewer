import { TokenModel } from '@app/models/tokenModel';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as Chart from 'chart.js';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { now } from 'moment';
import { LongtermParsedWavedata } from '../../../models/longterm-processing-service.service';
import { LongtermVesselObjectModel } from '../../../longterm.component';


@Component({
    selector: 'app-deployment-graph',
    templateUrl: './deployment.component.html',
    styleUrls: ['../../longtermCTV.component.scss',
        './deployment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentGraphComponent implements OnInit, OnChanges {
    constructor(
        private newService: CommonService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        private ref: ChangeDetectorRef,
    ) {
    }

    @Input() vesselObject: LongtermVesselObjectModel;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Input() wavedata: LongtermParsedWavedata;
    @Input() vesselLabels: string[] = [];
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    Chart: Chart;
    Colors = {
        hasSailedGoodWeather: 'green',
        hasSailedBadWeather: 'orange',
        notSailedGoodWeather: 'red',
        notSailedBadWeather: 'black',
        noWeatherData: 'gray',
    };
    RawData: RawGeneralModel[][];
    SailingHoursPerDay: number[][];
    MinContinuousWorkingHours = 4;
    WorkdayStartTimeHours = 8;
    WorkdayStopTimeHours = 18;
    MaxAllowedHsMeter = 1.5;

    ngOnInit() {
        this.updateChart();
    }

    ngOnChanges() {
        this.updateChart();
        this.ref.detectChanges();
    }

    checkGoodSailingDay(dayNum: number): WeatherInfo {
        // Tests if a vessel should have sailed on given day
        let relHs: number[] = [];
        const startTime = dayNum + this.WorkdayStartTimeHours / 24;
        const stopTime  = dayNum + this.WorkdayStopTimeHours / 24;
        this.wavedata.timeStamp.forEach((T, _i) => {
            if (T >= startTime && T <= stopTime) {
                relHs.push(this.wavedata.Hs[_i]);
            }
        });
        relHs = this.filterNaNs(relHs);
        const dataFreqHour = Math.max(3, relHs.length / (this.WorkdayStopTimeHours - this.WorkdayStartTimeHours)); // At least once per 20 mns
        const minPeriod = dataFreqHour * this.MinContinuousWorkingHours;

        let goodSailingDay = false;
        let hasWeatherData = false;
        let isContinuous = false;
        let streakSize = 0;
        let maxStreakSize = 0;
        if (relHs.length > minPeriod) {
            hasWeatherData = true;
            relHs.forEach((val, _i) => {
                if (val <= this.MaxAllowedHsMeter) {
                    if (isContinuous) {
                        streakSize ++;
                        if (streakSize >= minPeriod) {
                            goodSailingDay = true;
                        }
                    } else {
                        if (streakSize > maxStreakSize) {
                            maxStreakSize = streakSize;
                        }
                        streakSize = 1;
                        isContinuous = true;
                    }
                } else {
                    isContinuous = false;
                }
            });
        } else {
            goodSailingDay = false;
        }
        maxStreakSize = Math.max(maxStreakSize, streakSize);
        return {hasWeatherData: hasWeatherData, goodWeather: goodSailingDay, maxStablePeriod: maxStreakSize / dataFreqHour};
    }

    getWavedataAtTimestamp(matlabTimestamp: number) {
        // Return wavedata at timeStamp
        let index: number;
        let firstMatch: number;
        const hasMatch = this.wavedata.timeStamp.some((time, _i)  => {
            if (time >= matlabTimestamp) {
                index = _i;
                firstMatch = time;
                return true;
            } else {
                return false;
            }
        });
        if (hasMatch && firstMatch - matlabTimestamp < 1 / 24) {
            return {
                timeStamp: firstMatch,
                Hs: this.calculationService.roundNumber(this.wavedata.Hs[index], 100),
                Tp: this.calculationService.roundNumber(this.wavedata.Tp[index], 100),
            };
        } else {
            return {
                timeStamp: 'N/a',
                Hs: 'N/a',
                Tp: 'N/a'
            };
        }
    }

    navigateToDPR(navItem: {mmsi: number, matlabDate: number}) {
        this.navigateToVesselreport.emit(navItem);
    }

    getWavedataAtIndex(index: number) {
        return this.getWavedataAtTimestamp(this.vesselObject.dateMin + index + 0.5);
    }

    updateHsLimit() {
        const htmlField = <HTMLInputElement> document.getElementById('wavelimit-input');
        if (+htmlField.value > 0) {
            this.MaxAllowedHsMeter = +htmlField.value / 100;
            this.updateChart();
        }
    }

    updateChart() {
        this.getChartData((sailingHoursPerDay: number[][]) => {
            const matlabDates = this.calculationService.linspace(this.vesselObject.dateMin, this.vesselObject.dateMax);
            const dateLabels = matlabDates.map((daynum: number) => {
                return this.dateTimeService.MatlabDateToUnixEpochViaDate(daynum);
            });
            const goodSailingDays = matlabDates.map(date => this.checkGoodSailingDay(date));
            const dsets = {
                labels: dateLabels,
                datasets: [],
            };
            dsets.datasets.push({
                label: 'Hs',
                type: 'line',
                data: this.wavedata.Hs.map((elt, _idx) => {
                    return {x: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.wavedata.timeStamp[_idx]), y: elt};
                }),
                showLine: true,
                pointRadius: 0,
                pointHitRadius: 0,
                fill: false,
                xAxisID: 'x-axis-time',
                yAxisID: 'Hs',
                borderColor: 'rgb(0, 51, 204)',
                backgroundColor: 'rgb(0, 51, 204)',
            });
            // This beauty detects the presence of good / bad weather
            sailingHoursPerDay.forEach((sailingHours, _i) => {
                // Looping over vessels
                if (sailingHours) {
                    const dset = {
                        label: this.vesselLabels[_i] || 'N/a',
                        backgroundColor: [],
                        data: [],
                        weatherInfo: goodSailingDays,
                        hidden: _i !== 0,
                        xAxisID: 'x-axis-0',
                        yAxisID: 'y-axis-0',
                        callback: (index: number) => {
                            this.navigateToDPR({
                                mmsi: this.vesselObject.mmsi[_i],
                                matlabDate: matlabDates[index],
                            });
                        }
                    };
                    sailingHours.forEach((hour, _j) => {
                        // Looping over dates
                        const localWeatherInfo = goodSailingDays[_j] || {hasWeatherData: false};
                        if (hour > 0) {
                            dset.data.push(hour);
                            if (localWeatherInfo.hasWeatherData === false) {
                                dset.backgroundColor.push(this.Colors.noWeatherData);
                            } else if (localWeatherInfo.goodWeather) {
                                dset.backgroundColor.push(this.Colors.hasSailedGoodWeather);
                            } else {
                                dset.backgroundColor.push(this.Colors.hasSailedBadWeather);
                            }
                        } else {
                            dset.data.push(8);
                            if (localWeatherInfo.hasWeatherData === false) {
                                dset.backgroundColor.push(this.Colors.noWeatherData);
                            } else if (localWeatherInfo.goodWeather) {
                                dset.backgroundColor.push(this.Colors.notSailedGoodWeather);
                            } else {
                                dset.backgroundColor.push(this.Colors.notSailedBadWeather);
                            }
                        }
                    });
                    dsets.datasets.push(dset);
                }
            });
            if (this.Chart) {
                // Update the chart
                this.Chart.data = dsets;
                this.Chart.scales['x-axis-time'].options.time.min = dateLabels[0];
                this.Chart.scales['x-axis-time'].options.time.max = dateLabels[-1];
                this.Chart.update();
            } else {
                this.constructNewChart(dsets);
            }
        });
    }

    getChartData(cb: (data: number[][]) => void) {
        this.newService.getGeneralForRange({
            vesselType: 'CTV',
            mmsi: this.vesselObject.mmsi,
            startDate: this.vesselObject.dateMin,
            stopDate: this.vesselObject.dateMax,
            projection: {
                _id: 0,
                minutesFloating: 1,
                minutesInField: 1,
                date: 1,
                mmsi: 1,
            }
        }).subscribe((rawdata: RawGeneralModel[][]) => {
            this.RawData = rawdata.map(_raw => this.appendMissingDates(_raw));
            this.SailingHoursPerDay = this.RawData.map(rawvesseldata => {
                return this.parseRawData(rawvesseldata);
            });
            if (cb) {
                cb(this.SailingHoursPerDay);
            }
        });
    }

    parseRawData(rawData: RawGeneralModel[]) {
        const dailySailingHours: number[] = rawData.map((genStat, _i) => {
            if (genStat.vesselname !== '') {
                return genStat.minutesFloating / 60 + genStat.minutesInField / 60;
            } else {
                return null;
            }
        });
        return dailySailingHours;
    }

    appendMissingDates(raw: RawGeneralModel[]) {
        const appendedRaw = [];
        const noData = (dnum: number) => {return {
            date: dnum,
            vesselname: '',
            minutesFloating: 0,
            minutesInField: 0,
        }; };
        for (let dnum = this.vesselObject.dateMin; dnum <= this.vesselObject.dateMax; dnum++) {
            appendedRaw.push(raw.reduce((prev, curr) => {
                if (curr.date === dnum) {
                    return curr;
                }
                return prev;
            }, noData(dnum)));
        }
        return appendedRaw;
    }

    filterNaNs(Arr: any[] ) {
        return Arr.filter(elt => {
            return !isNaN(elt) && elt !== '_NaN_';
        });
    }

    constructNewChart(
        dsets: any,
    ) {
        const cleanCodeDefaultNumberOfHoursAVesselIsToldToHaveBeenSailingIfItReallyDidNotSail = 8;
        const dateService = this.dateTimeService;
        const getWavedata = (index) => this.getWavedataAtIndex(index);
        const vesselDidSail = (tooltipItem, data) => {
            return tooltipItem.yLabel !== cleanCodeDefaultNumberOfHoursAVesselIsToldToHaveBeenSailingIfItReallyDidNotSail;
        };
        const getSailingWindowLength = (tooltipItem, data) => {
            const info: WeatherInfo = data.datasets[tooltipItem.datasetIndex].weatherInfo[tooltipItem.index];
            if (info && info.hasWeatherData) {
                return +Math.round(info.maxStablePeriod * 100) / 100 + ' hours';
            } else {
                return 'N/a';
            }
        };

        this.Chart = new Chart('deploymentGraph', {
            type: 'bar',
            data: dsets,
            options: {
                title: {
                    display: true,
                    text: 'Vessel activity chart',
                    fontSize: 20,
                    position: 'top'
                },
                tooltips: {
                    filter: function (tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].xAxisID === 'x-axis-0';
                    },
                    callbacks: {
                        beforeLabel: function (tooltipItem, data) {
                            const curr_date: Date = data.labels[tooltipItem.index];
                            const curr_date_string = curr_date ? dateService.jsDateToDMYString(curr_date) : 'N/a';
                            return [
                                data.datasets[tooltipItem.datasetIndex].label,
                                curr_date_string
                            ];
                        },
                        label: function (tooltipItem, data) {
                            if (vesselDidSail(tooltipItem, data)) {
                                return 'Sailed: ' + Math.round(tooltipItem.yLabel * 100) / 100 + ' hours';
                            } else {
                                return 'Did not sail';
                            }
                        },
                        afterLabel: function (tooltipItem, data) {
                            const waveParams = getWavedata(tooltipItem.index);
                                return [waveParams.Hs !== 'N/a' ? 'Hs: ' + waveParams.Hs + ' m' : 'Hs: N/a',
                                'Max stable period: ' + getSailingWindowLength(tooltipItem, data)
                            ];
                        },
                        title: function (tooltipItem, data) {
                            // Prevents a bug from showing up in the bar chart tooltip
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    xAxes: [{
                        id: 'x-axis-0',
                        stacked: true,
                        display: false,
                        min: 0,
                    }, {
                        id: 'x-axis-time',
                        type: 'time',
                        display: true,
                        beginAtZero: false,
                        time: {
                            unit: 'day',
                            min: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin),
                            max: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax),
                        },
                        ticks: {
                            min: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin),
                            max: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax),
                        }
                    }],
                    yAxes: [{
                        id: 'y-axis-0',
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of sailing hours',
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }, {
                        id: 'Hs',
                        scaleLabel: {
                          display: true,
                          labelString: 'Hs (m)'
                        },
                        ticks: {
                          min: 0,
                          max: 3,
                        },
                        position: 'right',
                        display: true,
                      }],
                },
                annotation: {
                    events: ['mouseover', 'mouseout', 'dblclick', 'click'],
                },
                onClick: function (clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
                    if (this.lastClick !== undefined && now() - this.lastClick < 300) {
                        // Two clicks < 300ms ==> double click
                        if (chartElt.length > 0) {
                            chartElt = chartElt[chartElt.length - 1];
                            const dataElt = chartElt._chart.data.datasets[chartElt._datasetIndex];
                            if (dataElt.callback !== undefined) {
                                dataElt.callback(chartElt._index);
                            }
                        }
                    }
                    this.lastClick = now();
                }
            }
        });
    }
}

interface RawGeneralModel {
    date: number;
    mmsi: number;
    vesselname: string;
    minutesInField: number;
    minutesFloating: number;
}

interface WeatherInfo {
    hasWeatherData: boolean;
    goodWeather: boolean;
    maxStablePeriod: number;
}
