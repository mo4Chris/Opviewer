import * as Chart from 'chart.js';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { ComprisonArrayElt } from '../scatterInterface';
import { Duration, Moment, now } from 'moment';
import { CompileDirectiveMetadata } from '@angular/compiler';


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
  bordercolors = [
    'rgba(255,0,0,1)',
    'rgba(0,155,0,1)',
    'rgba(0, 100, 255 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,99,132,1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255,255,0,1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(0,0,0,1)'
  ];
  pointStyles = [
    'circle',
    'rect',
    'triangle',
    'star',
    'crossRot',
    'cross',
    'dash',
    'RectRounded',
  ];
  borderWidth = [1, 1, 1, 1, 3, 3, 4, 1];

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
          data: this.filterNans(this.scatterDataArrayVessel[j][i], this.comparisonArray[j]),
          label: this.labelValues[i],
          pointStyle: this.pointStyles[i],
          backgroundColor: i < this.backgroundcolors.length ? this.backgroundcolors[i] : 'rgba(0,0,0,0.3)',
          borderColor: this.bordercolors[i],
          radius: 4,
          pointHoverRadius: 10,
          borderWidth: this.borderWidth[i],
          hitRadius: 10,
        } as ScatterValueArray);
      }
    }
    this.destroyCurrentCharts();
    this.parseChartArray();
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

  parseChartArray() {
    for (let _j = 0; _j < this.comparisonArray.length; _j++) {
      const axisTypes = this.getAxisType(this.datasetValues[_j]);
      const graph: string  = this.comparisonArray[_j].graph;
      if ((axisTypes.x !== 'hidden' || graph === 'bar') && this.scatterDataArrayVessel[_j] && this.scatterDataArrayVessel[_j].length > 0) {
        const args: ScatterArguments = {
          comparisonElt: this.comparisonArray[_j],
          datasets: this.datasetValues[_j],
          graphIndex: _j,
          axisType: axisTypes,
          bins: this.calculationService.linspace(0, 2, 0.2),
        };
        switch (graph) {
          case 'bar':
            this.myChart[_j] = this.createBarChart(args);
            break;
          case 'scatter':
            this.myChart[_j] = this.createScatterChart(args);
            break;
          case 'areaScatter':
            this.myChart[_j] = this.createAreaScatter(args);
            break;
          default:
            console.error('Invalid graph type used!');
        }
        const hmtlElt = document.getElementById('hideIfNoData' + _j);
        hmtlElt.setAttribute('style', 'normal');
      } else {
        const hmtlElt = document.getElementById('hideIfNoData' + _j);
        hmtlElt.setAttribute('style', 'display: none');
      }
    }
  }

  createScatterChart(args: ScatterArguments) {
    const dateService = this.dateTimeService;
    return new Chart('canvas' + args.graphIndex, {
      type: args.comparisonElt.graph,
      data: {
        datasets: args.datasets,
      },
      options: {
        title: {
          display: true,
          fontSize: 20,
          text: args.comparisonElt.xLabel + ' vs ' + args.comparisonElt.yLabel,
          position: 'top'
        },
        tooltips: {
          callbacks: {
            beforeLabel: function (tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label;
            },
            label: function (tooltipItem, data) {
              switch (args.axisType.x) {
                case 'date':
                 return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                case 'numeric':
                  return 'Value: ' + Math.round(tooltipItem.xLabel * 100) / 100;
                default:
                  return '';
              }
            },
            afterLabel: function(tooltipItem, data) {
              if (args.axisType.y === 'date') {
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
          xAxes: this.buildAxisFromType(args.axisType.x, args.comparisonElt.xLabel, args.comparisonElt.graph, 'x-axis-0'),
          yAxes: this.buildAxisFromType(args.axisType.y, args.comparisonElt.yLabel, args.comparisonElt.graph, 'y-axis-0'),
        },
        annotation: {
          events: ['mouseover', 'mouseout', 'dblclick', 'click'],
          annotations: this.setAnnotations(args.comparisonElt)
        },
        onClick: function(clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
          if (this.lastClick !== undefined && now() - this.lastClick < 300) {
            // Two clicks < 300ms ==> double click
            if (chartElt.length > 0) {
              chartElt = chartElt[0];
              const dataElt = chartElt._chart.data.datasets[chartElt._datasetIndex].data[chartElt._index];
              if (dataElt.callback !== undefined) {
                dataElt.callback();
              }
            }
          }
          this.lastClick = now();
      }
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
  }

  createBarChart(args: ScatterArguments) {
    const labelLength =  args.datasets.map((dset: {data}) => dset.data[0].x.length);
    let largestLabelLength = 0;
    const largestDataBin = labelLength.reduce((prev, curr, _i) => {
      if (curr > largestLabelLength) {
        largestLabelLength = curr;
        return _i;
      } else {
        return prev;
      }
    }, 0);
    const barLabels = args.datasets[largestDataBin].data[0].x; // string[]
    const dataSets = [];
    args.datasets.forEach(vesseldata => {
      vesseldata.data.forEach((stackdata, _i) => {
        dataSets.push({
          label: vesseldata.label,
          data: stackdata.y,
          stack: vesseldata.label,
          showInLegend: _i === 0,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,1)',
          backgroundColor: vesseldata.backgroundColor.replace('1)', 1 / (1 + _i) + ')'),
        });
      });
    });
    return new Chart('canvas' + args.graphIndex, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: dataSets,
      },
      options: {
        title: {
          display: true,
          fontSize: 20,
          text: args.comparisonElt.yLabel,
          position: 'top'
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          labels: {
            defaultFontSize: 24,
            defaultFontStyle: 'bold',
            filter: (legItem: LegendEntryCallbackElement, chart) => {
              return chart.datasets[legItem.datasetIndex].showInLegend;
            }
          },
          onClick: (event: MouseEvent, legItem: LegendEntryCallbackElement) => {
            const Key = legItem.text;
            const chart = this.myChart[args.graphIndex];
            const dsets = chart.config.data.datasets;
            dsets.forEach(dset => {
              const metaKey = Object.keys(dset._meta)[0];
              if (dset.label === Key && dset._meta[metaKey]) {
                dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
              }
            });
            chart.update();
          }
        },
        scales: {
          xAxes: [{
            id: 'x-axis-0',
            stacked: true
          }],
          yAxes: [{
            id: 'y-axis-0',
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: args.comparisonElt.yLabel,
            },
            ticks: {
              beginAtZero: true
          }
          }],
        },
        responsiveAnimationDuration: 0,
      },
    });
  }

  public createAreaScatter(args: ScatterArguments) {
    const dateService = this.dateTimeService;
    const datasets = [];
    args.datasets.forEach( (vesselScatterData) => {
      // Iterates over vessels
      let vesselDataSets: ScatterDataElt[] = [];
      const line = [{x: 0, y: 10}];
      const line_lb = [{x: 0, y: 10}];
      const line_ub = [{x: 0, y: 10}];
      for (let binIdx = 0; binIdx < args.bins.length - 1; binIdx++ ) {
        // Iterate over bins
        const lb = args.bins[binIdx];
        const ub = args.bins[binIdx + 1];
        let cnt = 0;
        const idx =  vesselScatterData.data.map((elt, __i) => {
              if (elt.x >= lb && elt.x < ub) {
                cnt ++;
                return true;
              } else {
                return false;
              }
            });
        const newDataElts = vesselScatterData.data.filter((_, _idx) => idx[_idx]);
        if (cnt < 5) {
          // Add points to scatter array
          vesselDataSets = vesselDataSets.concat(newDataElts);
        } else {
          const yVals = newDataElts.map(data => data.y) as number[];
          const mean = this.calculationService.getNanMean(yVals as number[]);
          const std = this.calculationService.getNanStd(yVals as number[]);
          const outliers = newDataElts.filter((data) => data.y < mean - 2 * std || data.y > mean + 2 * std);
          vesselDataSets = vesselDataSets.concat(outliers);
          const upperLimit = this.calculationService.getNanMax(yVals);
          const lowerLimit = this.calculationService.getNanMin(yVals);
          line.push({
            x: lb / 2 + ub / 2,
            y: mean
          });
          line_lb.push({
            x: lb / 2 + ub / 2,
            y: Math.max(lowerLimit, mean - 2 * std),
          });
          line_ub.push({
            x: lb / 2 + ub / 2,
            y: Math.min(upperLimit, mean + 2 * std),
          });
        }
      }
      vesselScatterData.data = vesselDataSets;
      vesselScatterData.showInLegend = true;
      datasets.push(vesselScatterData);
      datasets.push({
        data: line,
        label: vesselScatterData.label,
        type: 'line',
        showInLegend: false,
        fill: false,
        borderColor: vesselScatterData.backgroundColor,
        backgroundColor: vesselScatterData.backgroundColor,
        showLine: true,
        borderWidth: 5
      });
      const bbox = line_lb.concat(line_ub.reverse());
      bbox.push(line_lb[0]);
      datasets.push({
        data: bbox,
        label: vesselScatterData.label,
        type: 'line',
        showInLegend: false,
        showLine: true,
        pointRadius: 0,
        backgroundColor: vesselScatterData.backgroundColor.replace('1)', '0.4)'), // We need to lower opacity
        borderColor: vesselScatterData.backgroundColor,
        fill: true,
        borderWidth: 0,
        lineTension: 0.1,
      });
    });
    // Iterate over args.datasets and separately add the line and scatter components
    return new Chart('canvas' + args.graphIndex, {
        type: 'scatter',
        data: {
          datasets
        },
        options: {
            title: {
            display: true,
            fontSize: 20,
            text: args.comparisonElt.xLabel + ' vs ' + args.comparisonElt.yLabel,
            position: 'top'
            },
            tooltips: {
              callbacks: {
                beforeLabel: function (tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label;
                },
                label: function (tooltipItem, data) {
                  switch (args.axisType.x) {
                    case 'date':
                     return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                    case 'numeric':
                      return 'Value: ' + Math.round(tooltipItem.xLabel * 100) / 100;
                    default:
                      return '';
                  }
                },
                afterLabel: function(tooltipItem, data) {
                  if (args.axisType.y === 'date') {
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
            legend: {
              display: true,
              labels: {
                defaultFontSize: 24,
                defaultFontStyle: 'bold',
                filter: (legItem: LegendEntryCallbackElement, chart) => {
                  return chart.datasets[legItem.datasetIndex].showInLegend;
                }
              },
              onClick: (event: MouseEvent, legItem: LegendEntryCallbackElement) => {
                const Key = legItem.text;
                const chart = this.myChart[args.graphIndex];
                const dsets = chart.config.data.datasets;
                console.log(dsets)
                dsets.forEach(dset => {
                  const metaKey = Object.keys(dset._meta)[0];
                  if (dset.label === Key && dset._meta[metaKey]) {
                    dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
                  }
                });
                chart.update();
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
              xAxes: this.buildAxisFromType(args.axisType.x, args.comparisonElt.xLabel, args.comparisonElt.graph, 'x-axis-0'),
              yAxes: this.buildAxisFromType(args.axisType.y, args.comparisonElt.yLabel, args.comparisonElt.graph, 'y-axis-0'),
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
            },
          }
        ]
    });
  }

  getAxisType(dataArrays) {
    const type = {x: 'hidden', y: 'hidden'};
    dataArrays.some((dataArray: {data: {x: any, y: any}[]}) => {
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
      case 'areaScatter':
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
      }
    };
  }

  getPeakValue(graphNumber: number, filterActive: boolean = true) {
    // Not yet used
    const graphInfo = this.myChart[graphNumber];
  }

  filterNans(rawData: ScatterDataElt[], type: ComprisonArrayElt) {
    if (type.graph === 'bar') {
      return rawData;
    } else {
      return rawData.filter(data => !(isNaN(data.x as number) || isNaN(data.y as number) || data.y === 0));
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

interface ScatterArguments {
  axisType: {x: string, y: string};
  graphIndex: number;
  datasets: ScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins ?: number[];
}

interface ScatterValueArray {
  data: ScatterDataElt[];
  label: string;
  pointStyle: string;
  backgroundColor: string;
  borderColor: string;
  radius: number;
  pointHoverRadius: number;
  borderWidth: number;
  hitRadius: number;
  showInLegend?: boolean;
}

interface ScatterDataElt {
  x: number|Date;
  y: number|Date;
  callback?: Function;
}

interface LegendEntryCallbackElement {
  // Number of dataset
  datasetIndex: number;
  // Label that will be displayed
  text: string;
  // Fill style of the legend box
  fillStyle: any;
  // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
  hidden: boolean;
  // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
  lineCap: string;
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
  lineDash: number[];
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
  lineDashOffset: number;
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
  lineJoin: string;
  // Width of box border
  lineWidth: number;
  // Stroke style of the legend box
  strokeStyle: any;
  // Point style of the legend box (only used if usePointStyle is true)
  pointStyle: string;
}
