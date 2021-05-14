import { AfterViewInit, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ForecastOperation, ForecastResponseObject, Dof6Array, CtvSlipResponse } from '../models/forecast-response.model';
import { ForecastResponseService } from '../models/forecast-response.service';
import { ForecastOperationSettings } from './forecast-ops-picker/forecast-ops-picker.component';
import { RawSpectralData, RawWaveData } from '@app/models/wavedataModel';
import { ForecastVesselRequest } from '../forecast-project/forecast-project.component';
import { ForecastMotionLimit } from '../models/forecast-limit';
import { PlotlyLineConfig } from '../models/surface-plot/surface-plot.component';
import { PermissionService } from '@app/shared/permissions/permission.service';

@Component({
  selector: 'app-mo4-light',
  templateUrl: './mo4-light.component.html',
  styleUrls: ['./mo4-light.component.scss']
})
export class Mo4LightComponent implements OnInit {
  private project_id: number;

  public showContent = false;
  public vessels: ForecastVesselRequest[] = []; // Not used
  public operations: ForecastOperation[] = []; // Change to projects?
  public responseObj: ForecastResponseObject;

  private response: ForecastResponse;
  public lastUpdated = 'N/a';
  public reponseTime: Date[];
  public Workability: number[][];
  public WorkabilityHeadings: number[];
  public WorkabilityAlongSelectedHeading: number[];
  public headingLine: PlotlyLineConfig = {
    Name: 'Selected heading',
    Mode: 'Horizontal',
    Value: 180,
  }

  private ctvSlipResponse: CtvSlipResponse;
  public SlipProbability: number[][] = [];
  public SlipCoefficients: number[];
  public SlipThrustLevels: number[];

  public limits: ForecastMotionLimit[] = [];

  public selectedSlipCoefficient = 0;
  public selectedThrustIndex = 0

  public minForecastDate: YMD;
  public maxForecastDate: YMD;
  public startTime: number;
  public stopTime: number;
  public formattedDuration = 'N/a';

