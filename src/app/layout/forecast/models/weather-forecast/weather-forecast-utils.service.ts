import { Injectable } from '@angular/core';
import { CommonService } from '@app/common.service';
import { of } from 'rxjs';
@Injectable()
export class WeatherForecastUtilsService {

  constructor(private commonService: CommonService){}

  getMetoceanForecasts(){
    return this.commonService.getWeatherForecasts();
  }
  
}
