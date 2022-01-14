import { Component, OnInit } from '@angular/core';
import { filter, map, tap } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph.service';
import { WEATHER_FORECAST_WIND_TYPE } from './weather-forecast-wind-speed-graph.types';

@Component({
  selector: 'app-weather-forecast-wind-speed-graph',
  templateUrl: './weather-forecast-wind-speed-graph.component.html',
  styleUrls: ['./weather-forecast-wind-speed-graph.component.scss']
})
export class WeatherForecastWindSpeedGraphComponent implements OnInit {
  speed = WEATHER_FORECAST_WIND_TYPE.SPEED;
  gust = WEATHER_FORECAST_WIND_TYPE.GUST;
  public plotLayout: Partial<Plotly.Layout>;
  windGraphInformation$
  weatherForecastWindType = this.speed;
  degreesClass: any;
  windDegreesInformation: any[];
  
  constructor(
    private weatherForecastService: WeatherForecastWindSpeedGraphService, 
    private weatherForecastCommunicationService: WeatherForecastCommunicationService) { }

  ngOnInit(): void {
    this.windGraphInformation$ =  this.fetchData(this.weatherForecastWindType)
  }

  fetchData(windType: string){
    return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      filter(data => data.length != 0),
      map(data =>{
        return this.weatherForecastService.getPlotData(data, windType)
      }),
      tap(data =>{
        this.windDegreesInformation = 
        data.data.map((data) =>{
          const weatherForecast = data.meta.weatherForecastWind[0]
          return {
            metaInfo: {...data.meta.generalInformation, weatherForecast},
            degreesClass: `from-${weatherForecast.directions.val}-deg`
          }
        })
      })
    )}

    onSelectType(type){
      this.weatherForecastWindType = type;
      this.windGraphInformation$ = this.fetchData(type);
  }

  onHover(event){
    this.windDegreesInformation = event.points.map(point =>{
      const weatherForecast = point.data.meta.weatherForecastWind[point.pointIndex]
      return {
        metaInfo: { weatherForecast, ...point.data.meta.generalInformation},
        degreesClass: `from-${weatherForecast.directions.val}-deg`,
      }
    })
  }
}
