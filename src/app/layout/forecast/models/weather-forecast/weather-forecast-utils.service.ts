import { Injectable } from '@angular/core';
import { CommonService } from '@app/common.service';
import { of } from 'rxjs';
@Injectable()
export class WeatherForecastUtilsService {

  constructor(private commonService: CommonService){}

  getMetoceanForecasts(){
    // const allData: any = require('./example_metoceanview.json');
    // return of(allData)
    const response = this.commonService.getWeatherForecasts();
    return response
  }
}
