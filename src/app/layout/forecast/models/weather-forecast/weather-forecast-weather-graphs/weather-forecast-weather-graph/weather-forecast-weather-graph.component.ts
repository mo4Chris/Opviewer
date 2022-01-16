import { Component, Input, OnInit } from '@angular/core';
import { DayReport } from '../weather-forecast.types';
import { WeatherForecastPlotlyData, WEATHER_FORECAST_OPTIONS_TYPE } from './weather-forecast-weather-graph.types';
import { WeatherForecastWeatherGraphService } from './weather-forecast-weather-graph.service';

@Component({
  selector: 'app-weather-forecast-weather-graph',
  templateUrl: './weather-forecast-weather-graph.component.html',
  styleUrls: ['./weather-forecast-weather-graph.component.scss']
})

export class WeatherForecastWeatherGraphComponent implements OnInit {
  @Input() weatherForecast: DayReport[]
  temperature = WEATHER_FORECAST_OPTIONS_TYPE.TEMPERATURE
  visibility = WEATHER_FORECAST_OPTIONS_TYPE.VISIBILITY
  humidity = WEATHER_FORECAST_OPTIONS_TYPE.HUMIDITY
  pressure = WEATHER_FORECAST_OPTIONS_TYPE.PRESSURE
  weatherForecastType = WEATHER_FORECAST_OPTIONS_TYPE.TEMPERATURE;
  selectedWFindex = 0;
  dayReport: DayReport;
  temperatureGraphInformation: WeatherForecastPlotlyData;

  constructor(private weatherForecastWeatherGraphService: WeatherForecastWeatherGraphService){}
  
  ngOnInit(): void {
    this.dayReport = this.weatherForecast[this.selectedWFindex];
    this.temperatureGraphInformation = this.weatherForecastWeatherGraphService.createGraphInformation(this.weatherForecast[this.selectedWFindex], this.weatherForecastType)
  }
  
  onSelectDayReport(i){
    this.selectedWFindex = i;
    this.dayReport = this.weatherForecast[this.selectedWFindex]
    this.temperatureGraphInformation = this.weatherForecastWeatherGraphService.createGraphInformation(this.weatherForecast[this.selectedWFindex], this.weatherForecastType)
  }

  onSelectType(type){
    this.weatherForecastType = type;
    this.temperatureGraphInformation = this.weatherForecastWeatherGraphService.createGraphInformation(this.weatherForecast[this.selectedWFindex], type)
  }
}
