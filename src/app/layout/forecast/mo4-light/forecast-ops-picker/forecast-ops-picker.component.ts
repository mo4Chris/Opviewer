import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { intersect } from '@app/models/arrays';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { ForecastVesselRequest } from '../../forecast-project/forecast-project.component';
import { ForecastMotionLimit } from '../../models/forecast-limit';
import { ForecastOperation, ForecastExpectedResponsePreference, ForecastResponseObject } from '../../models/forecast-response.model';

const DEFAULT_SLIP_OPTIONS = {
  Max_Allowed_Slip_Meter: 2,
  Slip_Coefficient: 0.7,
  Thrust_Level_N: 10000,
  Window_Length_Seconds: 120,
}
const SAMPLE_PROJECT_NAME = 'sample_project';

@Component({
  selector: 'app-forecast-ops-picker',
  templateUrl: './forecast-ops-picker.component.html',
  styleUrls: ['./forecast-ops-picker.component.scss']
})
export class ForecastOpsPickerComponent implements OnChanges {
  @Input() projects: ForecastOperation[] = [];
  @Input() lastUpdated: string;
  @Input() vessels: ForecastVesselRequest[];
  @Input() response: ForecastResponseObject; // Used for readonly settings
  @Input() selectedProjectId: number;
  @Input() minForecastDate: YMD; // From Response
  @Input() maxForecastDate: YMD; // From Response

  @Input() heading = 0;
  @Input() limits: ForecastMotionLimit[] = [];

  @Output() headingChange = new EventEmitter<number>();
  @Output() onChange = new EventEmitter<ForecastOperationSettings>();

  @Input() slipCoefficient = 0;
  @Input() slipCoefficients = [];
  @Input() thrustIndex = 0;
  @Input() slipThrustLevels = [];
  @Input() responseNotFound = false;

  @Output() slipCoefficientChange = new EventEmitter<number>();
  @Output() thrustIndexChange = new EventEmitter<number>();

  public selectedProject: ForecastOperation;
  public date: YMD;

  public startTime: number;
  public stopTime: number;
  public startTimeInput = {hour: null, mns: <any> '00'};
  public stopTimeInput = {hour: null, mns: <any> '00'};
  public formattedDuration: string;

  public slipValue: number;
  public thrustValue = this.slipThrustLevels[0];

  private operationTimeChanged = false;
  private headingChanged = false;
  private limitChanged = false;

  public get settingsChanged() {
    return this.operationTimeChanged
      || this.headingChanged
      || this.limitChanged;
  }
  public get ctvSlipSettings() {
    return this.selectedProject?.client_preferences?.Ctv_Slip_Options;
  }
  public get weather() {
    return this?.response?.response?.Points_Of_Interest?.P1?.['MetoceanData'];
  }
  public get mayChangeLimits() {
    if(this.permission.admin) return true;
    if(!this.isSampleProject && this.permission.forecastChangeLimits) return true;
    //if(this.selectedProjectId != 22 && this.permission.forecastChangeLimits) return true;
    return false;
  }
  public get validWaveTypes () {
    const ts_len = this.weather?.Time?.length ?? 0;
    if (ts_len == 0) return [];
    const wave = this.weather.Wave.Parametric;
    const validWaveKeys = ['Hs', 'Tp', 'Hmax', 'Tz']
    return Object.keys(wave).filter(k => wave[k].length == ts_len).filter(intersect(validWaveKeys))
  }
  public get validWindTypes () {
    const ts_len = this.weather?.Time?.length ?? 0;
    if (ts_len == 0) return [];
    const wind = this.weather.Wind;
    const validWindKeys = ['Speed', 'Gust']
    return Object.keys(wind).filter(k => wind[k].length == ts_len).filter(intersect(validWindKeys))
  }

  constructor(
    private dateService: DatetimeService,
    private routerService: RouterService,
    private alert: AlertService,
    private newService: CommonService,
    public gps: GpsService,
    public permission: PermissionService,
    public calcService: CalculationService,
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
    return vessel?.nicename || 'N/a';
  }
  public get hasCtvSlipSettings() {
    return this.selectedProject?.analysis_types?.some(type => type == 'CTV')
  }
  public get isSampleProject() {
    return this.selectedProject?.name.toLowerCase() == SAMPLE_PROJECT_NAME;
  }

  // ##################### Methods #####################
  ngOnChanges(changes: SimpleChanges = {}) {
    if (changes.minForecastDate) this.date = this.minForecastDate;
    if (changes.selectedProjectId) this.onNewSelectedOperation();
  }

  public formatThrust(thrust: number): string {
    const newValue = this.calcService.switchForceUnits(thrust, 'N', 'kN');
    if (!(newValue > 0)) return 'N/a'
    return newValue.toFixed(0) + 'kN';
  }

