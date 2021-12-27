import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WEATHER_FORECAST_TYPE } from '../weather-forecast.types';
import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph.service';

@Component({
  selector: 'app-weather-forecast-wave-height-graph',
  templateUrl: './weather-forecast-wave-height-graph.component.html',
  styleUrls: ['./weather-forecast-wave-height-graph.component.scss']
})
export class WeatherForecastWaveHeightGraphComponent implements OnInit {
  waveHeightType = WEATHER_FORECAST_TYPE.HS
  public plotLayout: Partial<Plotly.Layout>;
  waveHeightInformation$: Observable<unknown>;

  constructor(private weatherForecastService: WeatherForecastWaveHeightGraphService, private weatherForecastCommunicationService: WeatherForecastCommunicationService) { }

  ngOnInit(): void {
    this.waveHeightInformation$ = this.fetchData(this.waveHeightType);
  }


  fetchData(waveHeightType) {
    return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      filter(data => data.length != 0),
      map(data => {
        return this.weatherForecastService.getPlotData(data, waveHeightType)
      })
    )
  }

  toggleWaveGraph(waveType) {
    this.waveHeightType = waveType === WEATHER_FORECAST_TYPE.HS ? WEATHER_FORECAST_TYPE.HMAX : WEATHER_FORECAST_TYPE.HS;
    this.waveHeightInformation$ = this.fetchData(this.waveHeightType);
  }

}
