import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ForecastOperation } from '../../models/forecast-response.model';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() operations: ForecastOperation[] = [];
  @Input() selectedOperation: ForecastOperation;
  @Output() selectedOperationChange: EventEmitter<ForecastOperation> = new EventEmitter();

  constructor() {
  }

  ngOnChanges() {
    let opsIds = this.operations ? this.operations.map(op => op.id) : [];
    if (!this.selectedOperation || (this.selectedOperation.id in opsIds)) {
      this.selectedOperation = this.operations ? this.operations[0] : null;
    }
  }

  onChange() {
    this.selectedOperationChange.emit(this.selectedOperation);
  }

}
