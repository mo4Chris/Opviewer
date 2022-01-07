import { Injectable } from '@angular/core';
import { DayReport } from '../weather-forecast.types';

@Injectable()
export class WeatherForecastWeatherGraphService {

  constructor() { }
  createGraphInformation(dayReport: DayReport, type: string){
    const dateArray = dayReport.dateGraphInformation.map(val =>{
      return val.date
    })
    const array = dayReport.dateGraphInformation.map(val =>{
      return val[type]?.val
    })

    const title =  dayReport.dateGraphInformation?.[0]?.[type]?.unit
    const floor = Math.floor(Math.max(...array)) 
    const ceil = Math.ceil(Math.max(...array))
    const floorRange = floor <= 0 ? floor : 0
    const range = [floorRange, ceil];
    const graphtitle = `${dayReport.date}: ${type}`
    const plotLayout = this.setPlotLayout(range,graphtitle ,title)
    return {
      plotData: this.createPlottyData({
        dateArray,
        temperatureArray: array,
        title
      }),
      plotLayout
    }
  }

  createPlottyData(graphInformation) {
    return [{
      x: graphInformation.dateArray,
      y: graphInformation.temperatureArray,
      type: 'bar',
      name: graphInformation.title,
      connectgaps: false,
      marker: {
        color: '#007bff',
      },
    }]
  }

  setPlotLayout(range: number[], graphTitle: string ,titleY: string): Partial<Plotly.Layout> {
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
