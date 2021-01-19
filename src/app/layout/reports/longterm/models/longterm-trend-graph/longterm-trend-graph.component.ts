import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ComprisonArrayElt, RawScatterData } from '../scatterInterface';
import { LongtermVesselObjectModel } from '@longterm/longterm.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { catchError, map } from 'rxjs/operators';
import { LongtermProcessingService, LongtermScatterValueArray } from '../longterm-processing-service.service';
import { LongtermDataFilter } from '../scatterInterface';

@Component({
  selector: 'app-longterm-trend-graph',
  templateUrl: './longterm-trend-graph.component.html',
  styleUrls: ['./longterm-trend-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongtermTrendGraphComponent implements OnChanges {
  @Input() data: ComprisonArrayElt;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselLabels: string[] = ['Placeholder A', 'Placeholder B', 'Placeholder C'];
  @Input() bins = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];
  @Input() outlierThreshold = 5;
  @Input() vesselType: 'CTV' | 'SOV' | 'OSV' = 'CTV';
  @Input() showHiddenAsOutlier = true;
  @Input() filters: LongtermDataFilter[] = [];

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
    private parser: LongtermProcessingService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnChanges() {
    this.context = (<HTMLCanvasElement> this.canvas.nativeElement).getContext('2d');
    if (this.chart) {
      this.reset();
    }
    if (this.filters === undefined) {
      this.filters = [];
    }

    this.info = this.data.info || 'N/a';
    const query = {
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: [this.data.x, this.data.y],
      x: this.data.x,
      y: this.data.y,
    };

    this.parser.load(query, this.data.dataType, this.vesselType).pipe(map(
      (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData)
    ), catchError(error => {
      console.log('error: ' + error);
      throw error;
    })).subscribe(parsedData => {
      this.hasData = parsedData.some(_parsed => {
        return _parsed.trend.length > 1 || _parsed.outliers.length > 0;
      });
      if (this.hasData) {
        const dsets = [];
        parsedData.forEach((vesseldata, i) => {
          dsets.push(this.parser.createChartlyLine(vesseldata.trend, i, {label: this.vesselLabels[i], borderWidth: 3, pointRadius: 3, pointStyle: 'fill', pointHoverRadius: 6, hitRadius: 10}));
          dsets.push(this.parser.createChartlyLine(vesseldata.ub, i, {label: this.vesselLabels[i], fill: '+1'})); // Fills area until lower bound
          dsets.push(this.parser.createChartlyLine(vesseldata.lb, i, {label: this.vesselLabels[i]}));
          dsets.push(this.parser.createChartlyScatter(vesseldata.outliers, i, {label: this.vesselLabels[i]}));
        });
        this.createChart({
          axisType: this.parser.getAxisType(dsets),
          datasets: dsets,
          comparisonElt: this.data
        });
      }
      this.ref.detectChanges();
    });
  }

  parseRawData(rawScatterData: RawScatterData[]) {
    const navToDpr = (info: {mmsi: number, matlabDate: number}) => {
      this.navigateToVesselreport.emit(info);
    };
    this.reduceLabels(rawScatterData.map(_data => _data._id));
    return rawScatterData.map((data) => {
      let vesselDataSets: ScatterDataElt[] = [];
      const line = [{x: 0, y: 10}];
      const line_lb = [{x: 0, y: 10}];
      const line_ub = [{x: 0, y: 10}];
      for (let binIdx = 0; binIdx < this.bins.length - 1; binIdx++ ) {
        // Iterate over bins
        const lb = this.bins[binIdx];
        const ub = this.bins[binIdx + 1];
        let cnt = 0;
        const idx: boolean[] = data[this.data.x].map((elt, __i) => {
          if (elt >= lb && elt < ub) {
            cnt ++;
            return true;
          } else {
            return false;
          }
        });
        let xVals = data[this.data.x].filter((_, _idx) => idx[_idx]) as number[];
        let yVals = data[this.data.y].filter((_, _idx) => idx[_idx]) as number[];
        let dates = data.date.filter((_, _idx) => idx[_idx]) as number[];

        const keep = this.applyFilters(xVals, yVals, data._id);
        xVals = xVals.filter((_, i) => keep[i]);
        yVals = yVals.filter((_, i) => keep[i]);
        dates = dates.filter((_, i) => keep[i]);

        if (cnt < this.outlierThreshold) {
          // Add points to scatter array
          vesselDataSets = vesselDataSets.concat(xVals.map((x, i) => {
            return {
              x: x,
              y: yVals[i],
              date: dates[i],
              callback: () => navToDpr({mmsi: data._id, matlabDate: Math.floor(dates[i])}),
            };
          }));
        } else {
          const mean = this.calcService.getNanMean(yVals as number[]);
          const std = this.calcService.getNanStd(yVals as number[]);
          const outliers: ScatterDataElt[] = [];
          yVals.forEach((yVal, i) => {
            if (yVal <  mean - 2 * std || yVal > mean + 2 * std) {
              outliers.push({
                x: xVals[i],
                y: yVal,
                callback: () => navToDpr({mmsi: data._id, matlabDate: Math.floor(dates[i])}),
                date: dates[i],
              });
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
      line_lb.push(line_ub[line_ub.length - 1]);
      return {
        trend: line,
        lb: line_lb,
        ub: line_ub,
        outliers: vesselDataSets,
      };
    });
  }

  applyFilters(xVals: number[], yVals: number[], mmsi: number): boolean[] {
    const keep: boolean[] = xVals.map(_ => true);
    this.filters.forEach(filter => {
      if (filter.active || filter.active === undefined) {
        xVals.forEach((x, i) => {
          if (keep[i]) {
            const y = yVals[i];
            keep[i] = filter.filter(x, y, mmsi);
          }
        });
      }
    });
    return keep;
  }

  createChart(args: ScatterArguments) {
    const dateService = this.dateService;
    const createNewLegendAndAttach = this.parser.createNewLegendAndAttach;
    const xLabel = this.data.xLabel;
    const yLabel = this.data.yLabel;
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
                const elt = data.datasets[tooltipItem.datasetIndex];
                const date = elt.data[tooltipItem.index].date;
                return date ? [
                  elt.label,
                  dateService.MatlabDateToJSDate(date)
                ] : elt.label;
              },
              label: function (tooltipItem, data) {
                return xLabel + ': ' + Math.round(tooltipItem.xLabel * 100) / 100;
              },
              afterLabel: function(tooltipItem, data) {
                return yLabel + ': ' + Math.round(tooltipItem.yLabel * 100) / 100;
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
          onClick: this.parser.defaultClickHandler
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

  reduceLabels(received_mmsi: number[]): void {
    this.vesselLabels = this.parser.reduceLabels(this.vesselObject, received_mmsi);
  }
}

interface ScatterArguments {
  axisType: { x: string, y: string };
  datasets: LongtermScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins?: number[];
}

interface ScatterDataElt {
  x: number | Date;
  y: number | Date;
  key?: string;
  callback?: Function;
  date?: number;
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


