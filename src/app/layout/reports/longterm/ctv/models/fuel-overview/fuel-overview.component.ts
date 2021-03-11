import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
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
    private dateService: DatetimeService,
    private parser: LongtermProcessingService,
    ){}

  @Input() vesselObject: { dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[], vesselname: string[] };
  @Input() vesselNames;
  @Input() tokenInfo: TokenModel;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;


  retrievedData;
  noData = true;
  RawData: RawGeneralModel[];
  vesselName = '';
  chart: Chart;

  ngOnChanges(): void {
    this.getDataForGraph();
  }

  getDataForGraph() {
    this.newService.getCtvInputsByRange({
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: ['DPRstats', 'inputStats', 'date']
    }).subscribe((rawdata) => {

      if (rawdata.length > 0 && rawdata[0].date.length > 0) {
        this.noData = false;
        this.retrievedData = rawdata;
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
