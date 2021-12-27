import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { orderBy } from 'lodash';
import { map } from 'rxjs/operators';
import { MetoceanForecastListView } from './metocean-forecast-list-view.types';
@Injectable()
export class WeatherForecastDialogUtilsService {

  constructor() { }

  getSelectedIds(formValue): string[] {
    const formValues = Object.entries(formValue)
    return formValues.map(([key, value]) =>{
      return value ? key: undefined;
    }).filter(Boolean)
  }

  getFilterRelatedContent(forecastListView, valueChange): Observable<MetoceanForecastListView[]>{
    return forecastListView.filter(list => {
      return list.Received_On.toString().includes(valueChange.filter);
    })
  }

  getFilteredFormValues(forecastListView$, filter$): Observable<MetoceanForecastListView[]>{
    return combineLatest([forecastListView$, filter$]).pipe(
      map(([_forecastListView, valueChange]) => {
        if (valueChange) {
          const result = this.getFilterRelatedContent(_forecastListView, valueChange)
          return orderBy(result, ['Received_On'], ['desc'])

        }
        return orderBy(_forecastListView, ['Received_On'], ['desc'])
      }),
    )
  }
}