  public weather: RawWaveData;
  public spectrum: RawSpectralData;

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private routeService: RouterService,
    private responseService: ForecastResponseService,
    private matService: MatrixService,
    private route: ActivatedRoute,
    private permission: PermissionService
  ) {
  }

  private __selectedHeading = 0;
  set selectedHeading(value: number) {
    this.headingLine.Value = value;
    this.__selectedHeading = value;
  }
  get selectedHeading() {
    return this.__selectedHeading;
  }

  ngOnInit() {
    if (!this.permission.forecastRead) return this.routeService.routeToAccessDenied();
    this.initRoute().subscribe(() => {
      this.showContent = false;
      this.loadData();
    });
  }
  initRoute() {
    return this.route.params.pipe(map(params => {
      if (!params.project_id) { return this.routeService.routeToForecast(); }
      this.project_id = parseInt(params.project_id);
    }));
  }

  public get projectSettingsChanged(): Boolean {

    const settings = this?.responseObj?.response?.Points_Of_Interest?.P1?.Project_Settings;
    const op = this.operations?.find(p => p?.id == this.responseObj?.id)
    const valid = Boolean(settings) && Boolean(op)
    if (!valid) return false;
    const settings_not_changed = op.latitude == this.responseObj.latitude
      && op.longitude == this.responseObj.longitude
      && op.water_depth == settings.water_depth;
    return !settings_not_changed;
  }

  loadData(): void {
    // ToDo: only rerout if no permission to forecasting module
    forkJoin([
      this.newService.getForecastProjectList(),
      this.newService.getForecastVesselList(), // Really should only get the relevant vessel
      this.newService.getForecastWorkabilityForProject(this.project_id),
      // this.newService.getCtvForecast()
    ]).subscribe(([projects, vessels, responses]) => {
      this.vessels = vessels;
      this.responseObj = responses;
      this.operations = projects;
      this.showContent = true;
      if (!this.responseObj) return this.onNoResponse();

      this.setLastUpdateTime();
      const responseTimes = this.responseObj.response.Points_Of_Interest.P1.Time;
      this.minForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[0]);
      this.maxForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[responseTimes.length - 1]);

      const currentOperation = this.operations.find(op => op.id === this.project_id);
      this.limits = this.responseService.setLimitsFromOpsPreference(currentOperation);
      this.selectedHeading = currentOperation?.client_preferences?.Ops_Heading ?? 0;

      this.parseCtvSlipResponse();
      this.parseResponse();

      if (this.response == null) return
      // TEMPORARY WORKAROUND FOR WEATHER
      const raw_weather = this.response['MetoceanData'];
      raw_weather.Time = this.dateService.roundToMinutes(raw_weather.Time, 2)
      const param = raw_weather.Wave.Parametric
      this.weather = {
        timeStamp: raw_weather.Time,
        Hs: param.Hs,
        Hmax: param.Hmax,
        Tp: param.Tp,
        waveDir: param.MeanDirection,
        wavePeakDir: param.PeakDirection,
        source: 'Infoplaza'
      }
      const spectral = raw_weather.Wave.Spectral
      this.spectrum = {
        source: 'Infoplaza',
        k_x: spectral.Kx, //.map(x => x[0]),
        k_y: spectral.Ky, //.map(x => x[0]),
        density: spectral.Density,
        timeStamp: this.weather.timeStamp,
      }
      // this.loadWeather();
    }, error => {
      this.routeService.routeToAccessDenied();
    });
  }
  loadWeather() {
    forkJoin([
      this.newService.getForecastWeatherForResponse(this.project_id)
    ]).subscribe(([weathers]) => {
      this.weather = weathers.weather;
      this.spectrum = weathers.spectrum;
    }, error => {
      console.error(error);
    });
  }

  routeToProject(project_id: number) {
    this.routeService.routeToForecast(project_id);
  }

  parseResponse() {
    if (!this.responseObj || this.limits.length === 0) { return this.Workability = null; }
    const POI = this.responseObj.response.Points_Of_Interest.P1;
    this.response = <any> POI;// POI.Response;
    this.reponseTime = POI.Time.map(matlabtime => this.dateService.matlabDatenumToDate(matlabtime));
    this.WorkabilityHeadings = POI.Heading;
    this.computeWorkability();
  }
  parseCtvSlipResponse() {
    const POI = this.responseObj.response.Points_Of_Interest.P1;
    if (! POI?.SlipResponse) return;
    const slip = POI.SlipResponse;

    this.SlipCoefficients = slip.Friction_Coeff_Range;
    this.SlipThrustLevels = slip.Thrust_Range;

    this.SlipProbability = slip.ProbabilityWindowNoSlip.map(_s => _s.map(__s => __s[this.selectedThrustIndex][this.selectedSlipCoefficient]));
    this.SlipProbability = this.SlipProbability.map(_s => _s.map(n => 100-100*n))
  }
  computeWorkability() {
    if (!(this.limits?.length > 0 )) return this.Workability = null;
    const response = this.response['Response']
    const limiters = this.limits.map(limit => {
      switch (limit.Type) {
        case 'Slip':
          return this.matService.scale(this.SlipProbability, 1/limit.Value);
        default:
          return this.responseService.computeLimit(response[limit.Type], limit.Dof, limit.Value);
      }
    });
    this.Workability = this.matService.scale(
      this.responseService.combineWorkabilities(limiters),
      100
    );

    if (this.response == null) return this.WorkabilityAlongSelectedHeading = null;
    const POI = this.responseObj.response.Points_Of_Interest.P1;
    const headingIdx = this.getHeadingIdx(POI.Heading);
    this.WorkabilityAlongSelectedHeading = this.Workability.map(w => w[headingIdx]);
  }

  getHeadingIdx(headings: number[]): number {
    let d = 360;
    let hIdx = null;
    headings.forEach((h, i) => {
      const dist = Math.abs(h - this.selectedHeading);
      if (dist < d) {
        hIdx = i;
        d = dist;
      }
    });
    return hIdx;
  }

  onNoResponse() {
    this.lastUpdated = 'N/a';
    this.responseObj = null;
    this.Workability = null;
    this.limits = [];
  }
  onProjectSettingsChange(settings: ForecastOperationSettings) {
    if (settings?.startTime)  this.startTime  = settings.startTime;
    if (settings?.stopTime)   this.stopTime   = settings.stopTime;
    if (settings?.limits)     this.limits     = settings.limits;
    this.parseCtvSlipResponse();
    this.computeWorkability();
  }
  onTabSwitch(event: NavChangeEvent) {
    this.routeService.switchFragment(event.nextId)
  }
  setLastUpdateTime() {
    const ts = this.responseObj.metocean_id;
    const tnum = this.dateService.isoStringToMoment(ts);
    this.lastUpdated = tnum.format('DD-MMM HH:mm');
  }
}

interface YMD {
  year: number;
  month: number;
  day: number;
}
interface ForecastResponse {
  Acc: Dof6Array;
  Vel: Dof6Array;
  Disp: Dof6Array;
}
export interface NavChangeEvent {
  activeId: string
  nextId: string
  preventDefault: () => void;
}

