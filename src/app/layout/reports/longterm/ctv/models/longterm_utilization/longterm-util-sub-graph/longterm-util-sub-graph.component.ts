import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as Chart from 'chart.js';
import { now } from 'moment-timezone';

@Component({
  selector: 'app-longterm-util-sub-graph',
  templateUrl: './longterm-util-sub-graph.component.html',
  styleUrls: ['../utilizationGraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LongtermUtilSubGraphComponent implements OnChanges {
  @Input() dateMin: number;
  @Input() dateMax: number;
  @Input() dset: {
    labels: string[],
    isFirst: boolean,
    datasets: number[][],
  };

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  
  public hasData = false;

  chart: Chart;
  
  constructor(
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
  ) { }

  ngOnChanges() {
    if (this.dset) {
      this.hasData = true;
      this.constructNewChart();
    } else {
      this.hasData = false;
    }
  }


  
  private constructNewChart()
   {
    const calcService = this.calculationService;
    const dateService = this.dateTimeService;
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: this.dset,
      options: {
        tooltips: {
          filter: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].xAxisID === 'x-axis-0';
          },
          callbacks: {
            beforeLabel: function (tooltipItem, data) {
              const date: Date = data.labels[tooltipItem.index];
              return [
                data.datasets[tooltipItem.datasetIndex].stack,
                dateService.jsDateToDMYString(date),
              ];
            },
            label: () => { }, // Disable to default color cb
            afterLabel: function (tooltipItem, data) {
              const info = [];
              data.datasets.forEach((dset, _i) => {
                if (dset.data[tooltipItem.index] > 0) {
                  info.push(dset.label + ': ' + calcService.GetDecimalValueForNumber(dset.data[tooltipItem.index], ' hours'));
                }
              });
              return info;
            },
            title: function (tooltipItem, data) {
              // Prevents a bug from showing up in the bar chart tooltip
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        legend: {
          display: true, // this.dset.isFirst,
          labels: {
            defaultFontSize: 24,
            defaultFontStyle: 'bold',
            filter: (legItem, chart) => {
              return chart.datasets[legItem.datasetIndex].showInLegend;
            }
          },
          onClick: (event: MouseEvent, legItem) => {
            const Key = legItem.text;
            const _dsets = this.chart.config.data.datasets;
            _dsets.forEach(dset => {
              const metaKey = Object.keys(dset._meta)[0];
              if (dset.label === Key && dset._meta[metaKey]) {
                dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
              }
            });
            this.chart.update();
          }
        },
        scales: {
          xAxes: [{
            id: 'x-axis-0',
            stacked: true,
            display: false,
            min: 0,
          }, {
            id: 'x-axis-time',
            type: 'time',
            display: true,
            beginAtZero: false,
            time: {
              unit: 'day'
            },
            ticks: {
              min: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.dateMin),
              max: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.dateMax + 1),
              maxTicksLimit: 21,
            },
            gridLines: {
              display: false,
            }
          }],
          yAxes: [{
            id: 'y-axis-0',
            scaleLabel: {
              display: true,
              labelString: 'Number of hours',
            },
            ticks: {
              min: 0,
              max: 24,
              stepSize: 4,
            }
          }],
        },
        annotation: {
          events: ['mouseover', 'mouseout', 'dblclick', 'click'],
        },
        onClick: function (clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
          if (this.lastClick !== undefined && now() - this.lastClick < 300) {
            // Two clicks < 300ms ==> double click
            if (chartElt.length > 0) {
              chartElt = chartElt[chartElt.length - 1];
              const dataElt = chartElt._chart.data.datasets[chartElt._datasetIndex];
              if (dataElt.callback !== undefined) {
                dataElt.callback(chartElt._index);
              }
            }
          }
          this.lastClick = now();
        }
      }
    });
  }
}
