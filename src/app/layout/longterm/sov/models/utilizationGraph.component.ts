import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../common.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { TokenModel } from '../../../../models/tokenModel';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { now } from 'moment';
import { ScatterplotComponent } from '../../models/scatterplot/scatterplot.component';


@Component({
    selector: 'app-utilization-graph',
    templateUrl: './utilizationGraph.component.html',
    styleUrls: ['../longtermSOV.component.scss',
        './utilizationGraph.component.scss']
})
export class UtilizationGraphComponent implements OnInit {
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
    @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

    Chart: Chart;
    RawData: RawGeneralModel[][];
    TimeBreakdown: TimeBreakdown[][];

    breakdownKeys = ['hoursOfCTVops', 'hoursSailing', 'hoursWaiting'];
    breakdownKeysNiceName = ['CTV operations', 'Sailing', 'Waiting'];
    backgroundcolors = [
       'rgba(255,0,0,1)',
       'rgba(0,155,0,1)',
       'rgba(0, 100, 255 , 1)',
       'rgba(255, 159, 64, 1)',
       'rgba(255, 99, 132, 1)',
       'rgba(75, 192, 192, 1)',
       'rgba(255,255,0,1)',
       'rgba(153, 102, 255, 1)',
       'rgba(255, 206, 86, 1)',
       'rgba(0,0,0,0.4)'
     ];

    ngOnInit() {
        this.updateChart();
    }

    updateChart() {
        this.getChartData((TimeBreakdowns: TimeBreakdown[][]) => {
            const matlabDates = this.calculationService.linspace(this.vesselObject.dateMin, this.vesselObject.dateMax);
            const dateLabels = matlabDates.map((daynum: number) => {
                return this.dateTimeService.MatlabDateToUnixEpochViaDate(daynum);
            });
            const dsets = {
                labels: dateLabels,
                datasets: [],
            };
            TimeBreakdowns.forEach((_TimeBreakdown, _i) => {
                // Looping over vessels
                const vesselname = this.RawData[_i][0].vesselName;
                const vColor = this.backgroundcolors[_i];
                if (this.RawData[_i] && this.RawData[_i][0]) {
                    this.breakdownKeys.forEach((breakdownKey, _j) => {
                        const dset = {
                            label: vesselname,
                            data: [],
                            stack: vesselname,
                            showInLegend: _j === 0,
                            xAxisID: 'x-axis-0',
                            yAxisID: 'y-axis-0',
                            backgroundColor: vColor.replace('1)', (3 - _j) / 3 + ')'),
                            callback: (index: number) => {
                                this.navigateToDPR({
                                    mmsi: this.vesselObject.mmsi[_i],
                                    matlabDate: matlabDates[index],
                                });
                            }
                        };
                        _TimeBreakdown.forEach((dailyBreakdown, _j) => {
                            if (dailyBreakdown[breakdownKey]) {
                                dset.data.push(dailyBreakdown[breakdownKey]);
                            } else {
                                dset.data.push(0);
                            }
                        });
                        dsets.datasets.push(dset);
                    });
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

    navigateToDPR(navItem: {mmsi: number, matlabDate: number}) {
        this.navigateToVesselreport.emit(navItem);
    }

    getChartData(cb: (data: TimeBreakdown[][]) => void) {
        this.newService.getGeneralForRange({
            vesselType: 'SOV',
            mmsi: this.vesselObject.mmsi,
            startDate: this.vesselObject.dateMin,
            stopDate: this.vesselObject.dateMax,
            projection: {
                _id: 0,
                date: 1,
                mmsi: 1,
                vesselName: 1,
                timeBreakdown: 1,
            }
        }).subscribe((rawdata: RawGeneralModel[][]) => {
            this.RawData = rawdata;
            this.TimeBreakdown = rawdata.map(rawvesseldata => {
                return this.parseRawData(rawvesseldata);
            });
            if (cb) {
                cb(this.TimeBreakdown);
            }
        });
    }

    parseRawData(rawData: RawGeneralModel[]): TimeBreakdown[] {
        return rawData.map(genStat => genStat.timeBreakdown);
    }

    filterNaNs(Arr: any[] ) {
        return Arr.filter(elt => {
            return !isNaN(elt) && elt !== '_NaN_';
        });
    }

    constructNewChart(
        dsets: any,
    ) {
        const calcService = this.calculationService;
        const niceNames = this.breakdownKeysNiceName;
        this.Chart = new Chart('utilizationGraph', {
            type: 'bar',
            data: dsets,
            options: {
                title: {
                    display: true,
                    text: 'Vessel utilization chart',
                    fontSize: 20,
                    position: 'top'
                },
                tooltips: {
                    filter: function (tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].xAxisID === 'x-axis-0';
                    },
                    callbacks: {
                        beforeLabel: function (tooltipItem, data) {
                            return [
                                data.datasets[tooltipItem.datasetIndex].stack,
                            ];
                        },
                        label: function (tooltipItem, data) {
                            const info = [];
                            data.datasets.forEach((dset, _i) => {
                                info.push(niceNames[_i] + ': ' + calcService.GetDecimalValueForNumber(dset.data[tooltipItem.index], ' hours'));
                            });
                            return info;
                        },
                        labelColor: function (tooltipItem, chart) {
                            const bg_color = chart.data.datasets[0].backgroundColor;
                            return {
                                borderColor: bg_color,
                                backgroundColor: bg_color,
                            };
                        },
                        title: function (tooltipItem, data) {
                            // Prevents a bug from showing up in the bar chart tooltip
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                legend: {
                  display: true,
                  labels: {
                    defaultFontSize: 24,
                    defaultFontStyle: 'bold',
                    filter: (legItem, chart) => {
                      return chart.datasets[legItem.datasetIndex].showInLegend;
                    }
                  },
                  onClick: (event: MouseEvent, legItem) => {
                    const Key = legItem.text;
                    const _dsets = this.Chart.config.data.datasets;
                    _dsets.forEach(dset => {
                      const metaKey = Object.keys(dset._meta)[0];
                      if (dset.label === Key && dset._meta[metaKey]) {
                        dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
                      }
                    });
                    this.Chart.update();
                  }
                },
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
                            labelString: 'Number of hours',
                        },
                        ticks: {
                            beginAtZero: true,
                            max: 24,
                        }
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
    vesselName: string;
    timeBreakdown: TimeBreakdown;
}

interface TimeBreakdown {
    hoursOfCTVops: number;
    hoursSailing: number;
    hoursWaiting: number;
}
