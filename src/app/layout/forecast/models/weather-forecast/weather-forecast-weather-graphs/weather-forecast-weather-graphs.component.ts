import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
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
  @Input() selectedForecast;

  constructor(private weatherForecastCommunicationService: WeatherForecastCommunicationService, private weatherForecastWeatherGraphService: WeatherForecastWeatherGraphsService) { }
  
  ngOnInit(): void {
    console.log('lalallaa')
    this.selectedForecast.subscribe(date => console.log(date));
    this.weatherForecasts$ =this._getWeatherForecast()
  }

  private _getWeatherForecast(){
    return this.selectedForecast.pipe(
      filter((val: any) => val.selectedView === 'general'),
      switchMap((val: any)=>{
        console.log(val)
      return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
          map( weatherForecasts => {
            return weatherForecasts.filter(forecast => forecast.General.Routename.Data === val.selectedForecast)
          }),
          map(weaterForecasts => {
            return weaterForecasts.map(weatherForecast =>{
              return this.weatherForecastWeatherGraphService.factorDailyWeatherForecastData(weatherForecast)
            })
          })
        )
      })
    )
 
  }
}
