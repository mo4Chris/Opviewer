import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MetoceanForecastListView } from './metocean-forecast-list-view.types';
import { WeatherForecastDialogUtilsService } from './weather-forecast-dialog-utils.service';
import { startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-weather-forecast-dialog',
  templateUrl: './weather-forecast-dialog.component.html',
  styleUrls: ['./weather-forecast-dialog.component.scss'],
})
export class WeatherForecastDialogComponent implements OnInit {
  @Input() fromParent: MetoceanForecastListView[];
  form: FormGroup;
  filteredFormValues$: Observable<MetoceanForecastListView[]>;
  constructor(public activeModal: NgbActiveModal, private weatherForecastDialogUtilsService: WeatherForecastDialogUtilsService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this._createForm()
    const forecastListView$ = of(this.fromParent)
    const filter$ = this.form.valueChanges.pipe(startWith(''));
    this.filteredFormValues$ = this.weatherForecastDialogUtilsService.getFilteredFormValues(forecastListView$, filter$)

  }

  private _createForm(){
    this.form = this.formBuilder.group({
      filter: ['']
    })
    this.fromParent.forEach(forecast => {
      this.form.addControl(forecast.File_Id, new FormControl(false))
    })

  }

  submitForm() {
    const selectedIds = this.weatherForecastDialogUtilsService.getSelectedIds(this.form.value)
    this.activeModal.close(selectedIds);
  }
}
