import { Component, OnInit, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { AlertService } from '@app/supportModules/alert.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';

@Component({
  selector: 'app-sov-hse-dpr-input-readonly',
  templateUrl: './sov-hse-dpr-input-readonly.component.html',
  styleUrls: ['./sov-hse-dpr-input-readonly.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovHseDprInputReadonlyComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
    ) { }

  @Output() hseDprApproval: EventEmitter<any> = new EventEmitter<any>();

  @Input() hseDprApprovalCount;
  @Input() hseDprInput;
  @Input() vesselObject;
  @Input() tokenInfo;

  hseDprSignedByClient = 2;
  hseDprDeclinedByClient = -1;

  hseData = {};
  dprData = {};

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

  checkDprData() {
    if (this.hseDprInput && this.hseDprInput.hseFields && this.hseDprInput.hseFields !== {}) {
      this.dprData = this.hseDprInput.dprFields;
    } else {
      this.dprData = {
      marineCount: {value: 0, comment: ''},
      clientCrewCount: {value: 0, comment: ''},
      hocAmount: {value: 0, comment: ''},
      toolboxAmount: {value: 0, comment: ''},
      technicalBreakdownAmount: {value: 0, comment: ''},
      fuelConsumption: {value: 0, comment: ''},
      lubOilConsumption: {value: 0, comment: ''},
      waterConsumption: {value: 0, comment: ''}
      };
    }
  }

  checkHseData() {
    if (this.hseDprInput && this.hseDprInput.hseFields && this.hseDprInput.hseFields !== {} ) {
      this.hseData = this.hseDprInput.hseFields;
    } else {
        this.hseData = {
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
    }
  }

  ngOnInit() {
    this.checkHseData();
    this.checkDprData();
  }

  signOffHseDprClient() {
    this.saveStats('saveHseDprSigningClient', {
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.hseDprApproval.emit(this.hseDprSignedByClient);
  }

  declineHseDprClient() {
    this.saveStats('declineHseDprClient', {
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.hseDprApproval.emit(this.hseDprDeclinedByClient);
  }
}
