import { Component, OnInit, Input, OnChanges } from '@angular/core';

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

  constructor() {}

  ngOnChanges() {
    this.setTotalPob();
  }

  setTotalPob() {
    this.peopleOnVessel.Total = (0 + +this.peopleOnVessel.marineContractors + +this.peopleOnVessel.marine + +this.peopleOnVessel.project);
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
