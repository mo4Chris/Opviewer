import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MetoceanForecastListView } from './weather-forecast-dialog/metocean-forecast-list-view.types';

@Injectable()
export class WeatherForecastUtilsService {

  getMetoceanForecasts(): Observable<MetoceanForecastListView[]>{
    const allData: any = require('./example_metoceanview.json');
    return of(allData)
  }
}
