import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WeatherForecast } from './weather-forecast.types';

@Injectable()
export class WeatherForecastCommunicationService {
  private weatherForecasts = new BehaviorSubject([])
  private _weatherForecasts$: Observable<WeatherForecast[]> = this.weatherForecasts.asObservable();
  

  constructor() { }

  updatedSelectedWeatherForecasts(data: WeatherForecast[]){
    this.weatherForecasts.next(data);
  }

  getWeatherForecasts(){
    return this._weatherForecasts$
  }
}
