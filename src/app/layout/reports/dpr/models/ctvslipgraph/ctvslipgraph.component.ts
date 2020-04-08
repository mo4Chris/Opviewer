import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-ctvslipgraph',
  templateUrl: './ctvslipgraph.component.html',
  styleUrls: ['./ctvslipgraph.component.scss']
})
export class CtvslipgraphComponent implements OnChanges {
  @Input() slipGraph: any;
  @Input() XYvar: any;
  @Input() index: number;
  @Input() score: number;

  constructor() { }

  ngOnChanges() {
    this.createSlipgraph();
  }
  chart: Chart;

  createSlipgraph() {
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
        this.chart = new Chart('canvas', line);
      }
    };
  }
}
