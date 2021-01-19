import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-forecast-limits-picker',
  templateUrl: './forecast-limits-picker.component.html',
  styleUrls: ['./forecast-limits-picker.component.scss']
})
export class ForecastLimitsPickerComponent implements OnChanges {
  @Input() limits: ForecastLimit[] = [];
  // Angular magic: this represents the outgoing element corresponding to our 2-way binding of limits
  @Output() limitsChange = new EventEmitter<ForecastLimit[]>(); 
  constructor() { }

  limitsCopy = [];

  ngOnChanges() {
    console.log('Change detected!')
    if (this.limits) {
      this.limitsCopy = this.limits.map(l => l);
    } else {
      this.limitsCopy = [];
    }
  }

  onConfirm() {
    console.log('Updating limits!')
    this.limitsChange.emit(this.limits)
  }
}

export interface ForecastLimit {
  name: string;
  value: number;
}