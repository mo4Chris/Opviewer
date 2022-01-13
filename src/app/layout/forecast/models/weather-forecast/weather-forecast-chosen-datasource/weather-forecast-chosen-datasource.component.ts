import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WeatherForecastGraphComponent } from '../weather-forecast-graph/weather-forecast-graph.component';

@Component({
  selector: 'app-weather-forecast-chosen-datasource',
  templateUrl: './weather-forecast-chosen-datasource.component.html',
  styleUrls: ['./weather-forecast-chosen-datasource.component.scss']
})
export class WeatherForecastChosenDatasourceComponent implements OnInit {

  constructor(
    private weatherForecastCommunicationService: WeatherForecastCommunicationService,
    private weatherForecastGraphComponent: WeatherForecastGraphComponent
  ) { }

  selectedForecasts$;
  radioSelected = 'general';

  ngOnInit(): void {
    this.selectedForecasts$ = 
    this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      map((responses) => responses.map(response => ({
        weather_provider: response.General.Forecaster.Data,
      })))
    )
  }

  getValueRadioSelected() {
    return this.radioSelected;
  }

  submitViewSelection(radioSelected) {
    this.weatherForecastGraphComponent.updateView(radioSelected);
  }

}
