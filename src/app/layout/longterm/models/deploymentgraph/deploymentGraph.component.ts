import { TokenModel } from '../../../../models/tokenModel';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../../common.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import * as Chart from 'chart.js';
import { routerTransition } from '../../../../router.animations';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { now } from 'moment';


@Component({
    selector: 'app-deployment-graph',
    templateUrl: './deployment.component.html',
    styleUrls: ['../../ctv/longtermCTV.component.scss',
        './deployment.component.scss']
})
export class DeploymentGraphComponent implements OnInit {
    constructor(
        private newService: CommonService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
    ) {
    }

    @Input() vesselObject: { dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[] };
    @Input() tokenInfo: TokenModel;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    @Input() wavedata: {
        timeStamp: any[],
        Hs: number[],
        Tp: any[],
        waveDir: any[],
        wind: any[],
        windDir: any[]
    };
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    Chart: Chart;
    Colors = {
        hasSailedGoodWeather: 'green',
        hasSailedBadWeather: 'orange',
        notSailedGoodWeather: 'red',
        notSailedBadWeather: 'black',
        noWeatherData: 'gray',
    };
    RawTransitData: RawTransitDataModel[];
    SailingHoursPerDay: number[][];
    MinContinuousWorkingHours = 4;
    WorkdayStartTimeHours = 8;
    WorkdayStopTimeHours = 18;
    MaxAllowedHsMeter = 1.5;

    ngOnInit() {
        this.updateChart();
    }

    checkGoodSailingDay(dayNum: number): boolean {
        // Tests if a vessel should have sailed on given day
        const relHs: number[] = [];
        const startTime = dayNum + this.WorkdayStartTimeHours / 24;
        const stopTime  = dayNum + this.WorkdayStopTimeHours / 24;
        this.wavedata.timeStamp.forEach((T, _i) => {
            if (T >= startTime && T <= stopTime) {
                relHs.push(this.wavedata.Hs[_i]);
            }
        });
        const dataFreqHour = Math.max(3, relHs.length / (this.WorkdayStopTimeHours - this.WorkdayStartTimeHours)); // At least once per 20 mns
        const minPeriod = dataFreqHour * this.MinContinuousWorkingHours;

        let goodSailingDay = false;
        let isContinuous = false;
        let streakSize = 0;
        if (relHs.length > minPeriod) {
            relHs.forEach((val, _i) => {
                if (val <= this.MaxAllowedHsMeter) {
                    if (isContinuous) {
                        streakSize ++;
                        if (streakSize === minPeriod) {
                            goodSailingDay = true;
                        }
                    } else {
                        streakSize = 1;
                        isContinuous = true;
                    }
                } else {
                    isContinuous = false;
                }
            });
        } else {
            goodSailingDay = undefined;
        }
        return goodSailingDay;
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
        this.MaxAllowedHsMeter = +htmlField.value / 100;
        this.updateChart();
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
                if (this.RawTransitData[_i] && this.RawTransitData[_i].label && this.RawTransitData[_i].label.length >= 1) {
                    const dset = {
                        label: this.RawTransitData[_i].label[0],
                        backgroundColor: [],
                        data: [],
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
                        if (hour > 0) {
                            dset.data.push(hour);
                            if (goodSailingDays[_j] === undefined) {
                                dset.backgroundColor.push(this.Colors.noWeatherData);
                            }if (goodSailingDays[_j]) {
                                dset.backgroundColor.push(this.Colors.hasSailedGoodWeather);
                            } else {
                                dset.backgroundColor.push(this.Colors.hasSailedBadWeather);
                            }
                        } else {
                            dset.data.push(8);
                            if (goodSailingDays[_j] === undefined) {
                                dset.backgroundColor.push(this.Colors.noWeatherData);
                            } else if (goodSailingDays[_j]) {
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
                this.Chart.update();
            } else {
                this.constructNewChart(dsets);
            }
        });
    }

    getChartData(cb: (data: number[][]) => void) {
        this.newService.getTransitsForVesselByRange({
            mmsi: this.vesselObject.mmsi,
            dateMin: this.vesselObject.dateMin,
            dateMax: this.vesselObject.dateMax,
            reqFields: ['date', 'startTime', 'transitTimeMinutes']
        }).subscribe((rawdata: RawTransitDataModel[]) => {
            this.RawTransitData = rawdata;
            this.SailingHoursPerDay = rawdata.map(rawvesseldata => {
                return this.parseRawData(rawvesseldata);
            });
            if (cb) {
                cb(this.SailingHoursPerDay);
            }
        });
    }

    parseRawData(rawTransitData: RawTransitDataModel) {
        const dailySailingHours: number[] = [];
        const startTimes = rawTransitData.date.map((date, _i) => {
            return rawTransitData.startTime[_i];
        });
        const stopTimes = rawTransitData.date.map((date, _i) => {
            return rawTransitData.startTime[_i] + rawTransitData.transitTimeMinutes[_i] / 60 / 24;
        });
        for (let day = this.vesselObject.dateMin; day <= this.vesselObject.dateMax; day++) {
            const startTime: number[] = [];
            const stopTime: number[] = [];
            rawTransitData.date.forEach((transitdate, _i) => {
                if (transitdate === day) {
                    startTime.push(startTimes[_i]);
                    stopTime.push(stopTimes[_i]);
                }
            });
            if (startTime.length === 0) {
                dailySailingHours.push(0);
            } else {
                const minStartTime = this.calculationService.getNanMin(startTime);
                const maxStartTime = this.calculationService.getNanMax(stopTime);
                dailySailingHours.push((maxStartTime - minStartTime) * 24);
            }
        }
        return dailySailingHours;
    }

    constructNewChart(
        dsets: any,
    ) {
        const dateService = this.dateTimeService;
        const getWavedata = (index) => this.getWavedataAtIndex(index);
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
                            return data.datasets[tooltipItem.datasetIndex].label;
                        },
                        label: function (tooltipItem, data) {
                            const curr_date: Date = data.labels[tooltipItem.index];
                            return dateService.jsDateToDMYString(curr_date);
                        },
                        afterLabel: function (tooltipItem, data) {
                            const waveParams = getWavedata(tooltipItem.index);
                            return ['Hours: ' + Math.round(tooltipItem.yLabel * 100) / 100,
                                'Hs: ' + waveParams.Hs + ' m'
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
                    }, {
                        id: 'x-axis-time',
                        type: 'time',
                        display: true,
                        beginAtZero: false
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
                onClick: function(clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
                  if (this.lastClick !== undefined && now() - this.lastClick < 300) {
                    // Two clicks < 300ms ==> double click
                    if (chartElt.length > 0) {
                      chartElt = chartElt[chartElt.length ];
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

interface RawTransitDataModel {
    date: number[];
    label: string[];
    startTime: number[];
    transitTimeMinutes: number[];
}
