import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';

@Component({
  selector: 'app-weather-forecast-graph',
  templateUrl: './weather-forecast-graph.component.html',
  styleUrls: ['./weather-forecast-graph.component.scss']
})
export class WeatherForecastGraphComponent implements OnInit {
  form: FormGroup;
  selectedForecasts$: any;
  selectedWeatherForecast$: any;

  constructor(
    private formBuilder: FormBuilder,
    private weatherForecastCommunicationService: WeatherForecastCommunicationService,
    private dateTimeService: DatetimeService,
    )  {}
  
  ngOnInit(): void {
    this._createForm()
    this.selectedForecasts$ = 
    this.weatherForecastCommunicationService.getWeatherForecasts().pipe(
      map((responses) => responses.map(response => ({
        weather_forecast_id: response.General.Routename.Data,
        weather_provider: response.General.Forecaster.Data,
        weather_forecast_time: this.dateTimeService.matlabDatenumToYmdHmString(response.General.RefDateNum.Data)
      }))),
      tap(data =>{
        //find solution to handle selectedForecast
        this.form.setValue({
          selectedForecast: data[0]?.weather_forecast_id ?? '',
          selectedView: 'general'
        })
        this.selectedWeatherForecast$ = this.form.valueChanges.pipe(startWith(this.form.value))
      }),
      )
    }
    
    private _createForm(){
      this.form = this.formBuilder.group({
        selectedForecast: ['', Validators.required],
        selectedView: ['', Validators.required]
      })
     

    }
  submit(){
  }

}
