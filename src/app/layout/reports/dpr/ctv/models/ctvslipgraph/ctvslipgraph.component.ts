import { Component, Input, OnChanges, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SettingsService } from '@app/supportModules/settings.service';

@Component({
  selector: 'app-ctvslipgraph',
  templateUrl: './ctvslipgraph.component.html',
  styleUrls: ['./ctvslipgraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvslipgraphComponent implements OnChanges {
  @Input() index: number;
  @Input() transfer: any;
  @Input() vesselUtcOffset: number;
  @ViewChild('canvas') canvas: ElementRef;

  chart: Chart;
  slipGraph: slipGraphData;
  private context: CanvasRenderingContext2D;
  private utcOffset: number;
  private color = {
    isTransfer: 'rgba(0, 150, 0, 0.4)',
    noTransfer: 'rgba(255, 0, 0, 0.4)',
    white: 'rgba(0,0, 0, 0)',
  };

  public hidden = false;

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private settings: SettingsService,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnChanges() {
    this.hidden = false;
    this.ref.detectChanges();
    this.context = (<HTMLCanvasElement> this.canvas.nativeElement).getContext('2d');
    const localOffset = this.settings.localTimeZoneOffset;
    this.utcOffset = Math.round(this.settings.getTimeOffset(this.vesselUtcOffset) - localOffset || 0);
    // This is an ugly ass hack needed only because the graphs show in local timezone...
    if (this.transfer !== undefined) {
      this.createSlipgraph();
    }
  }

  createSlipgraph() {
    this.slipGraph = this.transfer.slipGraph;
    this.chart = null;
    if (this.slipGraph !== undefined && this.slipGraph.slipX.length > 0) {
      const parsedData = this.parseSlipData();
      const line = {
        type: 'line',
        data: {
          datasets: parsedData
        },
        options: {
          scaleShowVerticalLines: false,
          legend: false,
          tooltips: false,
          responsive: true,
          elements: {
            point:
              { radius: 0 },
            line:
              { tension: 0 }
          },
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
                labelString: this.utcOffset >= 0 ? 'Time (UTC+' + this.utcOffset + ')' :  'Time (UTC ' + this.utcOffset + ')'
              },
              type: 'time'
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Slip (m)'
              },
              ticks: {
                min: this.slipGraph.yLimits[0],
                suggestedMax: 1,
              }
            }]
          },
          annotation: {
            annotations: [
              {
                type: 'line',
                drawTime: 'afterDatasetsDraw',
                id: 'average',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: this.slipGraph.slipLimit,
                borderWidth: 2,
                borderColor: 'red'
              }
            ]
          }
        }
      };
      if (line.data.datasets[0].data.length > 0) {
        if (this.context !== undefined) {
          this.chart = new Chart(this.context, line);
        } else {
          console.log(this.canvas);
          console.log(this.canvas.nativeElement);
          console.log(this.canvas.nativeElement.getContext('2d'));
          console.log(this.context);
          console.log(line);
          console.error('Could not get 2d context!');
        }
      }
    } else {
      this.hidden = true;
      this.ref.detectChanges();
    }
  }

  parseSlipData() {
    const datas = [];
    let temp = [], t: string, curr: boolean, prev: boolean, y: number;
    const addDataset = (dset) => {
      datas.push({
        data: dset,
        backgroundColor: prev ? this.color.isTransfer : this.color.noTransfer,
        borderColor: this.color.white,
        pointHoverRadius: 0
      });
    };

    // Creating x/y points for the slip graph
    this.slipGraph.slipX.forEach((_t, i) => {
      t = this.makeTimeString(_t);
      prev = i > 0 ? curr : this.slipGraph.transferPossible[0] > 0;
      curr = this.slipGraph.transferPossible[i] > 0;
      y = this.slipGraph.slipY[i];
      // We create overlapping data points here so the graphs
      if (curr === prev) {
        temp.push({
          x: t,
          y: y,
        });
      } else {
        temp.push({
          x: t,
          y: y,
        });
        addDataset(temp);
        temp = [{
          x: t,
          y: y,
        }];
      }
    });
    addDataset(temp);
    return datas;
  }

  roundNumber(number, decimal = 10, addString = '') {
    return this.calcService.roundNumber(number, decimal = decimal, addString = addString);
  }

  makeTimeString(matlabTime: number): string {
    return this.dateService
          .matlabDatenumToMoment(matlabTime + this.utcOffset / 24)
          .toISOString();
  }

  addTransfer(transferData: any[], startNum: number, stopNum: number) {
    const start = this.dateService.matlabDatenumToMoment(startNum);
    const stop = this.dateService.matlabDatenumToMoment(stopNum);
    transferData.push({ x: start, y: 1 });
    transferData.push({ x: stop, y: 1 });
    transferData.push({ x: NaN, y: NaN });
  }
}

interface slipGraphData {
  slipX: number[];
  slipY: number[];
  transferPossible: number[];
  yLimits: number[];
  slipLimit: number;
}
