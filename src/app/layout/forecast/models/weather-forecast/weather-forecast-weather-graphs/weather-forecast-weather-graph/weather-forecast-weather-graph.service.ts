import { Injectable } from '@angular/core';
import { DayReport } from '../weather-forecast.types';

@Injectable()
export class WeatherForecastWeatherGraphService {

  constructor() { }

  public createGraphInformation(dayReport: DayReport, type: string) {
    const dateArray = dayReport.dateGraphInformation.map(val => val.date);
    const array = dayReport.dateGraphInformation.map(val => val[type]?.val);

    const unit = dayReport.dateGraphInformation?.[0]?.[type]?.unit;
    const title = unit;

    const range = this.getRangeForType(type, array);

    const graphTitle = `${dayReport.date}: ${type}`;
    const plotLayout = this.setPlotLayout(range, graphTitle, title);
    return {
      plotData: this.createPlotlyData({
        dateArray,
        temperatureArray: array,
        title
      }),
      plotLayout
    };
  }

  public getRangeForType(type: string, array): [number, number] {
    const floor = Math.floor(Math.min(...array));
    const ceil = Math.ceil(Math.max(...array));

    if (type === 'temperature') {
      const temperatureFloor = floor > 0 ? 0 : floor;
      return [temperatureFloor, ceil];
    }

    return [floor, ceil];
  }

  public createPlotlyData(graphInformation) {
    return [{
      x: graphInformation.dateArray,
      y: graphInformation.temperatureArray,
      type: 'bar',
      name: graphInformation.title,
      connectgaps: false,
      marker: {
        color: '#007bff',
      },
    }];
  }

  public setPlotLayout(range: number[], graphTitle: string, titleY: string): Partial<Plotly.Layout> {
    return {
      title: graphTitle,
      width: 800,
      height: 450,
      yaxis: {
        range: range,
        title: titleY,
        fixedrange: true,
      },
      xaxis: {
        automargin: true,
        type: 'date',
        title: 'hours'
      },
      margin: {
        t: 40,
        b: 0,
        l: 60,
        r: 40
      }
    };
  }
}
