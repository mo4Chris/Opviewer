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
  @Input() peopleOnVessel = {};
  @Input() catering = {};
  @Input() dp = {};
  @Input() remarks = '';

  constructor() { }

  ngOnChanges() {
  }

}

interface ReadonlyInput {
  Array: Array<number>;
  Total?: number;
  TotalOld?: number;
  TotalNew?: number;
}
