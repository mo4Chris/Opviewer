import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-sov-dpr-input-readonly',
  templateUrl: './sov-dpr-input-readonly.component.html',
  styleUrls: ['./sov-dpr-input-readonly.component.scss', '../../sovreport.component.scss']
})
export class SovDprInputReadonlyComponent implements OnChanges {
  @Input() standby: ReadonlyInput;
  @Input() vesselNonAvailability: ReadonlyInput;
  @Input() weatherDowntime: ReadonlyInput;
  @Input() hoc: ReadonlyInput;
  @Input() toolbox: ReadonlyInput;
  @Input() liquids: LiquidsInput;
  @Input() peopleOnVessel = {marine: 0, marineContractors: 0, project: 0, Total: 0};
  @Input() catering: CateringInput;
  @Input() dp: ReadonlyInput;
  @Input() remarks = '';
  @Input() vesselObject;
  @Input() tokenInfo
  @Input() dprApprovalCount;

  @Output() dprApproval: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
  ) {}

  ngOnChanges() {
    this.setTotalPob();
  }

  setTotalPob() {
    this.peopleOnVessel.Total = (0 + +this.peopleOnVessel.marineContractors + +this.peopleOnVessel.marine + +this.peopleOnVessel.project);
  }

  signOffDprClient() {
    this.saveStats('saveDprSigningClient', {
      client: this.tokenInfo.username,
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.dprApproval.emit(2);
    this.dprApprovalCount = 0;
  }

  declineDprClient() {
    this.saveStats('declineDprClient', {
      client: this.tokenInfo.username,
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.dprApproval.emit(-1);
    this.dprApprovalCount = 0;
  } 

  saveStats(saveFcnName: string, saveObject: object): void {
    // Generic saver for all the functions below
    const baseObj = {
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
    };
    this.commonService[saveFcnName]({...baseObj, ...saveObject}).pipe(
      map(
        (res: any) => {
          this.alert.sendAlert({
            type: 'success',
            text: res.data,
          });
        }
      ),
      catchError(error => {
        this.alert.sendAlert({
          type: 'danger',
          text: error,
        });
        throw error;
      })
    ).subscribe();
  }

}

interface ReadonlyInput {
  Array: Array<number>;
  Total?: number;
  TotalOld?: number;
  TotalNew?: number;
}

interface CateringInput {
  project: Number;
  marine: Number;
  marineContractors: number;
  extraMeals: Number;
  packedLunches: Number;
  Array: Array<number>;
}

interface LiquidsInput {
  fuel: {
    oldValue: number,
    newValue: number,
    loaded: number,
    consumed: number,
    discharged: number
  };
  luboil: {
    oldValue: number,
    newValue: number,
    loaded: number,
    consumed: number,
    discharged: number
  };
  domwater: {
    oldValue: number,
    newValue: number,
    loaded: number,
    consumed: number,
    discharged: number
  };
  potwater: {
    oldValue: number,
    newValue: number,
    loaded: number,
    consumed: number,
    discharged: number
  };
}
