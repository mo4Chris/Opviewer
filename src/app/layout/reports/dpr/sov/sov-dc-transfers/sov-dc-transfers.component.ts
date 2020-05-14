import { Component, OnInit, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./sov-dc-transfers.component.scss', '../sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() dcInfo: DaughtercraftInfoModel;

  constructor(
    private datetimeService: DatetimeService,
    private calcService: CalculationService,
    private commonService: CommonService,
    private alert: AlertService,
    private ref: ChangeDetectorRef,
  ) { }

  map = [];
  transfers = [];
  missedTransfers = [];
  hasChanges = false;
  vesselName = '';

  ngOnChanges() {
    this.transfers = [];
    this.missedTransfers = [];
    this.hasChanges = false;
    if (this.dcInfo && this.dcInfo.mmsi) {
      this.vessel2vessels.forEach(v2vs => {
        v2vs.CTVactivity.forEach(_activity => {
          if (_activity.mmsi === this.dcInfo.mmsi) {
            this.map = _activity.map
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
    this.missedTransfers.forEach(_transfer => {
      _transfer.paxIn = _transfer.paxIn || 0;
      _transfer.paxOut = _transfer.paxOut || 0;
      _transfer.cargoIn = _transfer.cargoIn || 0;
      _transfer.cargoOut = _transfer.cargoOut || 0;
    });
    this.commonService.updateSOVv2vTurbineTransfers({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      update: {
        mmsi: this.dcInfo.mmsi || 0,
        date: this.vesselObject.date,
        turbineVisits: this.transfers,
        missedVisits: this.missedTransfers,
        map: this.map,
      }
    }).pipe(
      map(
        (res) => {
          this.alert.sendAlert({
            type: 'success',
            text: res.data,
          });
          this.hasChanges = false;
          this.ref.detectChanges();
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

export interface DaughtercraftInfoModel {
  mmsi: number;
  nicename: string;
}
