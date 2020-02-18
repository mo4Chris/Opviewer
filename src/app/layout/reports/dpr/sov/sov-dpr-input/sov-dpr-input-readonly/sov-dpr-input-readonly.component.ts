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
  @Input() hoc;
  @Input() toolbox;
  @Input() liquids: LiquidsInput;
  @Input() peopleOnVessel = {marine: 0, marineContractors: 0, project: 0, Total: 0};
  @Input() catering: CateringInput;
  @Input() dp: ReadonlyInput;
  @Input() remarks = '';
  @Input() vesselObject;
  @Input() tokenInfo;
  @Input() dprApprovalCount;

  dprSignedByClient = 2;
  dprDeclinedByClient = -1;

  @Output() dprApproval: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
  ) {}

  ngOnChanges() {
    this.setTotalPob();
    this.updateHOCTotal();
    this.updateToolboxTotal();
  }

  setTotalPob() {
    this.peopleOnVessel.Total = (0 + +this.peopleOnVessel.marineContractors + +this.peopleOnVessel.marine + +this.peopleOnVessel.project);
  }

  signOffDprClient() {
    this.saveStats('saveDprSigningClient', {
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.dprApproval.emit(this.dprSignedByClient);
    this.dprApprovalCount = 2;
  }

  declineDprClient() {
    this.saveStats('declineDprClient', {
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.dprApproval.emit(this.dprDeclinedByClient);
    this.dprApprovalCount = -1;
  }

  updateHOCTotal() {
    this.hoc.Total = 0;
    this.hoc.TotalNew = this.hoc.TotalOld;
    if (this.hoc.Array.length !== 0) {
        this.hoc.Array.forEach(element => {
            this.hoc.Total = this.hoc.Total + +element.amount;
            this.hoc.TotalNew = this.hoc.TotalNew + +element.amount;
        });
    }
}

  updateToolboxTotal() {
      this.toolbox.Total = 0;
      this.toolbox.TotalNew = this.toolbox.TotalOld;
      if (this.toolbox.Array.length !== 0) {
          this.toolbox.Array.forEach(element => {
              this.toolbox.Total = this.toolbox.Total + +element.amount;
              this.toolbox.TotalNew = this.toolbox.TotalNew + +element.amount;
          });
      }
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
