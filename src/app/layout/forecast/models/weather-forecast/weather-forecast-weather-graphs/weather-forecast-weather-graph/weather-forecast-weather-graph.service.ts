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
    let min = Math.floor(Math.min(...array));
    let max = Math.ceil(Math.max(...array));

    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 0;

    if (type === 'temperature') {
      const temperatureMin = min > 0 ? 0 : min;
      const temperatureMax = max < 0 ? 0 : max;
      return [temperatureMin, temperatureMax];
    }

    return [min, max];
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
