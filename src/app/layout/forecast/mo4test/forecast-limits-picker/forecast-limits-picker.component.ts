import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Dof6, ForecastLimit } from '../../models/forecast-response.model';


@Component({
  selector: 'app-forecast-limits-picker',
  templateUrl: './forecast-limits-picker.component.html',
  styleUrls: ['./forecast-limits-picker.component.scss']
})
export class ForecastLimitsPickerComponent implements OnChanges {
  @Input() limits: ForecastLimit[] = [];
  // Angular magic: this represents the outgoing element corresponding to our 2-way binding of limits
  @Output() limitsChange = new EventEmitter<ForecastLimit[]>(); 
  constructor() {
  }

  limitsCopy: ForecastLimit[] = [];

  ngOnChanges() {
    console.log('Change detected!')
    if (this.limits) {
      this.limitsCopy = this.limits.map(l => l);
    } else {
      this.limitsCopy = [];
    }
  }

  public onConfirm() {
    console.log('Updating limits!')
    this.limitsChange.emit(this.limits)
  }
  public onAddLine() {
    this.limitsCopy.push({
      type: null,
      dof: null,
      value: null,
    })
  }
  public onRemoveLine() {
    this.limitsCopy.pop();
  }
}
