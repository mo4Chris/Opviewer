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
  @Input() project_id: number;
  @Input() vessels: ForecastVesselRequest[] = [{
    Name: 'Big bad vessel',
    Length: 70,
    Breadth: 12.4,
    Draft: 3.01,
    GM: 4.56789,
  }]
  @Input() project: ForecastOperation = {
    id: 3,
    name: 'New project name',
    client_id: 1,
    latitude: 3.123456,
    longitude: 4.998765,
    water_depth: 20,
    maximum_duration: 30,
    vessel_id: "6",
    activation_start_date: '2021-01-18T10:20:31.902Z',
    activation_end_date: '2021-03-18T10:20:31.902Z',
    client_preferences: null, 
    consumer_id: 10,
  }
  public client_id = 3; // ToDo: this needs to be loaded in somehow
  public new = false;
  public SelectedVessel: ForecastVesselRequest = <any> 0;
  public POI = {
    X: undefined,
    Y: undefined,
    Z: undefined,
  }
  public contractStartDateString = 'N/a';
  public contractEndDateString = '';

  public Marker: google.maps.Marker;
  public Longitude: string;
  public Lattitude: string;

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
      // this.loadData();
    });
    this.contractStartDateString = this.dateService.isoStringToDmyString(this.project.activation_start_date);
    this.contractEndDateString = this.dateService.isoStringToDmyString(this.project.activation_end_date);
    this.Longitude = this.gps.lonToDms(this.project.longitude);
    this.Lattitude = this.gps.latToDms(this.project.latitude);
  }
  initParameter(): Observable<void> {
    return this.route.params.pipe(
      map(params => {
        this.project_id = parseFloat(params.project_id)
        if (isNaN(this.project_id)) {
          this.routeService.routeToNotFound();
        }
      })
    );
  }
  private loadData() {
    forkJoin([
      this.newService.getForecastProjectById(this.client_id)
    ]).subscribe(([project]) => {
      this.project = project;
    })
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
      label: 'POI',
      title: 'Point of interest'
    });
  }
  public onRequestNewVessel() {
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
    this.Marker.setPosition({
      lat: this.project.latitude,
      lng: this.project.longitude,
    })
  }

  public roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString)
  }

  verifyPointOfInterest() {
    if (this.POI.X < 0) {
      this.alert.sendAlert({
        text: 'POI behind vessel aft',
        type: 'warning',
      })
      return false;
    }
    if (this.POI.X > this.SelectedVessel.Length) {
      this.alert.sendAlert({
        text: 'POI ahead of vessel',
        type: 'warning',
      })
      return false;
    }
    if (this.POI.X < 0) {
      this.alert.sendAlert({
        text: 'POI outside vessel',
        type: 'warning',
      })
      return false;
    }
    if (this.POI.Z <= 0) {
      this.alert.sendAlert({
        text: 'POI bolow keel',
        type: 'warning',
      })
      return false;
    }
    return true;
  }
}

export interface ForecastVesselRequest {
  Name: string;
  Length: number;
  Breadth: number;
  Draft: number;
  GM: number;
}