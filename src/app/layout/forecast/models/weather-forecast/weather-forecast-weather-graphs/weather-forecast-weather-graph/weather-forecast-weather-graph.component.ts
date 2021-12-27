import { Component, Input, OnInit } from '@angular/core';
import { DayReport } from '../weather-forecast.types';
@Component({
  selector: 'app-weather-forecast-weather-graph',
  templateUrl: './weather-forecast-weather-graph.component.html',
  styleUrls: ['./weather-forecast-weather-graph.component.scss']
})
export class WeatherForecastWeatherGraphComponent implements OnInit {
  @Input() weatherForecast: DayReport[]
  selectedWFindex = 0;
  disableNextButton= false;
  disableBackButton= false;
  dayReport: DayReport;
  ngOnInit(): void {
    this.dayReport = this.weatherForecast[this.selectedWFindex];
    this.disableBackButton = this.shouldDisableBackButton(this.selectedWFindex);
    this.disableNextButton = this.shouldDisableNextButton(this.selectedWFindex, this.weatherForecast);
  }


  previousWeatherForecast(weatherForecast){
    this.selectedWFindex--
    this.disableBackButton = this.shouldDisableBackButton(this.selectedWFindex)
    this.disableNextButton = this.shouldDisableNextButton(this.selectedWFindex, weatherForecast)
    this.dayReport = this.weatherForecast[this.selectedWFindex]
  }
  
  nextWeatherForecast(weatherForecast){
    this.selectedWFindex++
    this.disableNextButton = this.shouldDisableNextButton(this.selectedWFindex, weatherForecast)
    this.disableBackButton = this.shouldDisableBackButton(this.selectedWFindex)
    this.dayReport = this.weatherForecast[this.selectedWFindex]
  }
  
  onSelectDayReport(i, weatherForecast){
    this.selectedWFindex = i;
    this.disableNextButton = this.shouldDisableNextButton(this.selectedWFindex, weatherForecast)
    this.disableBackButton = this.shouldDisableBackButton(this.selectedWFindex)
    this.dayReport = this.weatherForecast[this.selectedWFindex]

  }

  shouldDisableBackButton(selectedWFindex){
    return selectedWFindex <= 0;
  }

  shouldDisableNextButton(selectedWFindex, weatherForecast){
    return selectedWFindex >= weatherForecast.length - 1;
  }

}
