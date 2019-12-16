import * as Chart from 'chart.js';
import { Moment } from 'moment';
import { CalculationService } from '../../../supportModules/calculation.service';
import * as moment from 'moment';
import { SettingsService } from '../../../supportModules/settings.service';
import { Injectable, NgModule, Optional, Inject, InjectionToken, Component } from '@angular/core';

@Component({
    providers: [CalculationService, SettingsService]
})
export class WeatherOverviewChart {
static weatherChartColors = [
  'rgba(0, 100, 255 , 1)',
  'rgba(255,0,0,1)',
  'rgba(0,155,0,1)',
  'rgba(255, 159, 64, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(255,255,0,1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(0,0,0,0.4)'
];

Chart: Chart;

constructor(
    args: WeatherChartArguments,
    private calcService: CalculationService,
    private settings: SettingsService,
) {
    console.log(this)
    args = {... {wavedataSourceName: 'Source: unknown'}, ...args};
    // Support function for chart legend padding
    Chart.Tooltip.positioners.custom = function (elements, position) {
        const item = this._data.datasets;
        elements = elements.filter(function (value, _i) {
            return item[value._datasetIndex].yAxisID !== 'hidden';
        });
        let x_mean = 0;
        elements.forEach(elt => {
            x_mean += elt._model.x;
        });
        x_mean = x_mean / elements.length;
        let y_mean = 0;
        elements.forEach(elt => {
            y_mean += elt._model.y;
        });
        y_mean = y_mean / elements.length;
        return {
            x: x_mean,
            y: y_mean
        };
    };

    // Fixing dset units
    const dsets = this.sortByAxisID(args.dsets);
    dsets.forEach((dset, _i) => {
        if (dset.unit) {
            dset = this.changeUnitsForDset(dset);
        }
        if (dset.yAxisID === undefined) {
            dset.yAxisID = 'hidden';
        }
        if (dset.yAxisID !== 'hidden') {
            dset.backgroundColor = WeatherOverviewChart.weatherChartColors[_i];
            dset.borderColor = WeatherOverviewChart.weatherChartColors[_i];
            if (_i > 0) {
                dset.hidden = dset.label !== 'windGust';
            }
        }
    });
    const timezonOffset = this.getTimezoneOffset(dsets);

    // Actual chart creation
    this.Chart = new Chart('weatherOverview', {
        type: 'line',
        data: {
            datasets: dsets,
        },
        options: {
            title: {
                display: args.wavedataSourceName !== '',
                position: 'right',
                text: args.wavedataSourceName,
                fontSize: 15,
                padding: 5,
                fontStyle: 'normal',
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            hover: {
                animationDuration: 0
            },
            responsiveAnimationDuration: 0,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Local time'
                    },
                    type: 'time',
                    time: {
                        min: args.timeStamps[0],
                        max: args.timeStamps[args.timeStamps.length - 1],
                        unit: 'hour',
                        displayFormats: 'HH:mm',
                    },
                    ticks: {
                        callback: (value, index, values) => {
                            if (!values[index]) {
                                return;
                            }
                            return moment.utc(values[index]['value']).utcOffset(timezonOffset).format('HH:mm');
                        }
                    },
                }],
                yAxes: [{
                    id: 'Wind',
                    display: 'auto',
                    scaleLabel: {
                        display: true,
                        labelString: 'Wind speed (' + this.Unit.Wind + ')',
                    },
                    ticks: {
                        type: 'linear',
                        maxTicksLimit: 7,
                        suggestedMin: 0,
                    },
                },
                {
                    id: 'Hs',
                    display: 'auto',
                    suggestedMax: 2,
                    beginAtZero: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Wave height (' + this.Unit.Hs + ')',
                    },
                    ticks: {
                        type: 'linear',
                        maxTicksLimit: 7,
                        suggestedMin: 0,
                    }
                },
                {
                    id: 'Tp',
                    display: 'auto',
                    scaleLabel: {
                        display: true,
                        labelString: 'Tp (' + this.Unit.Tp + ')',
                    },
                    ticks: {
                        type: 'linear',
                        maxTicksLimit: 7,
                    },
                },
                {
                    id: 'waveDir',
                    display: 'auto',
                    scaleLabel: {
                        display: true,
                        labelString: 'Direction (' + this.Unit.Direction + ')',
                    },
                    ticks: {
                        type: 'linear',
                        min: 0,
                        max: 360,
                        stepSize: 60,
                    },
                }, {
                    id: 'hidden',
                    display: false,
                    ticks: {
                        type: 'linear',
                        maxTicksLimit: 7,
                        min: 0,
                        suggestedMax: 1
                    },
                }]
            },
            tooltips: {
                position: 'custom',
                callbacks: {
                    label: function (tooltipItem, data) {
                        const dset = data.datasets[tooltipItem.datasetIndex];
                        let label = dset.label || '';
                        if (label) {
                            label += ': ';
                            label += Math.round(dset.data[tooltipItem.index].y * 10) / 10;
                        }
                        return label;
                    },
                },
                mode: 'index',
                filter: function (tooltip, data) {
                    return data.datasets[tooltip.datasetIndex].yAxisID !== 'hidden';
                },
            }
        }
    });
}

// ToDO replace this by a call to the user defaults stored in his token
Unit = {
    Hs: 'm',
    Tp: 's',
    Direction: 'deg',
    Wind: this.settings.unit_speed,
};

getTimezoneOffset(dsets: any[]): number {
    // Returns the offset in minutes
    return 0;
}

changeUnits(axisName: string, newUnit: string) {
    // ToDo: here be the callback handle
}

destroy() {
    if (this.Chart) {
        this.Chart.destroy();
    }
}

private changeUnitsForDset(dset, newUnit?: string) {
    if (dset.unit && dset.yAxisID !== 'hidden') {
        if (newUnit === undefined) {
            newUnit = this.getUnitByAxisId(dset.yAxisID);
        }
        const newY = this.calcService.switchUnits(dset.data.map((elt: Chart.ChartPoint) => elt.y), dset.unit, newUnit);
        dset.data.forEach((elt, _i) => {
            elt.y = newY[_i];
        });
        this.Unit[dset.unit] = newUnit;
        return dset;
    } else {
        console.error('Cannot change units because current unit is not known!');
        return dset;
    }
}

getUnitByAxisId(id: string) {
    switch (id) {
        case 'Hs':
            return this.Unit.Hs;
        case 'windDir': case 'waveDir': case 'direction':
            return this.Unit.Direction;
        case 'Tp':
            return this.Unit.Tp;
        case 'Wind': case 'WindSpeed': case 'WindAvg': case 'WindGust':
            return this.Unit.Wind;
        default:
            // This may crash but is far more flexible
            return this.Unit[id];
    }
}

private sortByAxisID(dsets) {
    return dsets.sort((A, B) => {
        const valA = this.getValueForAxis(A.yAxisID);
        const valB = this.getValueForAxis(B.yAxisID);
        if (valA < valB) {
            return -1;
        } else if (valA === valB) {
            return 0;
        } else {
            return 1;
        }
    });
}

private getValueForAxis(ID: string) {
    switch (ID) {
        case 'Hs':
            return 1;
        case 'Tp':
            return 2;
        case 'Direction':
            return 3;
        case 'Wind':
            return 4;
        case 'hidden':
            return 20;
        default:
            return 10;
    }
}
}

interface WeatherChartArguments {
    dsets: any[];
    timeStamps: Moment[];
    wavedataSourceName?: string;
}
