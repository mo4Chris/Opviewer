import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { CalculationService } from '@app/supportModules/calculation.service';

@Component({
  selector: 'app-ctvslipgraph',
  templateUrl: './ctvslipgraph.component.html',
  styleUrls: ['./ctvslipgraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvslipgraphComponent implements AfterViewInit, OnChanges {
  @Input() XYvar: any;
  @Input() index: number;
  @Input() transfer: any;

  @ViewChild('canvas') canvas: ElementRef;

  slipGraph: any;
  chart: Chart;
  context: CanvasRenderingContext2D;

  constructor(
    private calcService: CalculationService
  ) { }

  ngAfterViewInit() {
  }

  ngOnChanges() {
    this.context = (<HTMLCanvasElement> this.canvas.nativeElement).getContext('2d');
    if (this.transfer !== undefined) {
      this.createSlipgraph();
    }
  }

  createSlipgraph() {
    this.slipGraph = this.transfer.slipGraph;
    this.chart = null;
    if (this.slipGraph !== undefined && this.slipGraph.slipX.length > 0) {
      const line = {
        type: 'line',
        data: {
          datasets: this.XYvar
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
                labelString: 'Time'
              },
              type: 'time'
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Slip (m)'
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
      }
      if (line.data.datasets[0].data.length > 0) {
        if (this.context !== undefined) {
          this.chart = new Chart(this.context, line);
        } else {
          console.log(this.canvas)
          console.log(this.canvas.nativeElement)
          console.log(this.canvas.nativeElement.getContext('2d'))
          console.log(this.context)
          console.log(line)
          console.error('Could not get 2d context!')
        }
      }
    };
  }

  roundNumber(number, decimal = 10, addString = '') {
    return this.calcService.roundNumber(number, decimal = decimal, addString = addString);
  }
}
