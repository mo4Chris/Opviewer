import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';
import { ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-project',
  templateUrl: './forecast-project.component.html',
  styleUrls: ['./forecast-project.component.scss']
})
export class ForecastProjectComponent implements OnInit {

  public project_id: number;
  public project: ForecastOperation = {
    id: 3,
    name: 'TEST',
    client_id: 1,
    latitude: 3+1/7,
    longitude: 4+1/11,
    water_depth: 20,
    maximum_duration: 30,
    vessel_id: "6",
    activation_start_data: null,
    activation_end_data: null, 
    client_preferences: null, 
    consumer_id: 10,
  }
  public vessel = {
    Length: 1,
    Breadth: 2,
    Draft: 3,
    GM: 4,
  }
  public POI = {
    X: 0,
    Y: 0,
    Z: 0,
  }

  constructor(
    private route: ActivatedRoute,
    private routeService: RouterService,
    private alert: AlertService,
  ) { }

  ngOnInit() {
    this.initParameter()
  }

  initParameter() {
    this.route.params.subscribe(params => {
      this.project_id = parseFloat(params.project_id)
      if (isNaN(this.project_id)) {
        this.routeService.routeToNotFound();
      }
    });
  }

  onMapReady(map: google.maps.Map) {
    new google.maps.Marker({
      position: {
        lat: this.project.latitude,
        lng: this.project.longitude,
      },
      draggable: false,
      // icon: this.markerIcon,
      map: map,
      zIndex: 2,
      label: 'POI',
      title: 'Point of interest'
    });
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
    if (this.POI.X > this.vessel.Length) {
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
