import { Component, OnInit } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { RouterService } from '@app/supportModules/router.service';
import { ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-new-project',
  templateUrl: './forecast-new-project.component.html',
  styleUrls: ['./forecast-new-project.component.scss']
})
export class ForecastNewProjectComponent implements OnInit {
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
  constructor(
    private permission: PermissionService,
    private routerService: RouterService,
    private calcService: CalculationService,
  ) { }

  public uploadOptions = {
    
  }

  ngOnInit() {
    if (!this.permission.admin) {
      // ToDo: we really should have a no permission page
      this.routerService.routeToNotFound();
    }
  }

  roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString)
  }

  // File upload events
  onUploadOutput(event) {
    console.log('onUploadOutput')
    console.log(event);
  }
  startUpload(event) {
    console.log('startUpload')
    console.log(event);
  }
}
