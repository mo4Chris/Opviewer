import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph.service';
import { WEATHER_FORECAST_WAVE_TYPE } from './weather-forecast-wave-height-graph.types';

@Component({
  selector: 'app-weather-forecast-wave-height-graph',
  templateUrl: './weather-forecast-wave-height-graph.component.html',
  styleUrls: ['./weather-forecast-wave-height-graph.component.scss']
})
export class WeatherForecastWaveHeightGraphComponent implements OnInit {
  waveHeightType = WEATHER_FORECAST_WAVE_TYPE.HS
  public plotLayout: Partial<Plotly.Layout>;
  waveHeightInformation$: Observable<unknown>;
  waveHeightInfo: any;
  @Input() selectedForecast;
  selectedForecast$: any;

  constructor(private weatherForecastService: WeatherForecastWaveHeightGraphService, private weatherForecastCommunicationService: WeatherForecastCommunicationService) { }

  ngOnInit(): void {
    this.selectedForecast$ = this.selectedForecast.pipe(
      map((val: any) => {
        return {
          showPage : val.selectedView === 'waves'
        }
      })
    )

    this.waveHeightInformation$ = this.fetchData(this.waveHeightType);
  }

  fetchData(waveHeightType) {
    return this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      map(data => {
        return this.weatherForecastService.getPlotData(data, waveHeightType)
      }),
      tap(data => {
        this.waveHeightInfo =
          data.data.map((data) => {
            const weatherForecast = data.meta.waveWeatherForecast[0]
            return {
              metaInfo: { ...data.meta.generalInformation, weatherForecast },
            }
          })
      })
    )
  }

  onHover(event) {
    this.waveHeightInfo = event.points.map(point => {
      const weatherForecast = point.data.meta.waveWeatherForecast[point.pointIndex]
      return {
        metaInfo: { weatherForecast, ...point.data.meta.generalInformation },
      }
    })
  }

  onSelectType(type) {
    this.waveHeightType = type;
    this.waveHeightInformation$ = this.fetchData(this.waveHeightType);
  }

}