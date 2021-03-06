import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { intersect } from '@app/models/arrays';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ForecastAnalysisType, ForecastCtvSlipSettings, ForecastOperation, MetoceanProvider, PointOfInterest } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-project',
  templateUrl: './forecast-project.component.html',
  styleUrls: ['./forecast-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForecastVesselComponent implements OnInit {
  public project_name: string;
  public vessels: ForecastVesselRequest[] = [{
    nicename: 'Big bad vessel',
    type: 'example_vessel',
    length: 70,
    width: 12.4,
    draft: 3.01,
    gm: 4.56789,
    rao: null,
    analysis_types: ['Standard']
  }];

  public providers: MetoceanProvider[];
  public project: ForecastOperation = <any> {};
  public projectLoaded = false;
  public new = false;
  public SelectedVessel: ForecastVesselRequest | 0 = 0;
  public POI: PointOfInterest = {
    Name: 'Primary',
    X: {Value: 0, Type: 'absolute', 'Unit': 'm'},
    Y: {Value: 0, Type: 'absolute', 'Unit': 'm'},
    Z: {Value: 0, Type: 'absolute', 'Unit': 'm'},
  };
  public contractStartDateString = 'N/a';
  public contractEndDateString = '';

  public Marker: google.maps.Marker;
  public Longitude = 'N/a';
  public Lattitude = 'N/a';
  public is_sample_project = false;
  public ctv_slip_settings: ForecastCtvSlipSettings;

  public NewVessel: ForecastVesselRequest = {
    type: 'NEW',
    nicename: 'NEW',
    length: NaN,
    width: NaN,
    draft: NaN,
    gm: NaN,
    rao: null,
    analysis_types: ['Standard']
  }

  public selectMetoceanSettings = {
    idField: 'id',
    textField: 'display_name',
    singleSelection: true,
    closeDropDownOnSelection: true,
  }

  constructor(
    private route: ActivatedRoute,
    private routeService: RouterService,
    private alert: AlertService,
    private newService: CommonService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
    public permission: PermissionService,
    public gps: GpsService,
    private ref: ChangeDetectorRef
  ) {
  }

  public get projectReady() {
    return Boolean(this.SelectedVessel);
  }
  public get hasCtvSlipSettings() {
    const types = this.project?.analysis_types;
    return Array.isArray(types) && types.some(t => t == 'CTV');
  }

  ngOnInit() {
    this.initParameter().subscribe(() => {
      if (this.project_name == 'new') return;
      this.loadData();
    });
  }
  initParameter(): Observable<void> {
    return this.route.params.pipe(
      map(params => {
        this.project_name = params.project_name;
        if (this.project_name == 'new') return this.initNewProject();
        if (this.project_name == null) return this.routeService.routeToNotFound();
      })
    );
  }
  loadData() {
    forkJoin([
      this.newService.getForecastProjectByName(this.project_name),
      this.newService.getForecastMetoceanProviders(),
      this.newService.getForecastVesselList(),
    ]).subscribe(([_project, _providers, vessels]) => {
      this.project = _project[0];
      this.providers = _providers;
      this.project.metocean_provider = this.providers.find(_provider => _provider.name == this.project.metocean_provider.name)

      this.is_sample_project = !this.permission.admin && (this.project_name == 'Sample_Project');
      this.ctv_slip_settings =  this.project?.client_preferences?.Ctv_Slip_Options;
      if (this.ctv_slip_settings == null) this.initCtvSlipSettings();

      this.vessels = vessels;
      this.SelectedVessel = this.vessels.find(v => v.id == this.project.vessel_id) ?? 0;
      this.projectLoaded = true;
      this.onLoaded();
      this.ref.detectChanges();
    });
  }

  // ####################
  private onLoaded() {
    this.contractStartDateString = this.dateService.isoStringToDmyString(this.project.activation_start_date);
    this.contractEndDateString = this.dateService.isoStringToDmyString(this.project.activation_end_date);
    this.Longitude = this.gps.lonToDms(this.project.longitude);
    this.Lattitude = this.gps.latToDms(this.project.latitude);
    const poi = this.project?.client_preferences?.Points;
    if (poi) {
      this.POI = poi[0];
      this.POI.X.Type = 'absolute';
      this.POI.Y.Type = 'absolute';
      this.POI.Z.Type = 'absolute';
      this.POI.X.Unit = 'm';
      this.POI.Y.Unit = 'm';
      this.POI.Z.Unit = 'm';
    }
    this.updateMarker();
    this.ref.detectChanges()
  }
  private initNewProject() {
    if (!this.permission.forecastCreateProject) {
      this.alert.sendAlert({text: 'You do not have permission to create projects', 'type': 'danger'})
      return this.routeService.routeToForecast();
    }
    throw Error('Not yet implemented!')
    this.newService.getForecastVesselList().subscribe(vessels => {
      this.vessels = vessels;
      this.project = {
        id: null,
        name: 'newProject', // TODO
        nicename: 'Enter new name',
        latitude: 0,
        longitude: 0,
        water_depth: 0,
        maximum_duration: 0,
        vessel_id: null,
        activation_start_date: '',
        activation_end_date: '',
        client_id: null,
        client_preferences: null,
        consumer_id: null,
        analysis_types: ['Standard'],
        metocean_provider: {
          id: 1,
          name: 'test',
          display_name: 'Test 1',
          is_active: true,
        }
      };
    });
  }
  private initCtvSlipSettings() {
    this.project.client_preferences.Ctv_Slip_Options = {
      Max_Allowed_Slip_Meter: 0.60,
      Window_Length_Seconds: 180,
      Slip_Coefficient: 0.6,
      Thrust_Level_N: 100000,
    }
    this.ctv_slip_settings = this.project.client_preferences.Ctv_Slip_Options;
  }

  // ######################
  public onMapReady(map: google.maps.Map) {
    this.Marker = new google.maps.Marker({
      position: {
        lat: this.project.latitude,
        lng: this.project.longitude,
      },
      draggable: false,
      map: map,
      zIndex: 2,
      title: 'Point of interest'
    });
  }
  public onRequestNewVessel() {
    this.routeService.routeToForecastNewVesselRequest();
  }
  public onConfirm() {
    this.project.vessel_id = this.SelectedVessel == 0 ? null : this.SelectedVessel.id;
    this.newService.saveForecastProjectSettings(this.project).subscribe(msg => {
      this.alert.sendAlert({
        text: msg.data
      })
    }, err => {
      console.error(err)
      this.alert.sendAlert({
        text: err.error,
        type: 'danger'
      })
    })
  }
  public onUpdateLon() {
    this.Longitude = this.gps.lonToDms(this.project.longitude);
    this.updateMarker();
  }
  public onUpdateLat() {
    this.Lattitude = this.gps.latToDms(this.project.latitude);
    this.updateMarker();
  }
  private updateMarker() {
    if (!this.Marker) { return; }
    this.Marker.setPosition({
      lat: this.project.latitude,
      lng: this.project.longitude,
    });
  }
  public onSelectedVesselChange() {
    const supported_analysis_types = (this.SelectedVessel as ForecastVesselRequest).analysis_types;
    this.project.analysis_types = this.project.analysis_types.filter(intersect(supported_analysis_types));
  }

  public roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString);
  }
}

export interface ForecastVesselRequest {
  id?: number;
  nicename: string;
  client_id?: number;
  type: string;
  length: number;
  width: number;
  draft: number;
  gm: number;
  rao?: any;
  analysis_types: ForecastAnalysisType[];
}
