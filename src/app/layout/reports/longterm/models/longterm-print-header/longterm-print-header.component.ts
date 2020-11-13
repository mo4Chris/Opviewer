import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LongtermVesselObjectModel } from '../../longterm.component';

@Component({
  selector: 'app-longterm-print-header',
  templateUrl: './longterm-print-header.component.html',
  styleUrls: ['./longterm-print-header.component.scss'],
})
export class LongtermPrintHeaderComponent implements OnChanges {
  @Input() vesselObject: LongtermVesselObjectModel
  @Input() vesselType: string = 'test';
  @Input() fieldname: string = 'test field';

  constructor() { }

  ngOnChanges() {
  }

}
