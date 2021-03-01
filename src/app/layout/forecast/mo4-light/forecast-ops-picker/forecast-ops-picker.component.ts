import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ForecastMotionLimit } from '../../models/forecast-limit';
import { ForecastLimit, ForecastOperation } from '../../models/forecast-response.model';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() projects: ForecastOperation[] = [];
  @Input() vessels: any[];
  @Input() selectedProjectId: number;
  @Input() minForecastDate: YMD; // From Response
  @Input() maxForecastDate: YMD; // From Response

  @Input() heading = 0;
  @Output() headingChange = new EventEmitter<number>();
  @Input() limits: ForecastMotionLimit[] = [];

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
    if (this.selectedProjectId) this.onNewSelectedOperation();
    if (changes.minForecastDate) this.date = this.minForecastDate;
  }
  onNewSelectedOperation() {
    this.selectedProject = this.projects.find(project => project.id === this.selectedProjectId);
  }
  public onHeadingChange() {
    this.headingChanged = true;
    this.heading = this.heading % 360;
    this.headingChange.emit(this.heading);
  }
  public onOpsChange() {
    this.routerService.routeToForecast(this.selectedProjectId);
  }
  public onTimeChange(change: any) {
    this.operationTimeChanged = true;
    if ( this.date
      && inRange(this.startTimeInput.hour, 0, 24)
      && inRange(+this.startTimeInput.mns, 0, 59)
      && inRange(this.stopTimeInput.hour, 0, 24)
      && inRange(+this.stopTimeInput.mns, 0, 59)
    ) {
      const matlabDate = this.dateService.ngbDateToMatlabDatenum(this.date as NgbDate);
      this.startTime = matlabDate + this.startTimeInput.hour / 24 + this.startTimeInput.mns / 24 / 60;
      this.stopTime = matlabDate + this.stopTimeInput.hour / 24 + this.stopTimeInput.mns / 24 / 60;
      const duration = this.stopTime - this.startTime;
      this.formattedDuration = this.dateService.formatMatlabDuration(duration);
    }
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
  }
  public appendLeadingZeros(event) {
    const input: HTMLInputElement = event.srcElement;
    if (!isNaN(+input.value) && input.value.length === 1) {
      input.value = '0' + input.value;
    }
  }
}

function inRange(obj: any, min = 0, max = 100) {
  return typeof(obj) === 'number' && obj >= min && obj <= max;
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
