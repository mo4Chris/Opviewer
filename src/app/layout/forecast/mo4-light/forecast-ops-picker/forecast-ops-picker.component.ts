import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ForecastMotionLimit } from '../../models/forecast-limit';
import { ForecastOperation, ForecastExpectedResponsePreference } from '../../models/forecast-response.model';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() projects: ForecastOperation[] = [];
  @Input() lastUpdated: string;
  @Input() vessels: any[];
  @Input() selectedProjectId: number;
  @Input() minForecastDate: YMD; // From Response
  @Input() maxForecastDate: YMD; // From Response

  @Input() heading = 0;
  @Input() limits: ForecastMotionLimit[] = [];

  @Output() headingChange = new EventEmitter<number>();
  @Output() onChange = new EventEmitter<ForecastOperationSettings>();

  public selectedProject: ForecastOperation;
  public date: YMD;

  public startTime: number;
  public stopTime: number;
  public startTimeInput = {hour: null, mns: <any> '00'};
  public stopTimeInput = {hour: null, mns: <any> '00'};
  public formattedDuration: string;

  private operationTimeChanged = false;
  private headingChanged = false;
  private limitChanged = false;

  public get settingsChanged() {
    return this.operationTimeChanged
      || this.headingChanged
      || this.limitChanged;
  }

  constructor(
    private dateService: DatetimeService,
    private routerService: RouterService,
    private alert: AlertService,
    private newService: CommonService,
    public gps: GpsService,
    public permission: PermissionService,
  ) {
  }

  public get hasSelectedOperation() {
    return this.selectedProjectId != null;
  }
  public get timeValid() {
    return this.stopTime && this.startTime && this.stopTime > this.startTime;
  }
  public get selectedVesselName() {
    const vessel_id = this.selectedProject?.vessel_id;
    const vessel = this?.vessels?.find(vessel => vessel.id === vessel_id);
    return vessel?.type || 'N/a';
  }

  ngOnChanges(changes: SimpleChanges = {}) {
    if (changes.minForecastDate) this.date = this.minForecastDate;
    if (this.selectedProjectId) this.onNewSelectedOperation();
  }
  onNewSelectedOperation() {
    this.selectedProject = this.projects.find(project => project.id === this.selectedProjectId);
    this.startTimeInput = parseTimeString(this.selectedProject?.client_preferences?.Ops_Start_Time)
    this.stopTimeInput = parseTimeString(this.selectedProject?.client_preferences?.Ops_Stop_Time)
    this.updateOperationTimes()
    this.onChange.emit({
      startTime: this.startTime,
      stopTime: this.stopTime,
    });
  }
  public onHeadingChange() {
    this.headingChanged = true;
    this.heading = this.heading % 360;
    this.headingChange.emit(this.heading);
  }
  public onOpsChange() {
    this.routerService.routeToForecast(this.selectedProjectId);
  }
  public onTimeChange(change?: any) {
    this.operationTimeChanged = true;
    if ( !this.date
      || !inRange(+this.startTimeInput.hour, 0, 24)
      || !inRange(+this.startTimeInput.mns, 0, 59)
      || !inRange(+this.stopTimeInput.hour, 0, 24)
      || !inRange(+this.stopTimeInput.mns, 0, 59)
    ) return;
    this.updateOperationTimes();
  }
  public onLimitsChange() {
    this.limitChanged = true;
  }
  public onAddLimitsLine() {
    this.limitChanged = true;
    this.limits.push(new ForecastMotionLimit());
  }
  public onRemoveLimitsLine() {
    this.limitChanged = true;
    this.limits.pop();
  }
  public onConfirm () {
    // if (!this.timeValid) { return this.alert.sendAlert({text: 'Invalid operation time selection!', type: 'danger'}); }
    this.heading = Math.max(Math.min(this.heading, 360), 0);
    this.onChange.emit({
      startTime: this.startTime,
      stopTime: this.stopTime,
      limits: this.limits,
    });
    this.headingChanged = false;
    this.limitChanged = false;
    this.operationTimeChanged = false;
    this.saveProjectConfigChanges()
  }
  public appendLeadingZeros(event: any) {
    const input: HTMLInputElement = event.srcElement;
    if (!isNaN(+input.value) && input.value.length === 1) {
      input.value = '0' + input.value;
    }
  }

  saveProjectConfigChanges() {
    const old_preferences = this.selectedProject.client_preferences;
    const new_preferences: ForecastExpectedResponsePreference = {
      Points_Of_Interest: old_preferences.Points_Of_Interest,
      Max_Type: 'MPM',
      Ops_Start_Time: formatTime(this.startTimeInput),
      Ops_Stop_Time: formatTime(this.stopTimeInput),
      Ops_Heading: this.heading,
      Points: old_preferences.Points,
      Limits: <any> this.limits.map(_limit => _limit.toObject()),
      Degrees_Of_Freedom: old_preferences.Degrees_Of_Freedom
    }
    this.selectedProject.client_preferences = <any> new_preferences;
    this.newService.saveForecastProjectSettings(this.selectedProject).subscribe({
      // @Chris, this is how we are supposed to use subscribe now... subscribe(next => {}, err =>{}) is depricated
      next: () => {},
      error: err => {
        this.alert.sendAlert({
          type: 'warning',
          text: 'An issue occured - project settings not saved'
        })
      }
    });
  }

  private updateOperationTimes() {
    const matlabDate = this.dateService.ngbDateToMatlabDatenum(this.date as NgbDate);
    this.startTime = matlabDate + this.startTimeInput.hour / 24 + this.startTimeInput.mns / 24 / 60;
    this.stopTime = matlabDate + this.stopTimeInput.hour / 24 + this.stopTimeInput.mns / 24 / 60;
    if (this.stopTime < this.startTime) this.stopTime = this.stopTime + 1;
    const duration = this.stopTime - this.startTime;
    this.formattedDuration = this.dateService.formatMatlabDuration(duration);
  }
}

function inRange(obj: any, min = 0, max = 100) {
  return typeof(obj) === 'number' && obj >= min && obj <= max;
}
function formatTime(timeInput: {hour: number, mns: string}): string {
  return `${timeInput.hour}:${timeInput.mns}`
}
const timeRegex = /(\d\d):(\d\d)/;
function parseTimeString(timestring: string) {
  if (timestring == null) return {hour: null, mns: <any> '00'};
  const results = timeRegex.exec(timestring)
  if (results == null) return {hour: null, mns: <any> '00'};
  return {hour: results[1], mns: results[2]};
}

export interface ForecastOperationSettings {
  // heading: number;
  startTime: number;
  stopTime: number;
  limits?: any;
}
interface YMD {
  year: number;
  month: number;
  day: number;
}
