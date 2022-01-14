import { Component} from '@angular/core';
import { CommonService } from '@app/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { WeatherForecastCommunicationService } from './weather-forecast-communication.service';
import { WeatherForecastDialogComponent } from './weather-forecast-dialog/weather-forecast-dialog.component';
import { WeatherForecastUtilsService } from './weather-forecast-utils.service';
import { WeatherForecast } from './weather-forecast.types';


@Component({
  selector: 'app-weather-forecast',
  templateUrl: './weather-forecast.component.html',
  styleUrls: ['./weather-forecast.component.scss']
})
export class WeatherForecastComponent {
  constructor(private weatherForecastService: WeatherForecastUtilsService, private weatherForecastCommunicationService: WeatherForecastCommunicationService,private modalService: NgbModal, private commonService: CommonService) { }

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
          // temoporarely random json files
          // const randomInt = Math.floor(Math.random() * 3);
          // if(randomInt === 0){
          //   const metocean1: any = require('./example_metocean.json');
          //   listOfCalls.push(of(metocean1))
          // }
          // if(randomInt === 1){
          //   const metocean2: any = require('./example_metocean2.json');
          //   listOfCalls.push(of(metocean2))
          // }
          // if(randomInt === 2){
          //   const metocean3: any = require('./example_metocean3.json');
          //   listOfCalls.push(of(metocean3))
          // }
          
        })
          return <Observable<WeatherForecast[]>>forkJoin(listOfCalls)
      })
    ).subscribe(data =>{
      this.weatherForecastCommunicationService.updatedSelectedWeatherForecasts(data);
    })
  }

}