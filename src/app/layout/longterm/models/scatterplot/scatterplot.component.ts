import * as Chart from 'chart.js';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { ComprisonArrayElt } from '../scatterInterface';


export class ScatterplotComponent {
  constructor(
    vesselObject: {mmsi: number[], dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string},
    comparisonArray: ComprisonArrayElt[],
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService
    ) {
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

  allGraphsEmpty = false;
  scatterData;
  scatterDataArray = [];
  scatterDataArrayVessel = [];

  labelValues = [];
  datasetValues = [];
  defaultVesselName = '';
  graphXLabels = { scales: {} };
  public scatterChartLegend = false;
  vesselObject: {mmsi: number[], dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string};
  comparisonArray: ComprisonArrayElt[];

  myChart: Chart[] = [];

  createValues() {
    this.allGraphsEmpty = true;
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
    this.destroyCurrentCharts();
    this.createScatterChart();
  }

  destroyCurrentCharts() {
    this.myChart.forEach(chart => chart.destroy());
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
      const axisTypes = this.getAxisType(this.datasetValues[_j]);
      if (axisTypes.x !== 'hidden' && this.scatterDataArrayVessel[_j] && this.scatterDataArrayVessel[_j].length > 0) {
        this.myChart.push(new Chart('canvas' + _j, {
          type: this.comparisonArray[_j].graph,
          data: {
            datasets: this.datasetValues[_j]
          },
          options: {
            title: {
              display: true,
              fontSize: 20,
              text: this.comparisonArray[_j].xLabel + ' vs ' + this.comparisonArray[_j].yLabel,
              position: 'top'
            },
            tooltips: {
              callbacks: {
                beforeLabel: function (tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label;
                },
                label: function (tooltipItem, data) {
                  switch (axisTypes.x) {
                    case 'date':
                     return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                    case 'numeric':
                      return 'Value: ' + Math.round(tooltipItem.xLabel * 100) / 100;
                    default:
                      return '';
                  }
                },
                afterLabel: function(tooltipItem, data) {
                  if (axisTypes.y === 'date') {
                    return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y);
                  } else {
                    return 'Value: ' + Math.round(tooltipItem.yLabel * 100) / 100;
                  }
                },
                title: function(tooltipItem, data) {
                  // Prevents a bug from showing up in the bar chart tooltip
                }
              }
            },
            scaleShowVerticalLines: false,
            responsive: true,
            maintainAspectRatio: false,
            radius: 2,
            legend: {
              display: true,
              labels: {
                defaultFontSize: 24,
                defaultFontStyle: 'bold'
              },
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
              xAxes: this.buildAxisFromType(axisTypes.x, this.comparisonArray[_j].xLabel, this.comparisonArray[_j].graph, 'x-axis-0'),
              yAxes: this.buildAxisFromType(axisTypes.y, this.comparisonArray[_j].yLabel, this.comparisonArray[_j].graph, 'y-axis-0'),
            },
            annotation: {
              events: ['mouseover', 'mouseout'],
              annotations: this.setAnnotations(this.comparisonArray[_j])
            },
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
        }));
        const hmtlElt = document.getElementById('hideIfNoData' + _j);
        hmtlElt.setAttribute('style', 'normal');
      } else {
        const hmtlElt = document.getElementById('hideIfNoData' + _j);
        hmtlElt.setAttribute('style', 'display: none');
      }
    }
  }

  getAxisType(dataArrays) {
    const type = {x: 'hidden', y: 'hidden'};
    dataArrays.some((dataArray) => {
      return dataArray.data.some((dataElt: {x: any, y: any}) => {
        if (typeof dataElt.x === 'string' && dataElt.x !== '_NaN_') {
          type.x = 'label';
          type.y = 'numeric';
        } else if (!(isNaN(dataElt.x) || isNaN(dataElt.y))) {
          if (typeof dataElt.x === 'number') {
            type.x = 'numeric';
          } else {
            type.x = 'date';
          }
          if (typeof dataElt.y === 'number') {
            type.y = 'numeric';
          } else {
            type.y = 'date';
          }
          return true;
        } else {
          return false;
        }
      });
    });
    if (type.x !== 'hidden' && type.y !== 'hidden') {
      this.allGraphsEmpty = false;
    }
    return type;
  }

  buildAxisFromType(Type: String, Label: String, chartType: String, chartID: string) {
    switch (chartType) {
      case 'scatter':
        switch (Type) {
          case 'date':
            return [{
              id: chartID,
              scaleLabel: {
                display: true,
                labelString: Label
              },
              type: 'time',
              time: {
                min: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin).getTime()),
                max: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax + 1).getTime()),
                unit: 'day'
              }
            }];
          case 'label':
            return [{
              id: chartID,
              scaleLabel: {
                display: true,
                labelString: Label
              }
            }];
          case 'numeric':
            return [{
              id: chartID,
              scaleLabel: {
                display: true,
                labelString: Label
              }
            }];
        }
        break;

      case 'bar':
        switch (Type) {
          case 'date':
            return [{
              id: chartID,
              scaleLabel: {
                display: true,
                labelString: Label
              }
            }];
          case 'label':
            return [{
              id: chartID,
              minBarLength: 1600,
              maxBarThickness: 80,
            }];
          case 'numeric':
            return [{
              id: chartID,
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: Label
              }
            }];
        }
        break;
    }
  }

  setAnnotations(compElt: ComprisonArrayElt) {
    if (compElt.annotation === undefined) {
       return [];
    } else {
      return [compElt.annotation()];
    }
  }

  drawHorizontalLine(yVal: number, label?: string) {
    return {
      passive: false,
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y-axis-0',
      value: 1.0001 * yVal, // we add small number to make graphs auto-scale above the line
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 3,
      label: {
        position: 'left',
        xAdjust: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        fontColor: '#fff',
        enabled: true,
        content: label
      },
      // These events appear to be broken due to bug in annotions module
      // onMouseover: function (e) {
      //   console.log('Mouse enter event')
      //   const annot = this;
      //   console.log(annot)
      //   annot.options.borderWidth = 7;
      //   annot.options.label.enabled = true;
      //   annot.chartInstance.update();
      //   annot.chartInstance.chart.canvas.style.cursor = 'pointer';
      // },
      // onMouseout: function (e) {
      //   console.log('Mouse leave event')
      //   const annot = this;
      //   console.log(annot)
      //   annot.options.label.enabled = false;
      //   annot.chartInstance.update();
      //   annot.chartInstance.chart.canvas.style.cursor = 'pointer';
      // }
    };
  }

  getPeakValue(graphNumber: number, filterActive: boolean = true) {
    // Not yet used
    const graphInfo = this.myChart[graphNumber];
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
