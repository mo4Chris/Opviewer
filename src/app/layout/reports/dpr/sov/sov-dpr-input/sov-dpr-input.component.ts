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
  @Input() dprInput;

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
    if (this.dprInput) {
      this.hoc.Array = this.dprInput.hoc;
      this.toolbox.Array = this.dprInput.toolbox;
      this.vesselNonAvailability.Array = this.dprInput.vesselNonAvailability;
      this.standBy.Array = this.dprInput.standBy || [];
      this.weatherDowntime.Array = this.dprInput.weatherDowntime;
      this.liquidsObject = this.dprInput.liquids;
      this.peopleonBoard = this.dprInput.PoB;
      this.remarks = this.dprInput.remarks;
      this.catering = this.dprInput.catering;
      this.dp.Array = this.dprInput.dp;
      this.hoc.TotalOld = this.dprInput.HOCAmountOld;
      this.hoc.TotalNew = this.dprInput.HOCAmountNew;
      this.toolbox.TotalOld = this.dprInput.ToolboxAmountOld;
      this.toolbox.TotalNew = this.dprInput.ToolboxAmountNew;
    }
  }

}
