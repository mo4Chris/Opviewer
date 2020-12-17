import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LongtermVesselObjectModel } from '../../longterm.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-longterm-print-headerbar',
  templateUrl: './longterm-print-headerbar.component.html',
  styleUrls: ['./longterm-print-headerbar.component.scss'],
})
export class LongtermPrintHeaderbarComponent implements OnChanges {
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselType: String = 'test';
  @Input() fieldname: String = 'test field';

  constructor() { }

  ngOnChanges() {
  }

}
 