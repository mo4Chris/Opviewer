import { Component, OnInit } from '@angular/core';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-weather-forecast-chosen-forecasts',
  templateUrl: './weather-forecast-chosen-forecasts.component.html',
  styleUrls: ['./weather-forecast-chosen-forecasts.component.scss']
})
export class WeatherForecastChosenForecastsComponent implements OnInit {

  constructor(
    private weatherForecastCommunicationService: WeatherForecastCommunicationService,
    private dateTimeService: DatetimeService
  ) { }

  selectedForecasts$;
  radioSelected = '';

  ngOnInit(): void {
    this.selectedForecasts$ = 
    this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      map((responses) => responses.map(response => ({
        weather_forecast_id: response.General.Routename.Data,
        weather_provider: response.General.Forecaster.Data,
        weather_forecast_time: this.dateTimeService.matlabDatenumToYmdHmString(response.General.RefDateNum.Data)
      })))
    )
  }

  submitForecastSelection(selectedForecast){
    console.log(selectedForecast)
  }

}
