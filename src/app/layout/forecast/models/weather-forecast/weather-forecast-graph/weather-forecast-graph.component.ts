import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WeatherForecastDialogComponent } from '../weather-forecast-dialog/weather-forecast-dialog.component';
import { WeatherForecastUtilsService } from '../weather-forecast-utils.service';
import { WeatherForecast } from '../weather-forecast.types';

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
    private weatherForecastService: WeatherForecastUtilsService,
    private modalService: NgbModal, 
    private commonService: CommonService

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
        this.form.setValue({
          selectedForecast: data[0]?.weather_forecast_id ?? '',
          selectedView: 'general'
        })
      }),
      )
      this.selectedWeatherForecast$ = this.form.valueChanges
    }
    
    private _createForm(){
      this.form = this.formBuilder.group({
        selectedForecast: ['', Validators.required],
        selectedView: ['', Validators.required]
      })
    }

    onChooseWeatherForecast(){
      this.weatherForecastService.getMetoceanForecasts().pipe(
        switchMap((data)=>{
          const modalRef = this.modalService.open(WeatherForecastDialogComponent, { centered: true });
          modalRef.componentInstance.fromParent = data;
          return modalRef.result
        }),
        switchMap((selectedIds: string[])=>{
          const listOfCalls = []
          selectedIds.forEach(id =>{
            listOfCalls.push(this.commonService.getSpecificWeatherForecasts(id))          
          })
            return <Observable<WeatherForecast[]>>forkJoin(listOfCalls)
        })
      ).subscribe(data =>{
        this.weatherForecastCommunicationService.updatedSelectedWeatherForecasts(data);
      })
    }
}
