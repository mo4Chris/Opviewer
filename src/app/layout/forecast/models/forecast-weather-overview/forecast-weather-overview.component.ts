import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ForecastLimit, ForecastResponseObject } from '../forecast-response.model';

@Component({
  selector: 'app-forecast-weather-overview',
  templateUrl: './forecast-weather-overview.component.html',
  styleUrls: ['./forecast-weather-overview.component.scss']
})
export class ForecastWeatherOverviewComponent implements OnChanges {
  @Input() time: Date[];
  @Input() response: ForecastResponseObject;
  @Input() limits: ForecastLimit[];

  public parsedData: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    yaxis: {
      title: 'Wave height (m)',
      fixedrange: true,
    },
    xaxis: {
      title: 'Time'
    },

    legend: {
      x: 1,
      y: 1,
      xanchor: 'right',
    }
  };

  public get hasData() {
    return Array.isArray(this.time);
  }


  constructor() { }

  ngOnChanges() {
    if (!this.hasData) { return; }
    this.computeGraphData();
  }

  computeGraphData() {
    const yLimit = 100;
    this.parsedData = [{
      x: this.time,
      y: this.time.map(t => 50),
      type: 'scatter', // This is a line
      name: 'Workability - under limit',
      connectgaps: false,
      line: {
        color: 'green',
      },
    }];
  }

  onPlotlyInit() {
    this.loaded = true;
  }
}
