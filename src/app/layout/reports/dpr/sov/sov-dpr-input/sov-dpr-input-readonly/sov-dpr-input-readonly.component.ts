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
  @Input() liquids = {};
  @Input() peopleOnVessel = {marine: 0, marineContractors: 0, project: 0, Total: 0};
  @Input() catering = {};
  @Input() dp = {};
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
