import { Injectable } from '@angular/core';
import { CartesianDensity, DateNum, Density, General, PrecipitationProbability, Wave, WaveDateTime, WeatherForecast, WeatherForecastGraphData } from '../weather-forecast.types';
import { flattenDeep, groupBy} from 'lodash';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as moment from 'moment';
import { WeatherForecastWaveGraphData, WeatherForecastWaveGraphMeta } from './weather-forecast-wave-height-graph.types';

@Injectable()
export class WeatherForecastWaveHeightGraphService {
  constructor(private dateTimeService: DatetimeService) { }

  getPlotData(forecasts, waveHeightType){
    const graphData = forecasts.map(weatherForecast => this.getWaveDataWeatherForecast(weatherForecast))
    const plotData = graphData.map(data => (this.createPlottyData(data, waveHeightType)))
    const ceil = this.getCeil(forecasts, waveHeightType)
    // sind all units and types the same can just take the first one from the list
    const waveHeight = graphData[0].waveWeatherForecast[0][waveHeightType]
    return {
      plotLayout: this.setPlotLayout([0, ceil], waveHeight?.type, waveHeight?.units),
      data: plotData
    }
  }

  getWaveDataWeatherForecast(weatherForecast: WeatherForecast): WeatherForecastWaveGraphMeta {
    const header = weatherForecast.General

    const waveInformation = this.factorWaveInformation(weatherForecast)

    const frequencies = waveInformation.find(weatherForecast => weatherForecast.dataType === 'FREQUENCIES')
    
    const directions = waveInformation.find(weatherForecast => weatherForecast.dataType === 'DIRECTIONS')

    const waveData = this.getNewDataObject(waveInformation)

    const groupedWaveData: WeatherForecastWaveGraphData[][] = Object.values(groupBy(flattenDeep(waveData), 'index'))

    const waveWeatherForecast = this.getDataSet(groupedWaveData, frequencies, directions);

    return {
      generalInformation: {
        timeStamp: this.getTimeStamp(header),
        provider: header.Forecaster.Data,
      },
      waveWeatherForecast
    };
  }

  getNewDataObject(waveInformation: ((WaveDateTime | Density | PrecipitationProbability | CartesianDensity | DateNum) & {dataType: string})[]): WeatherForecastGraphData[][] {
    return waveInformation
    .filter(weatherForecast =>  !['HEADER', 'FREQUENCIES','DIRECTIONS','CARTESIANDENSITY'].includes( weatherForecast.dataType ))
    .map((data: (WaveDateTime| PrecipitationProbability) & {dataType: string}) => {
      return this.createNewDataObjectWithIndex(data)
    })
  }

  createPlottyData(graphInformation: WeatherForecastWaveGraphMeta, waveHeightType: string) {

    const waveForecast = graphInformation.waveWeatherForecast
    return {
      meta: graphInformation,
      x: waveForecast.map(data => new Date(data['dateTime'].val)),
      y: waveForecast.map(data => data[waveHeightType]?.val),
      hovertext: this.getHoverTextData(waveForecast, waveHeightType),
      type: 'scatter',
      connectgaps: false,
      mode: 'lines',
      hoverinfo: "text",
      name: `${graphInformation.generalInformation.provider}, ${graphInformation.generalInformation.timeStamp}`
    }
  }

  getHoverTextData(waveForecast, waveHeightType): string[] {
    return waveForecast.map(data => {
      const waveType = data[waveHeightType]
      return `${waveType.val} ${waveType.units}`
    })
  }

  getCeil(forecasts, waveHeightType): number {
    return Math.ceil(Math.max(...this.getYaxisRange(forecasts, waveHeightType)))
  }

  getYaxisRange(forecasts: WeatherForecast[], yAxisValue: string): number[] {
    const newDataSet = forecasts.map(this.factorWaveInformation)
    const data = newDataSet.map(data => {
      return data.find(val => val.dataType === yAxisValue.toUpperCase()) as PrecipitationProbability
    })
    return flattenDeep(data.map((val) => val.Data))
  }

  getTimeStamp(generalWeatherForecastInformation: General): string {
    return moment(new Date(this.dateTimeService.matlabDatenumToDate(generalWeatherForecastInformation.RefDateNum.Data))).format('DD MM yyyy, HH:mm');
  }

  getDataSet(data : WeatherForecastWaveGraphData[][], frequencies, directions) {
    return data.map((_data) => {
      const hs = _data.find((val) => val.dataType === 'HS');
      const hMax = _data.find((val) => val.dataType === 'HMAX');
      const tz =  _data.find((val )=> val.dataType === 'TZ');
      return {
        frequencies,
        directions,
        dateTime: _data.find((val) => val.dataType === 'DATETIME'),
        dateNum: _data.find((val )=> val.dataType === 'DATENUM'),
        // density: _data.find((val )=> val.dataType === 'DENSITY'),
        hs: {...hs, val: (hs.val as number).toFixed(2)},
        hMax: {...hMax, val: (hMax.val as number).toFixed(2)},
        tz: {...tz, val: (tz.val as number).toFixed(2)},
      }
    });
  }

  createNewDataObjectWithIndex(dataObject: (WaveDateTime| PrecipitationProbability) & {dataType: string}): WeatherForecastGraphData[] {
    return (dataObject.Data as Array<string|number>).map((val, index) => {
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

  factorWaveInformation(waveInformation: WeatherForecast): ((WaveDateTime | Density | PrecipitationProbability | CartesianDensity | DateNum) & {dataType: string})[] {
    const newData = Object.entries(waveInformation.Wave).map(([key, value]) => {
      return {
        ...value,
        dataType: key.toUpperCase()
      }
    })

    return newData;
  }
}
