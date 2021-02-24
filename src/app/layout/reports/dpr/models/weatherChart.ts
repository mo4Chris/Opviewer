import * as Chart from 'chart.js';
import * as moment from 'moment-timezone';
import { Moment } from 'moment';
import { CalculationService } from '@app/supportModules/calculation.service';
import { SettingsService } from '@app/supportModules/settings.service';

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
  Unit = {
    Hs: 'm',
    Tp: 's',
    Direction: 'deg',
    Wind: this.settings.unit_speed,
  };

  Chart: Chart;
  private timeLabel: string;

  constructor(
    args: WeatherChartArguments,
    private calcService: CalculationService,
    private settings: SettingsService,
    private id?: HTMLElement
  ) {
    args = { ... { wavedataSourceName: 'Source: unknown' }, ...args };
    // Support function for chart legend padding
    Chart.Tooltip.positioners.custom = ChartLegendPositioner;
    this.timeLabel = args.utcOffset ? 'Time (UTC +' + args.utcOffset + ')' : 'Time';

    // Fixing dset units
    const dsets = this.sortByAxisID(args.dsets);
    dsets.forEach((dset, _i) => {
      if (dset.unit == null) dset = this.changeUnitsForDset(dset);
      if (dset.yAxisID == null) dset.yAxisID = 'hidden';
      if (dset.yAxisID !== 'hidden') {
        dset.backgroundColor = WeatherOverviewChart.weatherChartColors[_i];
        dset.borderColor = WeatherOverviewChart.weatherChartColors[_i];
      }
      dset.hidden = this.getDsetHidden(dset.label);
    });
    console.log(dsets)

    const yAxes = this.initAxes();
    console.log('yAxes', yAxes)
    console.log(dsets)

    const timezoneOffset = this.getTimezoneOffset(dsets);
    // Actual chart creation
    this.Chart = new Chart(this.id ?? 'weatherOverview', {
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
        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.timeLabel
            },
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: 'HH:mm',
            },
            ticks: {
              min: args.timeStamps[0],
              max: args.timeStamps[args.timeStamps.length - 1],
              callback: (value, index, values) => {
                if (!values[index]) return;
                return moment.utc(values[index]['value']).utcOffset(timezoneOffset).format('HH:mm');
              }
            },
          }],
          yAxes: yAxes,
        },
        tooltips: {
          position: 'custom',
          callbacks: {
            label: this.onLabel,
            title: this.onTitle,
          },
          mode: 'index',
          filter: (tooltip, data) => data.datasets[tooltip.datasetIndex].yAxisID !== 'hidden',
        },
        legend: {
          onClick: (mouseEvent: MouseEvent, legendItem) => {
            const index = legendItem.datasetIndex;
            const ci = this.Chart;
            console.log(this)
            const meta = ci.getDatasetMeta(index);
            // See controller.isDatasetVisible comment
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
            // Store which graphs are enabled
            const key = ci.data.datasets[index].label;
            this.settings.weatherChart[key] = meta.hidden;
            // We hid a dataset ... rerender the chart
            ci.update();
          }
        }
      }
    });
  }

  getTimezoneOffset(dsets: any[]): number {
    // Returns the offset in minutes
    // ToDo: properly implement the timezone check
    // console.warn('Timezone offset to be implemented')
    return 0;
  }
  destroy() {
    if (this.Chart) {
      this.Chart.destroy();
    }
  }

  private changeUnitsForDset(dset, newUnit?: string) {
    if (!dset.unit || dset.yAxisID == 'hidden') {
      console.error(`Cannot change units because current unit ${dset.unit} is not known!`);
      return dset;
    }
    if (newUnit == null) newUnit = this.getUnitByAxisId(dset.yAxisID); 
    const newY = this.calcService.switchUnits(dset.data.map((elt: Chart.ChartPoint) => elt.y), dset.unit, newUnit);
    dset.data.forEach((elt, _i) => {
      elt.y = newY[_i];
    });
    this.Unit[dset.unit] = newUnit;
    return dset;
  }
  private getUnitByAxisId(id: string) {
    switch (id) {
      case 'Hs': case 'Hmax':
        return this.Unit.Hs;
      case 'windDir': case 'waveDir': case 'direction':
        return this.Unit.Direction;
      case 'Tp': case 'Tz': case 'T0':
        return this.Unit.Tp;
      case 'Wind': case 'WindSpeed': case 'WindAvg': case 'WindGust':
        return this.Unit.Wind;
      default:
        // This may crash but is far more flexible
        return this.Unit[id] || '';
    }
  }
  private sortByAxisID(dsets): any[] {
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
      case 'Hs': case 'Hmax':
        return 1;
      case 'Tp': case 'Tz': case 'T0':
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
  private getDsetHidden(label: string) {
    if (label === undefined) {
      return true;
    } else {
      const current = this.settings.weatherChart[label];
      if (current === undefined) {
        return true;
      } else {
        return current;
      }
    }
  }

  private initAxes(): ChartAxis[] {
    return [{
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
        suggestedMax: 20.0,
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
        suggestedMax: 1.0,
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
        min: 0,
        max: 1
      },
    }]
  }
 
  private onTitle(tooltipItem, data) {
    const xlabel = tooltipItem[0].xLabel;
    const _mom = moment.utc(xlabel).format('HH:mm');
    return _mom;
  }
  private onLabel(tooltipItem, data) {
    const dset = data.datasets[tooltipItem.datasetIndex];
    let label = dset.label || '';
    if (label) {
      label += ': ';
      label += Math.round(dset.data[tooltipItem.index].y * 10) / 10;
    }
    return label;
  }
}

function ChartLegendPositioner(elements, position) {
  const item = this._data.datasets;
  elements = elements.filter(function (value, _i) {
    return item[value._datasetIndex].yAxisID !== 'hidden';
  });
  let x_mean = mean(elements.map(e => e._model.x));
  let y_mean = mean(elements.map(e => e._model.y));
  return {
    x: x_mean,
    y: y_mean
  };
};

function mean(elements: number[]) {
  let meanValue = 0;
  elements.forEach(elt => {
    meanValue += elt
  });
  return meanValue / elements.length;
}

interface WeatherChartArguments {
  dsets: any[];
  timeStamps: string[]; // This must be string because moment crashes when using moment-timezone
  wavedataSourceName?: string;
  utcOffset?: number;
}

interface ChartAxis {
  id: string
  display: any
  suggestedMax?: number,
  beginAtZero?: boolean,
  scaleLabel?: any
  ticks: any, 
}