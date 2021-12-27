import { Injectable } from '@angular/core';
import { WeatherForecast } from '../weather-forecast.types';
import { flattenDeep } from 'lodash';
@Injectable()
export class WeatherForecastWindSpeedGraphService {
  getPlotData(data, waveHeightType){
    const ceil = Math.ceil(Math.max(...this.getYaxisRange(data, waveHeightType)))
    const graphData = data.map(forecast => {
      return this.factorGraphData(forecast, waveHeightType)
    })

    const plotData = graphData.map(data => {
      return this.createPlottyData(data)
    })

    return {
      title: graphData[0].yAxisInformation.Type,
      showPlot: plotData.filter(data => data.y.length).length,
      plotLayout: this.setPlotLayout([0, ceil], graphData[0].yAxisInformation.Units),
      data: plotData
    }
}

  getYaxisRange(forecasts: WeatherForecast[], yAxisValue: string){
    const newDataSet = forecasts.map(this.factorWindInformation)
    const data = newDataSet.map(data =>{
      return data.find(val => val.dataType === yAxisValue.toUpperCase())
    })
    return flattenDeep(data.map(val => val.Data))
  }


  setPlotLayout(range: number[], titleY: string): Partial<Plotly.Layout> {
    return {
      yaxis: {
        range: range,
        title: titleY,
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
      }
    };
  }


  factorWindInformation(waveInformation: WeatherForecast) {
    const newData = Object.entries(waveInformation.Wind).map(([key, value]) => {
      return {
        ...value,
        dataType: key.toUpperCase()
      }
    })

    return newData;
  }

  factorGraphData(waveInformation: WeatherForecast, yAxisValue: string) {
    const newDataSet = this.factorWindInformation(waveInformation)
    const dateTime = newDataSet.find(val => val.dataType === 'DATETIME')
    const yAxis = newDataSet.find(val => val.dataType === yAxisValue.toUpperCase())
    return {
      dateTime,
      yAxisInformation: yAxis,
      title: waveInformation.General.Forecaster.Data
    }
  }

  createPlottyData(graphInformation: {
    dateTime: any;
    yAxisInformation: any;
    title: any;
  }) {
    return {
      x: graphInformation.dateTime.Data.map(d => new Date(d)),
      y: graphInformation.yAxisInformation.Data,
      type: 'scatter', // This is a line
      name: graphInformation.title,
      connectgaps: false,
      mode: 'lines',
    }
  }
}