  onNewSelectedOperation() {
    this.selectedProject = this.projects.find(project => project.id === this.selectedProjectId);
    if (this.hasCtvSlipSettings) {
      const opts = this.ctvSlipSettings;
      if (opts == null) {
        this.slipValue = this.slipCoefficients?.[0]; //ToDo: Retrieve from settings
        this.thrustValue = this.slipThrustLevels?.[0]; //ToDo: Retrieve from settings
        this.selectedProject.client_preferences.Ctv_Slip_Options = {
          Max_Allowed_Slip_Meter: this.slipValue,
          Window_Length_Seconds: 60,
          Slip_Coefficient: 0.6,
          Thrust_Level_N: this.thrustValue,
        }
      } else {
        this.slipValue = this.calcService.findNearest(this.slipCoefficients, opts.Slip_Coefficient);
        this.thrustValue = this.calcService.findNearest(this.slipThrustLevels, opts.Thrust_Level_N)
        opts.Max_Allowed_Slip_Meter = opts.Max_Allowed_Slip_Meter ?? 0.6;
        opts.Window_Length_Seconds = opts.Window_Length_Seconds ?? 60;
      }
    }
    this.startTimeInput = parseTimeString(this.selectedProject?.client_preferences?.Ops_Start_Time)
    this.stopTimeInput = parseTimeString(this.selectedProject?.client_preferences?.Ops_Stop_Time)
    this.updateOperationTimes(true)
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
  public onSlipCoefChange() {
    let sv = this.slipValue;

    var closest = this.slipCoefficients.reduce(function(prev, curr) {
      return (Math.abs(curr - sv) < Math.abs(prev - sv) ? curr : prev);
    });
    const closestIndex = this.slipCoefficients.indexOf(closest)
    this.slipCoefficientChange.emit(closestIndex);
    this.onChange.emit();
  }
  public onThrustIndexChange() {
    let thrustValue = this.thrustValue;

    var closest = this.slipThrustLevels.reduce(function(prev, curr) {
      return (Math.abs(curr - thrustValue) < Math.abs(prev - thrustValue) ? curr : prev);
    });
    const closestIndex = this.slipThrustLevels.indexOf(closest)
    this.thrustIndexChange.emit(closestIndex);
    this.onChange.emit();
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
    this.onChange.emit({
      startTime: this.startTime,
      stopTime: this.stopTime,
    });
  }
  public onLimitsChange() {
    this.limitChanged = true;
  }
  public onAddLimitsLine() {
    this.limitChanged = true;
    this.limits.push(new ForecastMotionLimit({
      Dof: 'Heave',
      Type: 'Disp',
      Value: 1,
    }));
  }
  public onRemoveLimitsLine() {
    this.limitChanged = true;
    this.limits.pop();
  }
  public onConfirm () {
    // if (!this.timeValid) { return this.alert.sendAlert({text: 'Invalid operation time selection!', type: 'danger'}); }

    if (this.limits.some(_limit => !_limit.isValid)) return this.alert.sendAlert({
      text: 'At least one limit is wrongly configured!',
      type: 'warning',
    });
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
    if ( this.isSampleProject && !this.permission.admin) return;
    const old_preferences = this.selectedProject.client_preferences;
    const new_preferences: ForecastExpectedResponsePreference = {
      Points_Of_Interest: old_preferences.Points_Of_Interest,
      Max_Type: old_preferences.Max_Type ?? 'Significant',
      Ops_Start_Time: formatTime(this.startTimeInput),
      Ops_Stop_Time: formatTime(this.stopTimeInput),
      Ops_Heading: this.heading,
      Points: old_preferences.Points,
      Limits: <any> this.limits.map(_limit => _limit.toObject()),
      Degrees_Of_Freedom: old_preferences.Degrees_Of_Freedom,
      Ctv_Slip_Options: old_preferences.Ctv_Slip_Options ?? DEFAULT_SLIP_OPTIONS // Use version of chris when applicable
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

  private updateOperationTimes(init = false) {
    // Computes the startTime and stopTime parameters
    let matlabDate: number;
    let currentTimeStamp = this.dateService.getCurrentMatlabDatenum();

    if (init) {
      matlabDate = Math.floor(currentTimeStamp);
      const maxResponseDate = this.dateService.ngbDateToMatlabDatenum(this.maxForecastDate);
      if (matlabDate >= maxResponseDate) {
        currentTimeStamp = this.dateService.ngbDateToMatlabDatenum(this.minForecastDate)
        matlabDate = Math.floor(currentTimeStamp);
      }
      this.date = this.dateService.matlabDatenumToYMD(matlabDate);
    } else {
      matlabDate = this.dateService.ngbDateToMatlabDatenum(this.date);
    }

    this.startTime = matlabDate + this.startTimeInput.hour / 24 + this.startTimeInput.mns / 24 / 60;
    this.stopTime = matlabDate + this.stopTimeInput.hour / 24 + this.stopTimeInput.mns / 24 / 60;
    if (this.stopTime < this.startTime) this.stopTime += 1;
    const currentPastStopTime = currentTimeStamp > this.stopTime;
    if (init && currentPastStopTime) {
      this.date = this.dateService.matlabDatenumToYMD(matlabDate + 1);
      this.startTime += 1;
      this.stopTime += 1;
    }
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
  slipLimit?: any;

}
interface YMD {
  year: number;
  month: number;
  day: number;
}
