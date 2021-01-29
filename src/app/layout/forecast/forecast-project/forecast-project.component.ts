import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { CalculationService } from '@app/supportModules/calculation.service';
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
  public client_id = 3; // ToDo: this needs to be loaded in somehow
  public new = false;
  public project: ForecastOperation = {
    id: 3,
    name: 'New project name',
    client_id: 1,
    latitude: 3+1/7,
    longitude: 4+1/11,
    water_depth: 20,
    maximum_duration: 30,
    vessel_id: "6",
    activation_start_date: null,
    activation_end_date: null, 
    client_preferences: null, 
    consumer_id: 10,
  }
  public SelectedVessel: ForecastVesselRequest = <any> 0;
  public POI = {
    X: undefined,
    Y: undefined,
    Z: undefined,
  }

  constructor(
    private route: ActivatedRoute,
    private routeService: RouterService,
    private alert: AlertService,
    private newService: CommonService,
    private calcService: CalculationService,
  ) { }

  public get projectReady() {
    return Boolean(this.SelectedVessel);
  }


  ngOnInit() {
    this.initParameter().subscribe(() => {
      // this.loadData();
    });
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
  loadData() {
    forkJoin([
      this.newService.getForecastProjectById(this.client_id)
    ]).subscribe(([project]) => {
      this.project = project;
    })
  }


  onMapReady(map: google.maps.Map) {
    new google.maps.Marker({
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

  roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString)
  }

  onConfirm() {
    // ToDo: send the values back to the database
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