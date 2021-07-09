import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { LongtermColorScheme } from '../../../models/color_scheme';
import { LongtermProcessingService } from '../../../models/longterm-processing-service.service';

@Component({
  selector: 'app-fuel-overview',
  templateUrl: './fuel-overview.component.html',
  styleUrls: ['./fuel-overview.component.scss']
})
export class FuelOverviewComponent implements OnChanges {
  
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    private newService: CommonService,
    private routerService: RouterService,
    ){}

  @Input() vesselObject: { dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[], vesselName: string[] };
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();


  retrievedData;
  noData = true;
  RawData: RawGeneralModel[];
  vesselName = '';
  chart: Chart;

  ngOnChanges(): void {
    this.getDataForGraph();
  }

  navigateToDPR(navItem: { mmsi: number, matlabDate: number }) {
    this.routerService.routeToDPR({ mmsi: navItem.mmsi, date: navItem.matlabDate });
  }

  getDataForGraph() {
    const makeRequest = (reqFields: string[]) => {
      return {
        dateMin: this.vesselObject.dateMin,
        dateMax:  this.vesselObject.dateMax,
        mmsi: this.vesselObject.mmsi,
        reqFields: reqFields,
      };
    };
    forkJoin([
      this.newService.getCtvInputsByRange(makeRequest(['inputStats', 'date'])),
      this.newService.getEngineStatsForRange(makeRequest(['fuelUsedTotalM3', 'date'])
      )]).subscribe(([rawdata, engines]) => {
      if ((rawdata.length > 0 && rawdata[0].date.length > 0) || (engines.length > 0 && engines[0].date.length > 0)) {
        this.noData = false;
        this.retrievedData = {
          'input': rawdata,
          'engines': engines
        }
      } else {
        this.noData = true;
      }
    });

  }
}

interface DatasetModel {
    label: String;
    data: Object[];
}

interface RawGeneralModel {
  dayNum: number;
  mmsi: number;
  vesselName: string;
}
