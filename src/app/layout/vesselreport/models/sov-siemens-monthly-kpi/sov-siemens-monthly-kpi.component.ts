import { Component, OnInit, Input } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { CommonService } from '../../../../common.service';
import { platform } from 'os';

@Component({
  selector: 'app-sov-siemens-monthly-kpi',
  templateUrl: './sov-siemens-monthly-kpi.component.html',
  styleUrls: ['./sov-siemens-monthly-kpi.component.scss']
})
export class SOVSiemensMonthlyKPIComponent implements OnInit {
  @Input() vesselObject: {mmsi: number, startDate: number};
  constructor(
    private newService: CommonService
  ) { }

  ngOnInit() {
    // this.loaddata().subscribe([turbines, v2vs, portcalls] => {
    //   console.log()
    // })
  }

  loaddata() { // : Observable<[any, any, any]> {
    const stats_req = {
      mmsi: [this.vesselObject.mmsi],
      dateMin: this.vesselObject.startDate,
      dateMax: 1,
      reqFields: ['fieldname', 'paxIn', 'paxOut', 'gangwayReadyDuration', 'cargoIn', 'cargoOut']
    };
    return forkJoin(
      this.newService.getTurbineTransfersForVesselByRangeForSOV(stats_req),
      // this.newService.getPlatformTransfersForVesselByRangeForSOV(stats_req),
      this.newService.getVessel2vesselsByRangeForSov(stats_req),
      this.newService.getPortcallsByRange(stats_req),
    ).subscribe(res => {
      console.log(res);
    });
  }
}
