import { Component, OnInit, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { Vessel2vesselModel, MissedDcTransfer } from '../models/Transfers/vessel2vessel/Vessel2vessel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { AlertService } from '@app/supportModules/alert.service';
import { v2vTurbineTransfer } from '../models/Transfers/vessel2vessel/V2vCtvActivity';

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

  private map = [];
  transfers: v2vTurbineTransfer[] = [];
  missedTransfers: MissedDcTransfer[] = [];
  hasChanges = false;
  vesselName = '';

  ngOnChanges() {
    this.transfers = [];
    this.missedTransfers = [];
    this.hasChanges = false;
    if (!(this.dcInfo && this.dcInfo.mmsi)) return;

    this.vessel2vessels.forEach(v2v => {
      v2v.CTVactivity.forEach(_activity => {
        if (_activity.mmsi != this.dcInfo.mmsi) return;
        this.map = _activity.map;
        if (Array.isArray(_activity.turbineVisits)) {
          this.transfers = _activity.turbineVisits;
        } else if (typeof(_activity.turbineVisits) == 'object' && typeof(_activity.turbineVisits['startTime']) == 'number') {
          this.transfers = [_activity.turbineVisits];
        }
      });
      if (v2v.missedTransfers) {
        this.missedTransfers = v2v.missedTransfers;
      }
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
        map: this.map,
      },
      missedTransfers: this.missedTransfers,
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
    return this.calcService.getDecimalValueForNumber(num, endpoint);
  }
  GetMatlabDateToJSTime(serial) {
      return this.datetimeService.matlabDatenumToTimeString(serial);
  }
  getMatlabDateToCustomJSTime(serial, format) {
      return this.datetimeService.matlabDatenumToFormattedTimeString(serial, format);
  }
  GetMatlabDurationToMinutes(serial) {
    return this.datetimeService.matlabDurationToMinutes(serial);
  }

}

export interface DaughtercraftInfoModel {
  mmsi: number;
  nicename: string;
}
