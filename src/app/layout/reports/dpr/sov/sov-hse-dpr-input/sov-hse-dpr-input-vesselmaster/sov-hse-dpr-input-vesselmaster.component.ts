import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-sov-hse-dpr-input-vesselmaster',
  templateUrl: './sov-hse-dpr-input-vesselmaster.component.html',
  styleUrls: ['./sov-hse-dpr-input-vesselmaster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovHseDprInputVesselmasterComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
  ) { }

  @Input() dprInput;
  @Input() vesselObject;
  @Input() tokenInfo;

  @Output() hseDprApproval: EventEmitter<any> = new EventEmitter<any>();

  hseData = {
    lostTimeInjuries: { value: 0, comment: '' },
    restrictedWorkday: { value: 0, comment: '' },
    MedicalTreatment: { value: 0, comment: '' },
    firstAid: { value: 0, comment: '' },
    environmentalIncidents: { value: 0, comment: '' },
    equipmentDamage: { value: 0, comment: '' },
    proactiveReports: { value: 0, comment: '' },
    nearHitMisses: { value: 0, comment: '' },

    safetyComitteeMeeting: { value: 0, comment: '' },
    marineDrillsAndTraining: { value: 0, comment: '' },
    managementVisits: { value: 0, comment: '' },

    shorePower: { value: 0, comment: '' },
    plasticIncinerated: { value: 0, comment: '' },
    plasticLanded: { value: 0, comment: '' },
    foodIncinerated: { value: 0, comment: '' },
    foodLanded: { value: 0, comment: '' },
    foodMacerated: { value: 0, comment: '' },
    domWasteLanded: { value: 0, comment: '' },
    domWasteIncinerated: { value: 0, comment: '' },
    cookingoilLanded: { value: 0, comment: '' },
    opsWasteLanded: { value: 0, comment: '' },
    opsWasteIncinerated: { value: 0, comment: '' },

    remarks: ''
  };

  ngOnInit() {
    this.getHseDprData();
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

  getHseDprData() {
    this.commonService.getSovHseDprInput(this.vesselObject).subscribe(data => {
      this.hseData = data.hseFields;
    });
  }

  signOffHseDpr() {
    this.saveHseDprInformation();
    
    this.saveStats('saveHseDprSigningClient', {
      client: this.tokenInfo.username,
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.hseDprApproval.emit(2);
  }

  saveHseDprInformation() {
    this.commonService.updateSOVHseDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, hseFields: this.hseData}).subscribe();
  }

}
