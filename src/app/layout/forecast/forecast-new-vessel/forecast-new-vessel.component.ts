import { Component, OnInit } from '@angular/core';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { RouterService } from '@app/supportModules/router.service';
import { ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-new-vessel',
  templateUrl: './forecast-new-vessel.component.html',
  styleUrls: ['./forecast-new-vessel.component.scss']
})
export class ForecastNewVesselComponent implements OnInit {
  public vessel = {
    name: '',
    draftAP: null,
    draftFP: null,
  }
  private vesselPlanReady = false;

  constructor(
    private permission: PermissionService,
    private routerService: RouterService,
    private calcService: CalculationService,
  ) { }

  public get requestReady() {
    return (this.vessel.name.length > 0)
    && isNumber(this.vessel.draftAP)
    && isNumber(this.vessel.draftFP)
    && this.vesselPlanReady
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

  onFileUploadComplete() {
    this.vesselPlanReady = true;
  }
}

function isNumber(x: any) {
  return typeof(x) == 'number';
}
