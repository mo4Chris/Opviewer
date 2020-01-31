import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '@app/common.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
//  import { VesselModel } from '../../../../../../models/vesselModel';

@Component({
  selector: 'app-sov-hse-dpr-input-vesselmaster',
  templateUrl: './sov-hse-dpr-input-vesselmaster.component.html',
  styleUrls: ['./sov-hse-dpr-input-vesselmaster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovHseDprInputVesselmasterComponent implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  @Input() dprInput;
  @Input() vesselObject: VesselObjectModel;

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

  getHseDprData() {
    this.commonService.getSovHseDprInput(this.vesselObject).subscribe(data => {
      this.hseData = data.hseFields;
    });
  }

  saveHseDprInformation() {
    this.commonService.updateSOVHseDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, hseFields: this.hseData}).subscribe();
  }

}
