import { Injectable } from '@angular/core';
import { flattenDeep, groupBy } from 'lodash';
import { WeatherForecast } from '../weather-forecast.types';
import { DayReport, WeatherForecastDailySummaryInformation, WeatherForecastDayResult, WeatherForecastHourChartInformation } from './weather-forecast.types';
import * as moment from 'moment';
@Injectable()

export class WeatherForecastWeatherGraphsService {

  factorDailyWeatherForecastData(val: WeatherForecast): DayReport[] {
    // create a data structure that we can loop over and find corresponding data with
    // and make sure that every part of the array from all keys are corresponding by adding an index to the value
    const result = this.getDataStructure(val);
    const dataArray: WeatherForecastDayResult[] = flattenDeep(result)
    const groupedPerDay: WeatherForecastDayResult[][] = Object.values(groupBy(dataArray, 'index'))
    const dateGraphInformation = this.factorAirInformation(val)
    return this.createDayReports(groupedPerDay, dateGraphInformation)
  }

  getDataStructure(weatherForecast: WeatherForecast): WeatherForecastDayResult[][] {
    return this.factorDailySummeryInformation(weatherForecast).map(this.createNewDataObjectWithIndex)
  }

  createNewDataObjectWithIndex(dataObject){
    return dataObject.Data.map((val, index) => {
      return {
        ...dataObject,
        val,
        index
      }
    })
  }

  factorDailySummeryInformation(weatherForecast: WeatherForecast): WeatherForecastDailySummaryInformation[] {
    return  Object.entries(weatherForecast.DailySummary).map(([key, value]) => {
      return {
        ...value,
        dataType: key.toUpperCase()
      }
    })
  }

  factorAirData(weatherForecast: WeatherForecast): WeatherForecastDailySummaryInformation[] {
    return  Object.entries(weatherForecast.Air).map(([key, value]) => {
      return {
        ...value,
        dataType: key.toUpperCase()
      }
    })
  }

  factorAirInformation(weatherForecast: WeatherForecast): WeatherForecastHourChartInformation[][] {
    const result = this.factorAirData(weatherForecast)
      .filter(val => {
        return val.dataType !== 'ICON'
      })
      .map(this.createNewDataObjectWithIndex);

    const flattend = flattenDeep(result)
    const grouperPerIndex: any = Object.values(groupBy(flattend, 'index'))
    const temperatureChartPerhour = this.createTemperatureChartReport(grouperPerIndex);
    return Object.values(groupBy(temperatureChartPerhour, 'dateNum'));
  }

  createDayReports(groupedPerDay: WeatherForecastDayResult[][], dateGraphInformation: WeatherForecastHourChartInformation[][]): DayReport[] {
    return groupedPerDay.map((data) => {
      return {
        daySummary: this.getValue(data, 'SUMMARY'),
        date: this.createFormattedDate(data),
        day: this.createFormattedDay(data),
        dateIcon: this.getValue(data, 'ICON'),
        timeOfSunrise: this.createSunriseHour(data),
        timeOfSunset: this.createSunSetHour(data),
        temperatureLow: this.getTemperatureValues(data, 'TEMPERATURELOW'),
        temperatureHigh: this.getTemperatureValues(data, 'TEMPERATUREHIGH'),
        precipitationProbability: this.getTemperatureValues(data, 'PRECIPITATIONPROBABILITY'),
        precipitationIntensity: this.getTemperatureValues(data, 'PRECIPITATIONINTENSITY'),
        visibility: this.getValue(data, 'VISIBILITY'),
        windSpeed: this.getTemperatureValues(data, 'WINDSPEED'),
        windGust: this.getTemperatureValues(data, 'WINDGUST'),
        windDirection: this.getTemperatureValues(data, 'WINDDIRECTION'),
        dateGraphInformation: this.getDateGraphInformation(dateGraphInformation, data)
      }
    })
  }

  createTemperatureChartReport(weatherForecast: WeatherForecastDayResult[][]): WeatherForecastHourChartInformation[] {
    return weatherForecast.map((data) => {
      return {
        day: this.createFormattedDay(data),
        visibility: this.getValue(data, 'VISIBILITY'),
        temperature: this.getValue(data, 'TEMPERATURE'),
        dateNum: this.getDateNum(data),
        hour: this.createHour(data),
        date: this.createFormattedDate(data),
      }
    })
  }

  getTemperatureValues(data: WeatherForecastDayResult[], type: string) {
    const temperature = data.find(val => val.dataType === type)
    return {
      val: temperature?.val,
      unit: temperature?.Units
    }
  }

  getValue(data: WeatherForecastDayResult[], type: string){
    return data.find(val => val?.dataType === type)?.val
  }

  getDateNum(data: WeatherForecastDayResult[]): string | undefined {
    const dateNum = this.getValue(data, 'DATENUM');
    return !!dateNum ? dateNum.toString().split('.')[0] : undefined;
  }

  createFormattedDate(data: WeatherForecastDayResult[]) {
    const dayResult = this.getValue(data, 'DATETIME');
    return !!dayResult ? moment(new Date(dayResult)).format('dddd, DD MMMM'): '';
  }

  createFormattedDay(data: WeatherForecastDayResult[]) {
    const dayResult = this.getValue(data, 'DATETIME');
    return !!dayResult ? moment(new Date(dayResult)).format('ddd') : '';
  }

  createSunriseHour(data: WeatherForecastDayResult[]) {
    const dayResult = this.getValue(data, 'SUNRISE');
    return !!dayResult ? moment(new Date(dayResult)).format('HH:mm') : '';
  }

  createHour(data: WeatherForecastDayResult[]) {
    const dayResult = this.getValue(data, 'DATETIME');
    return !!dayResult ? moment(new Date(dayResult)).format('HH:mm') : '';
  }

  createSunSetHour(data: WeatherForecastDayResult[]) {
    const dayResult = this.getValue(data, 'SUNSET');
    return !!dayResult ? moment(new Date(dayResult)).format('HH:mm') : '';
  }

  getDateGraphInformation(dateGraphInformation: WeatherForecastHourChartInformation[][], data: WeatherForecastDayResult[]) {
    const date = this.createFormattedDate(data)
    const correspondingDates = dateGraphInformation.map(hoursArray => {
      return this.filterSameDates(hoursArray, date);
    })

    const result = flattenDeep(correspondingDates).filter(Boolean);

    return result
  }

  filterSameDates(hoursArray: WeatherForecastHourChartInformation[], date: string){
      return hoursArray.filter(val => {
        return val.date === date;
      })
  }
}
