import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SovType } from '../models/SovType';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { TokenModel } from '@app/models/tokenModel';
import { SovModel } from '../models/SovModel';

@Component({
  selector: 'app-sov-dpr-input',
  templateUrl: './sov-dpr-input.component.html',
  styleUrls: ['./sov-dpr-input.component.scss', '../sovreport.component.scss']
})
export class SovDprInputComponent implements OnInit, OnChanges {
  @Input() sovModel: SovModel;
  @Input() vesselObject;
  @Input() tokenInfo: TokenModel;
  @Input() readonly: boolean;

  SovTypeEnum = SovType;

  constructor(
    private datetimeService: DatetimeService,
    private commonService: CommonService,
  ) { }


  hoc = {
    Array: [],
    Total: 0,
    TotalOld: 0,
    TotalNew: 0,
  };
  toolbox = {
    Array: [],
    Total: 0,
    TotalOld: 0,
    TotalNew: 0,
  };
  vesselNonAvailability = {Array: []};
  standBy = {Array: []};
  dp = {Array: []};
  weatherDowntime = {Array: []};


  remarks = '';

  catering = {};
  peopleonBoard = {
    marine: 0,
    marineContractors: 0,
    project: 0
  };
  PoBTotal = 0;

  liquidsObject = {
    fuel: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    luboil: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    domwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    potwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
  };

  ngOnInit() {
  }
  ngOnChanges() {
    this.updateHOCTotal();
    this.updateToolboxTotal();
    this.setDPRInputFields();
  }

  // Updaters
  updateHOCTotal() {
    this.hoc.Total = 0;
    this.hoc.TotalNew = this.hoc.TotalOld;
    if (this.hoc.Array.length !== 0) {
      this.hoc.Array.forEach(element => {
        this.hoc.Total += +element.amount;
        this.hoc.TotalNew += +element.amount;
      });
    }
  }
  updateToolboxTotal() {
    this.toolbox.Total = 0;
    this.toolbox.TotalNew = this.toolbox.TotalOld;
    if (this.toolbox.Array.length !== 0) {
      this.toolbox.Array.forEach(element => {
        this.toolbox.Total += +element.amount;
        this.toolbox.TotalNew += +element.amount;
      });
    }
  }
  setDPRInputFields() {
    this.commonService.getSovDprInput(this.vesselObject).subscribe(SovDprInput => {
      if (SovDprInput.length > 0) {
        this.hoc.Array = SovDprInput[0].hoc;
        this.toolbox.Array = SovDprInput[0].toolbox;
        this.vesselNonAvailability.Array = SovDprInput[0].vesselNonAvailability;
        this.standBy.Array = SovDprInput[0].standBy || [];
        this.weatherDowntime.Array = SovDprInput[0].weatherDowntime;
        this.liquidsObject = SovDprInput[0].liquids;
        this.peopleonBoard = SovDprInput[0].PoB;
        this.remarks = SovDprInput[0].remarks;
        this.catering = SovDprInput[0].catering;
        this.dp.Array = SovDprInput[0].dp;
        this.hoc.TotalOld = SovDprInput[0].HOCAmountOld;
        this.hoc.TotalNew = SovDprInput[0].HOCAmountNew;
        this.toolbox.TotalOld = SovDprInput[0].ToolboxAmountOld;
        this.toolbox.TotalNew = SovDprInput[0].ToolboxAmountNew;
      }

    }, null, () => {

    });
  }

}
