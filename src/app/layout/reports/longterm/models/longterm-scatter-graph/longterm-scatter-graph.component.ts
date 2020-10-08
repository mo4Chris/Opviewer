import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ComprisonArrayElt, RawScatterData } from '../scatterInterface';
import { LongtermVesselObjectModel } from '../../longterm.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { CommonService } from '@app/common.service';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { LongtermProcessingService, LongtermScatterValueArray, LongtermParsedWavedata } from '../longterm-processing-service.service';

@Component({
  selector: 'app-longterm-scatter-graph',
  templateUrl: './longterm-scatter-graph.component.html',
  styleUrls: ['./longterm-scatter-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongtermScatterGraphComponent implements OnChanges {
  @Input() data: ComprisonArrayElt
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselLabels: string[] = ['Label A', 'Label B', 'Label C'];
  @Input() wavedata: LongtermParsedWavedata;
  @Input() vesselType: 'CTV' | 'SOV' | 'OSV' = 'CTV';

  @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

  @ViewChild('canvas') canvas: ElementRef;
  private context: CanvasRenderingContext2D;

  hasData: boolean;
  info: string;
  chart: Chart;
  axisType: any;

  constructor(
    private dateService: DatetimeService,
    private parser: LongtermProcessingService,
    private ref: ChangeDetectorRef,
  ) {
  }

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
    
    this.parser.load(query, this.data.dataType,  this.vesselType).pipe(map(
      (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData)
    ), catchError(error => {
      console.log('error: ' + error);
      throw error;
    })).subscribe(parsedData => {
      const dsets = parsedData.map((_data, _i) =>
        this.parser.createChartlyScatter(_data, _i, {label: this.vesselLabels[_i]})
      );
      this.hasData = dsets.some(_dset => _dset.data.length > 0);
      if (this.hasData) {
        this.createChart({
          axisType: this.parser.getAxisType(dsets),
          datasets: dsets,
          comparisonElt: this.data
        });
        if (this.wavedata) {
          this.addWavedata();
        }
      }
      this.ref.detectChanges();
    })
  }

  addWavedata() {
    const timeStamps = this.wavedata.timeStamp.map(timeStamp => {
        return this.parser.createTimeLabels(timeStamp);
    });
    const dset = {
      label: 'Hs',
      data: this.wavedata.Hs.map((elt, _idx) => {
          return { x: timeStamps[_idx], y: elt };
      }),
      showLine: true,
      pointRadius: 0,
      fill: false,
      yAxisID: 'Hs',
      borderColor: 'rgb(0, 0, 0, 0.5);',
      backgroundColor: 'rgb(0, 0, 0, 0.5);',
    };
    const axis_x = this.chart.scales['x-axis-0'];
    if (axis_x.type === 'time' && true) {
      this.chart.scales['Hs'].options.display = true;
      this.chart.data.datasets.push(dset);
      this.chart.update();
    }
  }

  parseRawData(rawScatterData: RawScatterData[]) {
    this.reduceLabels(rawScatterData.map(_data => _data._id));
    return rawScatterData.map((data) => {
      const scatterData: { x: number | Date, y: number | Date, callback?: Function }[] = [];
      let x: number | Date;
      let y: number | Date;
      data[this.data.x].forEach((_x: number, __i: number) => {
        const _y = data[this.data.y][__i];
        x = this.parser.processData(this.data.x, _x);
        y = this.parser.processData(this.data.y, _y);
        const matlabDate = Math.floor(data.date[__i]);
        const navToDPRByDate = () => {
          return this.navigateToVesselreport.emit({ mmsi: data._id, matlabDate: matlabDate });
        };
        scatterData.push({ x: x, y: y, callback: navToDPRByDate });
      });
      return scatterData;
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
            afterLabel: function (tooltipItem, data) {
              if (args.axisType.y === 'date') {
                return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y);
              } else {
                return 'Value: ' + Math.round(tooltipItem.yLabel * 100) / 100;
              }
            },
            title: function (tooltipItem, data) {
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
          xAxes: this.buildAxisFromType(args.axisType.x, args.comparisonElt.xLabel, 'x-axis-0'),
          yAxes: this.buildAxisFromType(args.axisType.y, args.comparisonElt.yLabel, 'y-axis-0'),
        },
        annotation: {
          events: ['mouseover', 'mouseout', 'dblclick', 'click'],
          annotations: this.parser.setAnnotations(args.comparisonElt)
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
          }
        }
      ],
    });
  }

  buildAxisFromType(Type: String, Label: String, axisId: string) {
    switch (Type) {
      case 'date':
        return [{
          id: axisId,
          scaleLabel: {
            display: true,
            labelString: Label
          },
          type: 'time',
          time: {
            unit: 'day'
          },
          ticks: {
            min: this.parser.parseScatterDate(this.vesselObject.dateMin),
            max: this.parser.parseScatterDate(this.vesselObject.dateMax + 1),
          }
        }];
      case 'label':
        return [{
          id: axisId,
          scaleLabel: {
            display: true,
            labelString: Label
          }
        }];
      case 'numeric':
        return [{
          id: axisId,
          scaleLabel: {
            display: true,
            labelString: Label
          },
          ticks: {
            suggestedMin: 0
          }
        }, {
          id: 'Hs',
          scaleLabel: {
            display: true,
            labelString: 'Hs (m)'
          },
          ticks: {
            min: 0,
            suggestedMax: 3,
          },
          display: false,
        }];
    }
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
}