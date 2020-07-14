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
import { LongtermProcessingService, LongtermScatterValueArray } from '../longterm-processing-service.service';
import { now } from 'moment';

@Component({
  selector: 'app-longterm-bar-graph',
  templateUrl: './longterm-bar-graph.component.html',
  styleUrls: ['./longterm-bar-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongtermBarGraphComponent implements OnChanges {

  constructor(
    private parser: LongtermProcessingService,
    public calculationService: CalculationService, // Used in callbacks!
    private ref: ChangeDetectorRef,
  ) { }
  @Input() data: ComprisonArrayElt;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselLabels: string[] = ['Placeholder A', 'Placeholder B', 'Placeholder C'];
  @Input() vesselType: 'CTV' | 'SOV' | 'OSV' = 'CTV';

  @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

  @ViewChild('canvas') canvas: ElementRef;
  private context: CanvasRenderingContext2D;

  hasData: boolean;
  info: string;
  chart: Chart;
  axisType: any;
  @Input() callback: (data: RawScatterData) => {x: number[], y: number[]}[] = (data) => [];

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
    };

    this.parser.load(query, this.data.dataType, this.vesselType).pipe(map(
      (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData)
    ), catchError(error => {
      console.log('error: ' + error);
      throw error;
    })).subscribe(parsedData => {
      this.hasData = parsedData.some(_parsed => {
        return _parsed[0].x.length > 0;
      });
      if (this.hasData) {
        const dsets = parsedData.map((_data: any[], i: number) => {
          return this.parser.createChartlyBar(_data, i, {label: this.vesselLabels[i]});
        });
        // if (this.chart) {
        // // Chart updates do not work in current setup, as we cant pass arguments to it the same way.
        //   this.updateChart(dsets)
        // } else {
          this.createChart(dsets);
        // }
      }
      this.ref.detectChanges();
    });
  }

  parseRawData(rawScatterData: RawScatterData[]) {
    this.reduceLabels(rawScatterData.map(_data => _data._id));
    return rawScatterData.map((data, _i) => {
      return this.callback(data);
    });
  }

  createChart(datasets: LongtermScatterValueArray[]) {
    const labelLength =  datasets.map((dset: {data}) => dset.data[0].x.length);
    let largestLabelLength = 0;
    const largestDataBin = labelLength.reduce((prev, curr, _i) => {
      if (curr > largestLabelLength) {
        largestLabelLength = curr;
        return _i;
      } else {
        return prev;
      }
    }, 0);
    const barLabels = datasets[largestDataBin].data[0].label || datasets[largestDataBin].data[0].x; // string[]
    const dataSets = [];
    datasets.forEach(vesseldata => {
      vesseldata.data.forEach((stackdata, _i) => {
        dataSets.push({
          label: vesseldata.label,
          key: stackdata.key ? stackdata.key : 'Value:',
          data: stackdata.y,
          stack: vesseldata.label,
          showInLegend: _i === 0,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.7)',
          backgroundColor: vesseldata.backgroundColor.replace('1)', (vesseldata.data.length - _i) / (vesseldata.data.length) + ')'),
        });
      });
    });
    this.chart = new Chart(this.context, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: dataSets,
      },
      options: {
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label;
            },
            afterLabel: function(tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].key + ' ' + tooltipItem.value;
            },
          }
        },
        title: {
          display: true,
          fontSize: 20,
          text: this.data.yLabel,
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
        scales: {
          xAxes: [{
            id: 'x-axis-0',
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: this.data.xLabel,
            },
          }],
          yAxes: [{
            id: 'y-axis-0',
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: this.data.yLabel,
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

  reset() {
    this.chart.destroy();
  }

  reduceLabels(received_mmsi: number[]): void {
    this.vesselLabels = this.parser.reduceLabels(this.vesselObject, received_mmsi);
  }
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
