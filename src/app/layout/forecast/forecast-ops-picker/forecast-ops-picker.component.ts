import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ForecastLimit, ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() projects: ForecastOperation[] = [];
  @Input() selectedProjectId: number;
  @Input() minForecastDate: YMD;
  @Input() maxForecastDate: YMD;
  @Input() heading = 0;
  @Output() headingChange = new EventEmitter<number>()
  @Output() onChange = new EventEmitter<ForecastOperationSettings>()

  public selectedProject: ForecastOperation;
  public date: YMD;
  public projectStartDate: string;
  public projectStopDate: string;

  public startTime: number;
  public stopTime: number;
  public startTimeInput = {hour: null, mns: null}
  public stopTimeInput = {hour: null, mns: null}
  public formattedDuration: string;

  public limits: ForecastLimit[] = [];

  constructor(
    private dateService: DatetimeService,
    private routerService: RouterService,
    public gps: GpsService,
    public permission: PermissionService,
  ) {
  }

  public get hasSelectedOperation() {
    return this.selectedProjectId != null
  }

  ngOnChanges(changes: SimpleChanges = {}) {
    const operationIds = this.projects ? this.projects.map(op => op.id) : [];
    if (!this.selectedProjectId || (this.selectedProjectId in operationIds)) {
      console.log('No selected project provided')
      // this.selectedProjectId = 0;
    }
    console.log('this.selectedProjectId', this.selectedProjectId)
    if (this.selectedProjectId) this.onNewSelectedOperation();
    if (changes.minForecastDate) this.date = this.minForecastDate;
  }
  onNewSelectedOperation() {
    this.selectedProject = this.projects.find(project => project.id == this.selectedProjectId)
    this.projectStartDate = this.formatTime(this.selectedProject.activation_start_date)
    this.projectStopDate = this.formatTime(this.selectedProject.activation_end_date);
  }

  private formatTime(t: string) {
    return this.dateService.isoStringToDmyString(t);
  }

  public onHeadingChange() {
    this.heading = this.heading % 360;
    this.headingChange.emit(this.heading);
  }
  public onOpsChange() {
    this.routerService.routeToForecast(this.selectedProjectId)
  }
  public onTimeChange() {
    if ( this.date
      && inRange(this.startTimeInput.hour, 0, 24)
      && inRange(this.startTimeInput.mns, 0, 59)
      && inRange(this.stopTimeInput.hour, 0, 24)
      && inRange(this.stopTimeInput.mns, 0, 59)
    ) {
      const matlabDate = this.dateService.ngbDateToMatlabDatenum(this.date as NgbDate);
      this.startTime = matlabDate + this.startTimeInput.hour/24 +this.startTimeInput.mns/24/60;
      this.stopTime = matlabDate + this.stopTimeInput.hour/24 +this.stopTimeInput.mns/24/60;
      const duration = this.stopTime - this.startTime;
      this.formattedDuration = this.dateService.formatMatlabDuration(duration)
    }
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
    this.onChange.emit({
      startTime: this.startTime,
      stopTime: this.stopTime,
      limits: this.limits,
    })
  }
}

function inRange(obj: any, min = 0, max = 100) {
  return typeof(obj) == 'number' && obj>0 && obj<max;
}


interface YMD {
  year: number;
  month: number;
  day: number;
}

export interface ForecastOperationSettings {
  // heading: number;
  startTime: number;
  stopTime: number;
  limits: any;
}
