import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { ForecastLimit, ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() projects: ForecastOperation[] = [];
  @Input() selectedProject: ForecastOperation;
  @Input() minForecastDate: YMD;
  @Input() maxForecastDate: YMD;
  @Output() selectedProjectChange: EventEmitter<ForecastOperation> = new EventEmitter();
  @Output() operationSettings = new EventEmitter<ForecastOperationSettings>()

  public date: YMD;
  public projectStartDate: string;
  public projectStopDate: string;
  public startTime: string;
  public stopTime: string;
  public startTimeInput = {hour: null, mns: null}
  public stopTimeInput = {hour: null, mns: null}
  public limits: ForecastLimit[] = [];
  public heading = 0;

  constructor(
    private dateService: DatetimeService,
    public gps: GpsService,
    public permission: PermissionService,
  ) {
  }

  public get hasSelectedOperation() {
    return Boolean(this.selectedProject)
  }

  ngOnChanges(change: SimpleChanges = {}) {
    const operationIds = this.projects ? this.projects.map(op => op.id) : [];
    console.log(operationIds)
    if (!this.selectedProject || (this.selectedProject.id in operationIds)) {
      this.selectedProject = this.projects ? this.projects[0] : null;
    }
    console.log('this.selectedProject', this.selectedProject)
    if (this.selectedProject) this.onNewSelectedOperation();
    if (change.minForecastDate) this.date = this.minForecastDate;
  }
  onNewSelectedOperation() {
    this.projectStartDate = this.formatTime(this.selectedProject.activation_start_date)
    this.projectStopDate = this.formatTime(this.selectedProject.activation_end_date);
  }

  private formatTime(t: string) {
    return this.dateService.isoStringToDmyString(t);
  }

  public onOpsChange() {
    this.selectedProjectChange.emit(this.selectedProject);
    this.onNewSelectedOperation();
  }
  public onTimeChange() {

  }
  public onAddLimitsLine() {
    this.limits.push({
      type: null,
      dof: null,
      value: null,
    })
  }
  public onRemoveLimitsLine() {
    this.limits.pop();
  }
  public onConfirm () {
    this.heading = Math.max(Math.min(this.heading, 360), 0);
    this.operationSettings.emit({
      heading: this.heading,
      startTime: +this.startTime,
      stopTime: +this.stopTime,
      limits: this.limits,
    })
  }
}


interface YMD {
  year: number;
  month: number;
  day: number;
}

interface ForecastOperationSettings {
  heading: number;
  startTime: number;
  stopTime: number;
  limits: any;
}
