import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import {  WeatherForecastWeatherGraphsService } from './weather-forecast-weather-graphs.service';
import { DayReport } from './weather-forecast.types';


@Component({
  selector: 'app-weather-forecast-weather-graphs',
  templateUrl: './weather-forecast-weather-graphs.component.html',
  styleUrls: ['./weather-forecast-weather-graphs.component.scss']
})
export class WeatherForecastWeatherGraphsComponent implements OnInit {
  weatherForecasts$: Observable<DayReport[][]>;

  constructor(private weatherForecastCommunicationService: WeatherForecastCommunicationService, private weatherForecastWeatherGraphService: WeatherForecastWeatherGraphsService) { }
  
  ngOnInit(): void {
    this.weatherForecasts$ = this._getWeatherForecast()
  }

  private _getWeatherForecast(){
    return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      map(weaterForecasts => {
        return weaterForecasts.map(weatherForecast =>{
          return this.weatherForecastWeatherGraphService.factorDailyWeatherForecastData(weatherForecast)
        })
      })
    )
  }
}
