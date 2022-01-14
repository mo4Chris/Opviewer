import { Injectable } from '@angular/core';
import { General, WeatherForecast, WeatherForecastGraphData, Wind } from '../weather-forecast.types';
import { flattenDeep, groupBy } from 'lodash';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as moment from 'moment';
import { WeatherForecastWindGraphMeta, Datum, WeatherForecastWind, WeatherForecastWindPlotData } from './weather-forecast-wind-speed-graph.types';

@Injectable()
export class WeatherForecastWindSpeedGraphService {
  constructor(private dateTimeService: DatetimeService) { }
  getPlotData(forecasts: WeatherForecast[], waveHeightType): WeatherForecastWindPlotData {
    const newDataSet = forecasts.map(forecast => (this.getWindDataWeatherForecast(forecast)))
    const plotData = newDataSet.map(data => (this.createPlottyData(data, waveHeightType)))
    const ceil = this.getCeil(forecasts, waveHeightType)
    // sind all units and types are the same we can just take the first one from the list
    const waveHeight = newDataSet[0].weatherForecastWind[0][waveHeightType]
    return {
      plotLayout: this.setPlotLayout([0, ceil], waveHeight?.type, waveHeight?.units),
      data: plotData
    }
  }

  getWindDataWeatherForecast(weatherForecast: WeatherForecast): WeatherForecastWindGraphMeta {
    const header = weatherForecast.General
    const result = this.factorWindInformation(weatherForecast)
      .filter(weatherForecast => weatherForecast.dataType !== 'HEADER')
      .map(this.createNewDataObjectWithIndex)

    const groupedData: WeatherForecastGraphData[][] = Object.values(groupBy(flattenDeep(result), 'index'))
    const dataSet = this.getDataSet(groupedData)
    
    return {
      generalInformation: {
        timeStamp: this.getTimeStamp(header),
        provider: header.Forecaster.Data
      },
      weatherForecastWind: dataSet
    };
  }


  getCeil(forecasts, waveHeightType): number {
    return Math.ceil(Math.max(...this.getYaxisRange(forecasts, waveHeightType)))
  }

  getDataSet(data: WeatherForecastGraphData[][]): WeatherForecastWind[] {
    return data.map((_data) => {
      return {
        dateTime: _data.find((val: WeatherForecastGraphData) => val.dataType === 'DATETIME'),
        dateNum: _data.find((val: WeatherForecastGraphData )=> val.dataType === 'DATENUM'),
        speed: _data.find((val: WeatherForecastGraphData )=> val.dataType === 'SPEED'),
        gust: _data.find((val: WeatherForecastGraphData )=> val.dataType === 'GUST'),
        directions: _data.find((val: WeatherForecastGraphData )=> val.dataType === 'DIRECTIONS'),
      }
    });
  }

  getTimeStamp(generalWeatherForecastInformation: General): string {
    return moment(new Date(this.dateTimeService.matlabDatenumToDate(generalWeatherForecastInformation.RefDateNum.Data))).format('DD MM yyyy, HH:mm');
  }

  getYaxisRange(forecasts: WeatherForecast[], yAxisValue: string): number[] {
    const newDataSet = forecasts.map(this.factorWindInformation)
    const data = newDataSet.map(data => {
      return data.find(val => val.dataType === yAxisValue.toUpperCase())
    })
    return flattenDeep(data.map(val => val.Data))
  }

  createNewDataObjectWithIndex(dataObject): WeatherForecastGraphData[] {
    return dataObject.Data.map((val, index) => {
      return {
        type: dataObject.Type,
        units: dataObject.Units,
        dataType: dataObject.dataType,
        val,
        index
      }
    })
  }


  setPlotLayout(range: number[], graphTitle = 'Could not find data for request', titleY: string): Partial<Plotly.Layout> {
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


  factorWindInformation(waveInformation: WeatherForecast): (Wind & {dataType: string, Data: any})[] {
    return Object.entries(waveInformation.Wind).map(([key, value]) => {
      return {
        ...value,
        dataType: key.toUpperCase()
      }
    })
  }

  createPlottyData(graphInformation: WeatherForecastWindGraphMeta, waveHeightType: string): Datum {
    const windForecast = graphInformation.weatherForecastWind
    return {
      meta: graphInformation,
      x: windForecast.map(data => new Date(data['dateTime'].val)),
      y: windForecast.map(data => data[waveHeightType]?.val),
      hovertext: this.getHoverTextData(windForecast),
      type: 'scatter',
      connectgaps: false,
      mode: 'lines',
      hoverinfo: "text",
      name: `${graphInformation.generalInformation.provider}, ${graphInformation.generalInformation.timeStamp}`
    }
  }

  getHoverTextData(windForecast: WeatherForecastWind[]): string[] {
    return windForecast.map(data => {
      const directions = data['directions']
      const speed = data['speed']
      return `${speed.val} ${speed.units}, ${directions.val} ${directions.units}`
    })
  }
}
