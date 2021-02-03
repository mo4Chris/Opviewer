import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
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

  public date: string;
  public startTime: string;
  public stopTime: string;

  constructor(
    private dateService: DatetimeService,
  ) {
  }

  public get hasSelectedOperation() {
    return !!this.selectedOperation
  }

  ngOnChanges() {
    let opsIds = this.operations ? this.operations.map(op => op.id) : [];
    if (!this.selectedOperation || (this.selectedOperation.id in opsIds)) {
      this.selectedOperation = this.operations ? this.operations[0] : null;
    }
    if (this.selectedOperation) {
      this.onNewSelectedOperation();
    }
  }
  onNewSelectedOperation() {
    this.startTime = this.formatTime(this.selectedOperation.activation_start_date)
    this.stopTime = this.formatTime(this.selectedOperation.activation_end_date)
  }
  onChange() {
    this.selectedOperationChange.emit(this.selectedOperation);
    this.onNewSelectedOperation();
  }

  formatTime(t: string) {
    return this.dateService.isoStringToDmyString(t);
  }
}