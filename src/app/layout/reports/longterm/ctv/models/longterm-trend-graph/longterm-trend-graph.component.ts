import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ComprisonArrayElt, RawScatterData } from '../../../models/scatterInterface';
import { LongtermVesselObjectModel } from '../../../longterm.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { CommonService } from '@app/common.service';
import { catchError, map } from 'rxjs/operators';
import { LongtermProcessingService } from '../../../models/longterm-processing-service.service';
import { now } from 'moment';

@Component({
  selector: 'app-longterm-trend-graph',
  templateUrl: './longterm-trend-graph.component.html',
  styleUrls: ['./longterm-trend-graph.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongtermTrendGraphComponent implements OnChanges {

  @Input() data: ComprisonArrayElt
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselLabels: string[] = ['Placeholder A', 'Placeholder B', 'Placeholder C'];
  @Input() bins = [0,0.25,0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75,4];
  @Input() outlierThreshold = 5;

  @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

  @ViewChild('canvas') canvas: ElementRef;
  private context: CanvasRenderingContext2D;

  hasData: boolean;
  info: string;
  chart: Chart;
  axisType: any;

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private settings: SettingsService,
    private newService: CommonService,
    private parser: LongtermProcessingService,
  ) { }

  // const datasets = [];
  // args.datasets.forEach( (vesselScatterData) => {
  //   // Iterates over vessels
  //   let vesselDataSets: ScatterDataElt[] = [];
  //   const line = [{x: 0, y: 10}];
  //   const line_lb = [{x: 0, y: 10}];
  //   const line_ub = [{x: 0, y: 10}];
  //   for (let binIdx = 0; binIdx < args.bins.length - 1; binIdx++ ) {
  //     // Iterate over bins
  //     const lb = args.bins[binIdx];
  //     const ub = args.bins[binIdx + 1];
  //     let cnt = 0;
  //     const idx =  vesselScatterData.data.map((elt, __i) => {
  //           if (elt.x >= lb && elt.x < ub) {
  //             cnt ++;
  //             return true;
  //           } else {
  //             return false;
  //           }
  //         });
  //     const newDataElts = vesselScatterData.data.filter((_, _idx) => idx[_idx]);
  //     if (cnt < 5) {
  //       // Add points to scatter array
  //       vesselDataSets = vesselDataSets.concat(newDataElts);
  //     } else {
  //       const yVals = newDataElts.map(data => data.y) as number[];
  //       const mean = this.calculationService.getNanMean(yVals as number[]);
  //       const std = this.calculationService.getNanStd(yVals as number[]);
  //       const outliers = newDataElts.filter((data) => data.y < mean - 2 * std || data.y > mean + 2 * std);
  //       vesselDataSets = vesselDataSets.concat(outliers);
  //       const upperLimit = this.calculationService.getNanMax(yVals);
  //       const lowerLimit = this.calculationService.getNanMin(yVals);
  //       line.push({
  //         x: lb / 2 + ub / 2,
  //         y: mean
  //       });
  //       line_lb.push({
  //         x: lb / 2 + ub / 2,
  //         y: Math.max(lowerLimit, mean - 2 * std),
  //       });
  //       line_ub.push({
  //         x: lb / 2 + ub / 2,
  //         y: Math.min(upperLimit, mean + 2 * std),
  //       });
  //     }
  //   }
  //   vesselScatterData.data = vesselDataSets;
  //   vesselScatterData.showInLegend = true;
  //   datasets.push(vesselScatterData);
  //   if (vesselDataSets.length > 0) {
  //     datasets.push({
  //       data: line,
  //       label: vesselScatterData.label,
  //       type: 'line',
  //       showInLegend: false,
  //       fill: false,
  //       borderColor: vesselScatterData.backgroundColor,
  //       backgroundColor: vesselScatterData.backgroundColor,
  //       showLine: true,
  //       borderWidth: 5
  //     });
  //     const bbox = line_lb.concat(line_ub.reverse());
  //     bbox.push(line_lb[0]);
  //     datasets.push({
  //       data: bbox,
  //       label: vesselScatterData.label,
  //       type: 'line',
  //       showInLegend: false,
  //       showLine: true,
  //       pointRadius: 0,
  //       backgroundColor: vesselScatterData.backgroundColor.replace('1)', '0.4)'), // We need to lower opacity
  //       borderColor: vesselScatterData.backgroundColor,
  //       fill: true,
  //       borderWidth: 0,
  //       lineTension: 0.1,
  //     });
  //   }
  // });

  ngOnChanges() {
    this.context = (<HTMLCanvasElement> this.canvas.nativeElement).getContext('2d');
    if (this.chart) {
      this.reset();
    }

    this.info = this.data.info || 'N/a';
    const query = {
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: [this.data.x, this.data.y],
      x: this.data.x,
      y: this.data.y,
    }
    
    this.parser.load(query, this.data.dataType).pipe(map(
      (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData)
    ), catchError(error => {
      console.log('error: ' + error);
      throw error;
    })).subscribe(parsedData => {
      console.log(parsedData)
      this.hasData = parsedData.some(_parsed => {
        return _parsed.some(_datas => _datas.length > 1)
      })
      if (this.hasData) {
        console.log('Data found')
        const __dset = this.parser.createChartlyDset(parsedData, 'scatter', this.vesselLabels)
        this.createChart({
          axisType: this.parser.getAxisType(__dset),
          datasets: __dset,
          comparisonElt: this.data
        })
      }
    })
  }

  parseRawData(rawScatterData: RawScatterData[]) {
    return rawScatterData.map((data) => {
      console.log(this.data)
      console.log(data)
      // const scatterData: { x: number | Date, y: number | Date, callback?: Function }[] = [];
      // let x: number | Date;
      // let y: number | Date;
      // data[this.data.x].forEach((_x: number, __i: number) => {
      //   const _y = data[this.data.y][__i];
      //   x = this.parser.processData(this.data.x, _x);
      //   y = this.parser.processData(this.data.y, _y);
      //   const matlabDate = Math.floor(data.date[__i]);
      //   const navToDPRByDate = () => {
      //     return this.navigateToVesselreport.emit({ mmsi: data._id, matlabDate: matlabDate });
      //   };
      //   scatterData.push({ x: x, y: y, callback: navToDPRByDate });
      // });
      // return scatterData;
      
      let vesselDataSets: ScatterDataElt[] = [];
      const line = [{x: 0, y: 10}];
      const line_lb = [{x: 0, y: 10}];
      const line_ub = [{x: 0, y: 10}];
      for (let binIdx = 0; binIdx < this.bins.length - 1; binIdx++ ) {
        // Iterate over bins
        const lb = this.bins[binIdx];
        const ub = this.bins[binIdx + 1];
        let cnt = 0;
        const idx =  data[this.data.x].map((elt, __i) => {
          if (elt >= lb && elt < ub) {
            cnt ++;
            return true;
          } else {
            return false;
          }
        });
        console.log('Lb: ' + lb + ', ub: ' + ub + ', cnt: ' + cnt)
        const xVals = data[this.data.x].filter((_, _idx) => idx[_idx]) as number[];
        const yVals = data[this.data.y].filter((_, _idx) => idx[_idx]) as number[];
        if (cnt < this.outlierThreshold) {
          // Add points to scatter array
          vesselDataSets = vesselDataSets.concat(xVals.map((x, i) => {
            return {
              x: x,
              y: yVals[i],
            }
          }));
        } else {
          const mean = this.calcService.getNanMean(yVals as number[]);
          const std = this.calcService.getNanStd(yVals as number[]);
          const outliers = [];
          yVals.forEach((yVal, i) => {
            if (yVal <  mean - 2 * std || yVal > mean + 2 * std) {
              outliers.push({
                x: data[this.data.x][i],
                y: yVal,
              })
            }
          });
          vesselDataSets = vesselDataSets.concat(outliers);
          const upperLimit = this.calcService.getNanMax(yVals);
          const lowerLimit = this.calcService.getNanMin(yVals);
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
      // vesselScatterData.data = vesselDataSets;
      // vesselScatterData.showInLegend = true;
      return [
        line,
        line_lb,
        line_ub,
        vesselDataSets,
      ]
    });
  }

  createChart(args: ScatterArguments) {
    const dateService = this.dateService;
    const createNewLegendAndAttach = this.parser.createNewLegendAndAttach;
    this.chart = new Chart(this.context, {
      type: 'scatter',
      data: {
        datasets: args.datasets,
      },
      options: {
          title: {
          display: true,
          fontSize: 20,
          text: this.data.xLabel + ' vs ' + this.data.yLabel,
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
              const chart = this.chart;
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
          pointHoverRadius: 2,
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          scales: {
            xAxes: this.buildAxisFromType(args.comparisonElt.xLabel, 'x-axis-0'),
            yAxes: this.buildAxisFromType(args.comparisonElt.yLabel, 'y-axis-0'),
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

  buildAxisFromType(Label: String, axisId: string) {
    return [{
      id: axisId,
      ticks: {
        beginAtZero: true,
      },
      scaleLabel: {
        display: true,
        labelString: Label
      }
    }];
  }

  reset() {
    this.chart.destroy();
  }
}

interface ScatterArguments {
  axisType: { x: string, y: string };
  datasets: ScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins?: number[];
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
  x: number | Date;
  y: number | Date;
  key?: string;
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