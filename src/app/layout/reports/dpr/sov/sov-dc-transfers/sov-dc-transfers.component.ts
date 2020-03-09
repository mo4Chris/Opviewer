import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { Vessel2vesselModel } from '../models/Transfers/vessel2vessel/Vessel2vessel';
import { isArray, isObject, isNumber } from 'util';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { AlertService } from '@app/supportModules/alert.service';

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

  constructor(
    private datetimeService: DatetimeService,
    private calcService: CalculationService,
    private commonService: CommonService,
    private alert: AlertService,
  ) { }

  transfers = [];
  missedTransfers = [];
  hasChanges = false;
  mmsi: number;
  vesselName = '';

  ngOnChanges() {
    this.mmsi = null;
    this.transfers = [];
    this.missedTransfers = [];
    this.hasChanges = false;
    this.vessel2vessels.forEach(v2vs => {
      v2vs.transfers.forEach(_transfer => {
        if (_transfer.type === 'Daughter-craft departure' || _transfer.type === 'Daughter-craft return') {
          if (this.mmsi > 0 && this.mmsi !== _transfer.toMMSI) {
            console.error('Implementation only supports 1 daughtercraft!');
          } else {
            this.mmsi = _transfer.toMMSI;
            this.vesselName = _transfer.toVesselname;
          }
        }
      });
      v2vs.CTVactivity.forEach(_activity => {
        if (_activity.mmsi === this.mmsi) {
          if (isArray(_activity.turbineVisits)) {
            this.transfers = _activity.turbineVisits;
          } else if (isObject(_activity.turbineVisits) && isNumber(_activity.turbineVisits['startTime'])) {
            this.transfers = [_activity.turbineVisits];
          }
          if (isArray(_activity.missedVisits)) {
            this.missedTransfers = _activity.missedVisits;
          } else {
            // We need to link our empty array to the one in the v2v object
            _activity.missedVisits = this.missedTransfers;
          }
        }
      });
    });
  }

  addMissedTransferToArray() {
    this.missedTransfers.push({
      location: '',
      from: {hour: null, minutes: null},
      to: {hour: null, minutes: null},
      paxIn: 0,
      paxOut: 0,
      cargoIn: 0,
      cargoOut: 0,
    });
  }

  removeLastFromMissedTransferArray() {
    this.missedTransfers.pop();
  }

  updatePaxCargoTotal() {
    this.hasChanges = true;
  }

  saveTransfers() {
    this.transfers.forEach(_transfer => {
      _transfer.paxIn = _transfer.paxIn || 0;
      _transfer.paxOut = _transfer.paxOut || 0;
      _transfer.cargoIn = _transfer.cargoIn || 0;
      _transfer.cargoOut = _transfer.cargoOut || 0;
    });
    this.commonService.updateSOVv2vPaxInput({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      transfers: this.transfers
    }).pipe(
      map(
        (res) => {
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
