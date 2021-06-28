import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { title } from 'node:process';
import { ForecastMotionLimit } from '../../models/forecast-limit';

@Component({
  selector: 'app-forecast-workability-limiter',
  templateUrl: './forecast-workability-limiter.component.html',
  styleUrls: ['./forecast-workability-limiter.component.scss']
})
export class ForecastWorkabilityLimiterComponent implements OnChanges {
  @Input() time: Date[];
  @Input() limits: ForecastMotionLimit[];
  @Input() workabilityPerLimiter: number[][];
  @Input() combinedWorkability: number[];
  @Input() config: Partial<Plotly.Config> = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'zoomIn2d', 'zoomOut2d'],
    displaylogo: false
  }

  public parsedData= [];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    yaxis: {
      range: [0, 120],
      title: 'Workability (%)',
      fixedrange: true,
    },
    xaxis: {
      automargin: true,
      type: 'date',
    },
    legend: {
      x: 1,
      y: 1,
      xanchor: 'right',
    },
    margin: {
      t: 40,
      b: 0,
      l: 60,
      r: 40
    },
    title: {
      text: "Workability per limit along selected heading"
    }
  };

  constructor() { }

  ngOnChanges(): void {
    this.setGraphData();
  }

  setGraphData() {
    this.parsedData = this.limits.map((_limit, _i) => {
      return {
        x: this.time,
        y: this.workabilityPerLimiter[_i],
        type: 'scatter', // This is a line
        name: _limit.Type + ' - ' + _limit.Dof,
        connectgaps: false,
        mode: 'lines',
        // line: {
        //   color: 'green',
        // },
      }
    });
    this.parsedData.push({
      x: [this.time[0], this.time[this.time.length-1]],
      y: [100, 100],
      type: 'scatter',
      connectgaps: false,
      showlegend: false,
      mode: 'lines',
      hoverinfo: 'skip',
      line: {
        width: 1,
        color: 'black',
        dash: 'dash'
      },
      text: ['100%'],
      textposition: 'bottom right'
    })
  }

  public onPlotlyInit(evt: any) {

  }
}
