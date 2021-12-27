import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherForecastComponent } from './weather-forecast.component';
import { WeatherForecastUtilsService } from './weather-forecast-utils.service';
import { PlotlyModule } from 'angular-plotly.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WeatherForecastDialogComponent } from './weather-forecast-dialog/weather-forecast-dialog.component';
import { WeatherForecastGraphComponent } from './weather-forecast-graph/weather-forecast-graph.component';
import { WeatherForecastWaveHeightGraphComponent } from './weather-forecast-wave-height-graph/weather-forecast-wave-height-graph.component';
import { WeatherForecastWindSpeedGraphComponent } from './weather-forecast-wind-speed-graph/weather-forecast-wind-speed-graph.component';
import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph/weather-forecast-wave-height-graph.service';
import { WeatherForecastCommunicationService } from './weather-forecast-communication.service';
import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph/weather-forecast-wind-speed-graph.service';
import { WeatherForecastWeatherGraphComponent } from './weather-forecast-weather-graphs/weather-forecast-weather-graph/weather-forecast-weather-graph.component';
import { WeatherForecastWeatherGraphsComponent } from './weather-forecast-weather-graphs/weather-forecast-weather-graphs.component';
import { WeatherForecastWeatherGraphsService } from './weather-forecast-weather-graphs/weather-forecast-weather-graphs.service';
import { WeatherForecastDialogUtilsService } from './weather-forecast-dialog/weather-forecast-dialog-utils.service';


@NgModule({
  declarations: [WeatherForecastComponent, WeatherForecastDialogComponent, WeatherForecastGraphComponent, WeatherForecastWaveHeightGraphComponent, WeatherForecastWindSpeedGraphComponent, WeatherForecastWeatherGraphComponent, WeatherForecastWeatherGraphsComponent],
  imports: [
    CommonModule,
    PlotlyModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule
  ],
  providers: [WeatherForecastUtilsService, WeatherForecastWaveHeightGraphService,WeatherForecastCommunicationService, WeatherForecastWindSpeedGraphService, WeatherForecastWeatherGraphsService, WeatherForecastDialogUtilsService],
  exports: [WeatherForecastComponent]
})
export class WeatherForecastModule { }
