import * as Chart from 'chart.js';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';


export class ScatterplotComponent {
  constructor(
    vesselObject: {mmsi: number[], dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string},
    comparisonArray,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService
    ) {
      console.log('Scatterplot constructor triggered!');
      this.vesselObject = vesselObject;
      this.comparisonArray = comparisonArray;
    }

  backgroundcolors = [
    'rgba(255,0,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0, 255, 255 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255,255,0,1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,0.4)'
  ];
  bordercolors = [
    'rgba(255,0,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0, 255, 255 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,99,132,1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255,255,0,1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,1)'
  ];
  pointStyles = [
    'circle',
    'cross',
    'rect',
    'triangle',
    'crossRot',
    'star',
    'RectRounded',
    'dash',
  ];

  scatterData;
  scatterDataArray = [];
  scatterDataArrayVessel = [];

  labelValues = [];
  datasetValues = [];
  varAnn = { annotations: [] };
  defaultVesselName = '';
  graphXLabels = { scales: {} };
  public scatterChartLegend = false;
  vesselObject: {mmsi: number[], dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string};
  comparisonArray: {x: String, y: String, graph: String, xLabel: String, yLabel: String}[];

  myChart: Chart[] = [];

  createValues() {
    this.datasetValues = [];
    for (let j = 0; j < this.scatterDataArrayVessel.length; j++) {
      this.datasetValues[j] = [];
      for (let i = 0; i < this.scatterDataArrayVessel[j].length; i++) {
        this.datasetValues[j].push({
          data: this.scatterDataArrayVessel[j][i],
          label: this.labelValues[i],
          pointStyle: this.pointStyles[i],
          backgroundColor: this.backgroundcolors[i],
          radius: 6,
          borderColor: this.bordercolors[i],
          pointHoverRadius: 10,
          borderWidth: 1,
          hitRadius: 10,
        });
      }
    }
    if (this.myChart[0] == null) {
      this.createScatterChart();
    } else {
      this.myChart.forEach((chart) => chart.destroy());
      if (this.scatterDataArrayVessel[0].length > 0) {
        this.createScatterChart();
      }
    }
  }

  createTimeLabels(timeElt: number) {
    if (timeElt !== null && typeof timeElt !== 'object') {
      return this.MatlabDateToUnixEpochViaDate(timeElt);
    } else {
      return NaN;
    }
  }

  createScatterChart() {
    const dateService = this.dateTimeService;
    for (let _j = 0; _j < this.comparisonArray.length; _j++) {
      if (this.scatterDataArrayVessel[_j] && this.scatterDataArrayVessel[_j].length > 0) {
        this.myChart[_j] = new Chart('canvas' + _j, {
          type: this.comparisonArray[_j].graph,
          data: {
            datasets: this.datasetValues[_j]
          },
          options: {
            tooltips: {
              callbacks: {
                beforeLabel: function (tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label;
                },
                label: function (tooltipItem, data) {
                  return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                },
                afterLabel: function(tooltipItem, data) {
                  return 'Value: ' + Math.round(tooltipItem.yLabel * 100) / 100;
                }
              }
            },
            scaleShowVerticalLines: false,
            responsive: true,
            radius: 2,
            legend: {
              display: true,
              labels: {
                defaultFontSize: 24,
                defaultFontStyle: 'bold'
              }
            },
            pointHoverRadius: 2,
            animation: {
              duration: 0,
            },
            hover: {
              animationDuration: 0,
            },
            responsiveAnimationDuration: 0,
            scales: {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.comparisonArray[_j].xLabel
                },
                type: 'time',
                time: {
                  min: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin).getTime()),
                  max: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax + 1).getTime()),
                  unit: 'day'
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.comparisonArray[_j].yLabel
                }
              }]
            },
            annotation: this.varAnn,
          },
          plugins: [
            {
              beforeInit: function (chartInstance) {
                const legendOpts = chartInstance.options.legend;
                if (legendOpts) {
                  createNewLegendAndAttach(chartInstance, legendOpts);
                }
              },
              beforeUpdate: function (chartInstance) {
                let legendOpts = chartInstance.options.legend;

                if (legendOpts) {
                  legendOpts = Chart.helpers.configMerge(Chart.defaults.global.legend, legendOpts);

                  if (chartInstance.newLegend) {
                    chartInstance.newLegend.options = legendOpts;
                  } else {
                    createNewLegendAndAttach(chartInstance, legendOpts);
                  }
                } else {
                  Chart.layoutService.removeBox(chartInstance, chartInstance.newLegend);
                  delete chartInstance.newLegend;
                }
              },
              afterEvent: function (chartInstance, e) {
                const legend = chartInstance.newLegend;
                if (legend) {
                  legend.handleEvent(e);
                }
              }
            }
          ],
        });
        console.log(this.myChart[_j])
      }
    }
  }

  // Date support functions
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
} // End of class


// Getting the legend in the right position
Chart.NewLegend = Chart.Legend.extend({
  afterFit: function () {
    this.height = this.height + 10;
  },
});

function createNewLegendAndAttach(chartInstance, legendOpts) {
  const legend = new Chart.NewLegend({
    ctx: chartInstance.chart.ctx,
    options: legendOpts,
    chart: chartInstance
  });
  if (chartInstance.legend) {
    Chart.layoutService.removeBox(chartInstance, chartInstance.legend);
    delete chartInstance.newLegend;
  }
  chartInstance.newLegend = legend;
  Chart.layoutService.addBox(chartInstance, legend);
}
