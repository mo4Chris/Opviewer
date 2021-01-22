import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnInit {
  @Input() operations = ['Op1', 'Op2'];
  @Output() operationsChanged = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
