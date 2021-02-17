import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
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
  @Output() operationSettings = new EventEmitter<ForecastOperationSettings>()
  @Output() headingChange = new EventEmitter<number>();

  public selectedProject: ForecastOperation;
  public date: YMD;
  public projectStartDate: string;
  public projectStopDate: string;

  public startTime: string;
  public stopTime: string;
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

  ngOnChanges(change: SimpleChanges = {}) {
    const operationIds = this.projects ? this.projects.map(op => op.id) : [];
    if (!this.selectedProjectId || (this.selectedProjectId in operationIds)) {
      console.log('No selected project provided')
      // this.selectedProjectId = 0;
    }
    console.log('this.selectedProjectId', this.selectedProjectId)
    if (this.selectedProjectId) this.onNewSelectedOperation();
    if (change.minForecastDate) this.date = this.minForecastDate;
  }
  onNewSelectedOperation() {
    this.selectedProject = this.projects.find(project => project.id == this.selectedProjectId)
    this.projectStartDate = this.formatTime(this.selectedProject.activation_start_date)
    this.projectStopDate = this.formatTime(this.selectedProject.activation_end_date);
  }

  private formatTime(t: string) {
    return this.dateService.isoStringToDmyString(t);
  }

  public onOpsChange() {
    this.routerService.routeToForecast(this.selectedProjectId)
  }
  public onTimeChange() {
    if (this.date
      && isValidNumber(this.startTimeInput.hour, 0, 24)
      && isValidNumber(this.startTimeInput.mns, 0, 24)
      && isValidNumber(this.stopTimeInput.hour, 0, 24)
      && isValidNumber(this.stopTimeInput.mns, 0, 24)
    ) {
      this.formattedDuration = '';
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
    this.operationSettings.emit({
      heading: this.heading,
      startTime: +this.startTime,
      stopTime: +this.stopTime,
      limits: this.limits,
    })
    this.headingChange.emit(this.heading);
  }
}

function isValidNumber(obj: any, min = 0, max = 100) {
  return typeof(obj) == 'number' && obj>0 && obj<max;
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
