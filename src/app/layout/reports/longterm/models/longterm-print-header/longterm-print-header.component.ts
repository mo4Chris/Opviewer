import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LongtermVesselObjectModel } from '../../longterm.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-longterm-print-header',
  templateUrl: './longterm-print-header.component.html',
  styleUrls: ['./longterm-print-header.component.scss'],
})
export class LongtermPrintHeaderComponent implements OnChanges {
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselType: String = 'test';
  @Input() fieldname: String = 'test field';
  @Input() userCompany: String = '';
  public selectedField; // ToDo: This appears to be missing
  public url: string;

  currentDateTime = moment(new Date()).format('YYYY-MM-DD');

  constructor() { }

  ngOnChanges() {
    this.url = window.location.hostname;
  }

}
