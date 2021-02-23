import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
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
  public vesselName = '';
  public draftAP: number;
  public draftFP: number;
  public LCG: number;
  public TCG: number;
  public VCG: number;
  public GmCorrected: number;
  public Kxx: number;
  public Kyy: number;
  public Kzz: number;

  public supportedFormats = [
    'shape', 'hull'
  ];
  private vesselPlan: string;

  constructor(
    private permission: PermissionService,
    private routerService: RouterService,
    private calcService: CalculationService,
    private newService: CommonService,
  ) { }

  public get requestReady() {
    return (this.vesselName.length > 0)
    && isNumber(this.draftAP)
    && isNumber(this.draftFP)
    && this.vesselPlanReady;
  }
  private get vesselPlanReady() {
    return this.vesselPlan.length > 0;
  }

  ngOnInit() {
    if (!this.permission.admin) {
      // ToDo: we really should have a no permission page
      this.routerService.routeToNotFound();
    }
  }

  roundNumber(num: number, dec = 10000, addString?: string) {
    return this.calcService.roundNumber(num, dec, addString);
  }

  public onFileUploadComplete(filename: string) {
    this.vesselPlan = filename;
  }
  public sendRequest() {
    const request: ForecastNewVesselRequest = {
      VesselName: this.vesselName,
      DraftFP: this.draftFP,
      DraftAP: this.draftAP,
      Vesssel3dFileName: this.vesselPlan,
      LCG: this.LCG,
      TCG: this.TCG,
      VCG: this.VCG,
      GM_corrected: this.GmCorrected,
      Kxx: this.Kxx,
      Kyy: this.Kyy,
      Kzz: this.Kzz,
    };
    // this.newService.saveForecastRequest(request)
  }
}

function isNumber(x: any) {
  return typeof(x) == 'number';
}

export interface ForecastNewVesselRequest {
  VesselName: string;
  DraftFP: number;
  DraftAP: number;
  Vesssel3dFileName: string;
  LCG: number;
  TCG: number;
  VCG: number;
  GM_corrected: number;
  Kxx: number;
  Kyy: number;
  Kzz: number;
}
