import * as Chart from 'chart.js';
import { Moment } from 'moment';

export class WeatherOverviewChart {
static weatherChartColors = [
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

Chart: any;
constructor(
    dsets: any[],
    timeStamps: Moment[],
    wavedataSourceName: string = 'Source: unknown',
) {
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
    this.Chart = new Chart('weatherOverview', {
        type: 'line',
        data: {
            datasets: dsets,
        },
        options: {
            title: {
                display: wavedataSourceName !== '',
                position: 'right',
                text: wavedataSourceName,
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
                        min: timeStamps[0],
                        max: timeStamps[72],
                        unit: 'hour'
                    }
                }],
                yAxes: [{
                    id: 'Wind',
                    display: 'auto',
                    scaleLabel: {
                        display: true,
                        labelString: 'Wind speed (m/s)'
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
                        labelString: 'Hs (m)'
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
                        labelString: 'Tp (s)'
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
                        labelString: 'Direction (deg)'
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
    console.log(this.Chart)
    return this.Chart;
}
}
