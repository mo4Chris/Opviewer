import { Component, OnInit } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WEATHER_FORECAST_TYPE } from '../weather-forecast.types';
import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph.service';

@Component({
  selector: 'app-weather-forecast-wind-speed-graph',
  templateUrl: './weather-forecast-wind-speed-graph.component.html',
  styleUrls: ['./weather-forecast-wind-speed-graph.component.scss']
})
export class WeatherForecastWindSpeedGraphComponent implements OnInit {
  windType = WEATHER_FORECAST_TYPE.SPEED;
  public plotLayout: Partial<Plotly.Layout>;
  windGraphInformation$
  
  constructor(
    private weatherForecastService: WeatherForecastWindSpeedGraphService, 
    private weatherForecastCommunicationService: WeatherForecastCommunicationService) { }

  ngOnInit(): void {
    this.windGraphInformation$ =  this.fetchData(this.windType)
  }

  fetchData(windType: string){
    return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      filter(data => data.length != 0),
      map(data =>{
        return this.weatherForecastService.getPlotData(data, windType)
      })
    )}

  toggleWindGraph(windType){
    this.windType = windType === WEATHER_FORECAST_TYPE.SPEED ? WEATHER_FORECAST_TYPE.GUST : WEATHER_FORECAST_TYPE.SPEED;
    this.windGraphInformation$ = this.fetchData(this.windType);
  }
}
