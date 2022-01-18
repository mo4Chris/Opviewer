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

    const range = this._getRangeForType(type, array);

    const graphTitle = `${dayReport.date}: ${type}`;
    const plotLayout = this._setPlotLayout(range, graphTitle, title);
    return {
      plotData: this._createPlotlyData({
        dateArray,
        temperatureArray: array,
        title
      }),
      plotLayout
    };
  }

  private _getRangeForType(type: string, array) {
    switch (type) {
      case 'visibility':
        return this._rangeWithOffset(array, 1);

      case 'pressure':
        return this._rangeWithOffset(array);

      default:
        return this._rangeByLowest(array);
    }
  }

  private _rangeWithOffset(array, offset = 0) {
    const floor = Math.floor(Math.min(...array) - offset);
    const ceil = Math.ceil(Math.max(...array) + offset);

    return [floor, ceil];
  }

  private _rangeByLowest(array) {
    const floor = Math.floor(Math.max(...array));
    const ceil = Math.ceil(Math.max(...array));
    const floorRange = floor <= 0 ? floor : 0;
    return [floorRange, ceil];
  }

  private _createPlotlyData(graphInformation) {
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

  private _setPlotLayout(range: number[], graphTitle: string, titleY: string): Partial<Plotly.Layout> {
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
