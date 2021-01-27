import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DatetimeService } from '@app/supportModules/datetime.service';
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
    private dateService: DatetimeService
  ) {
  }

  public get hasSelectedOperation() {
    return !!this.selectedOperation
  }

  ngOnChanges() {
    let opsIds = this.operations ? this.operations.map(op => op.id) : [];
    if (!this.selectedOperation || (this.selectedOperation.id in opsIds)) {
      this.selectedOperation = this.operations ? this.operations[0] : null;
      this.onNewSelectedOperation();
    }
  }

  onNewSelectedOperation() {
    this.startTime = this.formatTime(this.selectedOperation.activation_start_date)
    this.stopTime = this.formatTime(this.selectedOperation.activation_end_date)
  }

  onChange() {
    console.log(this.selectedOperation)
    this.selectedOperationChange.emit(this.selectedOperation);
    this.onNewSelectedOperation();
  }

  private formatTime(timeString: string) {
    let re = /(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})/
    let result = re.exec(timeString)
    if (result) {
      return `${result[3]}-${result[2]}-${result[1]} ${result[4]}`
    } else {
      return 'N/a'
    }
  }
}