import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { GpsService } from '@app/supportModules/gps.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-project',
  templateUrl: './forecast-project.component.html',
  styleUrls: ['./forecast-project.component.scss']
})
export class ForecastVesselComponent implements OnInit {
  public project_id: number;
  public vessels: ForecastVesselRequest[] = [{
    type: 'Big bad vessel',
    length: 70,
    width: 12.4,
    draft: 3.01,
    gm: 4.56789,
    rao: null
  }];
  public project: ForecastOperation = <any> {};
  public projectLoaded = false;
  public new = false;
  public SelectedVessel: ForecastVesselRequest = <any> 0;
  public POI = {
    X: undefined,
    Y: undefined,
    Z: undefined,
  };
  public contractStartDateString = 'N/a';
  public contractEndDateString = '';

  public Marker: google.maps.Marker;
  public Longitude = 'N/a';
  public Lattitude = 'N/a';

  constructor(
    private route: ActivatedRoute,
    private routeService: RouterService,
    private alert: AlertService,
    private newService: CommonService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
    public permission: PermissionService,
    public gps: GpsService,
  ) { }

  public get projectReady() {
    return Boolean(this.SelectedVessel);
  }


  ngOnInit() {
    this.initParameter().subscribe(() => {
      this.loadData();
    });
  }
  initParameter(): Observable<void> {
    return this.route.params.pipe(
      map(params => {
        const project_id = params.project_id;
        if (project_id == 'new') { return this.initNewProject(); }
        this.project_id = parseFloat(project_id);
        if (isNaN(this.project_id)) {
          this.routeService.routeToNotFound();
        }
      })
    );
  }
  private loadData() {
    forkJoin([
      this.newService.getForecastProjectById(this.project_id),
      this.newService.getForecastVesselList(),
    ]).subscribe(([project, vessels]) => {
      this.project = project[0];
      this.vessels = vessels;
      this.projectLoaded = true;
      this.onLoaded();
    });
  }
  private onLoaded() {
    this.contractStartDateString = this.dateService.isoStringToDmyString(this.project.activation_start_date);
    this.contractEndDateString = this.dateService.isoStringToDmyString(this.project.activation_end_date);
    this.Longitude = this.gps.lonToDms(this.project.longitude);
    this.Lattitude = this.gps.latToDms(this.project.latitude);
    this.updateMarker();
  }
  private initNewProject() {
    if (!this.permission.forecastCreateProject) {
    this.newService.getForecastVesselList().subscribe(vessels => {
      this.vessels = vessels;
      this.project = {
        id: null,
        name: 'Enter new name',
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
      };
    });
    }
  }

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
    // ToDo: send the values back to the database
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

  public roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString);
  }
}

export interface ForecastVesselRequest {
  type: string;
  length: number;
  width: number;
  draft: number;
  gm: number;
  rao: any;
}
