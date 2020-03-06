import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { Vessel2vesselModel } from '../models/Transfers/vessel2vessel/Vessel2vessel';
import { isArray, isObject, isNumber } from 'util';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';

@Component({
  selector: 'app-sov-dc-transfers',
  templateUrl: './sov-dc-transfers.component.html',
  styleUrls: ['./sov-dc-transfers.component.scss']
})
export class SovDcTransfersComponent implements OnChanges {
  @Input() readonly = true;
  @Input() vessel2vessels: Vessel2vesselModel[] = [{
    transfers: [],
    CTVactivity: [],
    date: NaN,
    mmsi: NaN,
  }]; // Always array of length 1!
  @Input() sovInfo = {};
  @Input() vesselObject: VesselObjectModel;
  // @Output() v2vPaxTotals = new EventEmitter<V2vPaxTotalModel>();
  constructor(
    private datetimeService: DatetimeService,
    private calcService: CalculationService,
  ) { }

  transfers = [];
  mmsi: number;
  vesselName = '';

  ngOnChanges() {
    this.mmsi = null;
    this.transfers = [];
    this.vessel2vessels.forEach(v2vs => {
      console.log(v2vs);
      v2vs.transfers.forEach(_transfer => {
        if (_transfer.type === 'Daughter-craft departure') {
          this.mmsi = _transfer.toMMSI;
        } else if (_transfer.type === 'Daughter-craft return') {
          this.mmsi = _transfer.toMMSI;
          this.vesselName = _transfer.toVesselname;
        }
      });
      v2vs.CTVactivity.forEach(_activity => {
        if (_activity.mmsi === this.mmsi) {
          console.log(_activity);
          if (isArray(_activity.turbineVisits)) {
            console.log('ARRAY');
            this.transfers = _activity.turbineVisits;
          } else if (isObject(_activity.turbineVisits) && isNumber(_activity.turbineVisits['startTime'])) {
            console.log('OBJECT');
            this.transfers = [_activity.turbineVisits];
          }
        }
      });
    });
    console.log(this);
  }

  GetDecimalValueForNumber(num, endpoint) {
    return this.calcService.GetDecimalValueForNumber(num, endpoint);
  }
  GetMatlabDateToJSTime(serial) {
      return this.datetimeService.MatlabDateToJSTime(serial);
  }
  getMatlabDateToCustomJSTime(serial, format) {
      return this.datetimeService.MatlabDateToCustomJSTime(serial, format);
  }
  GetMatlabDurationToMinutes(serial) {
    return this.datetimeService.MatlabDurationToMinutes(serial);
  }

}
