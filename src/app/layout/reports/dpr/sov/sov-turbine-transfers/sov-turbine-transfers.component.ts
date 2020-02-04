import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { TurbineTransfer } from '../models/Transfers/TurbineTransfer';
import { CycleTime } from '../models/CycleTime';
import { map, catchError } from 'rxjs/operators';
import { AlertService } from '@app/supportModules/alert.service';
import { CommonService } from '@app/common.service';
import { V2vPaxTotalModel } from '../sov-v2v-transfers/sov-v2v-transfers.component';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';

@Component({
  selector: 'app-sov-turbine-transfers',
  templateUrl: './sov-turbine-transfers.component.html',
  styleUrls: ['./sov-turbine-transfers.component.scss', '../sovreport.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovTurbineTransfersComponent implements OnChanges {
  @Input() readonly = true;
  @Input() vesselObject: VesselObjectModel;

  @Input() turbineTransfers: TurbineTransfer[] = [];
  @Input() cycleTimes: CycleTime[] = [];
  @Input() v2vPaxCargoTotals: V2vPaxTotalModel;

  @Input() missedPaxCargo = [];
  @Input() helicopterPaxCargo = [];

  gangwayActive = true;

  totalCargoIn = 0;
  totalCargoOut = 0;
  totalPaxIn = 0;
  totalPaxOut = 0;

  constructor(
    private calcService: CalculationService,
    private datetimeService: DatetimeService,
    private alert: AlertService,
    private commonService: CommonService,
  ) {
  }

  ngOnChanges() {
    this.updatePaxCargoTotal();
    this.gangwayActive = this.turbineTransfers.some(
      transfer => <number><any> transfer.timeGangwayReady > 0
    );
  }


  updatePaxCargoTotal() {
    this.totalPaxIn = 0;
    this.totalPaxOut = 0;
    this.totalCargoIn = 0;
    this.totalCargoOut = 0;

    if (this.turbineTransfers.length > 0) {
      for (let i = 0; i < this.turbineTransfers.length; i++) {
        this.totalPaxIn += +this.turbineTransfers[i].paxIn || 0;
        this.totalPaxOut += +this.turbineTransfers[i].paxOut || 0;
        this.totalCargoIn += +this.turbineTransfers[i].cargoIn || 0;
        this.totalCargoOut += +this.turbineTransfers[i].cargoOut || 0;
      }
    }
    if (this.missedPaxCargo && this.missedPaxCargo.length > 0) {
      for (let i = 0; i < this.missedPaxCargo.length; i++) {
        this.totalPaxIn += +this.missedPaxCargo[i].paxIn || 0;
        this.totalPaxOut += +this.missedPaxCargo[i].paxOut || 0;
        this.totalCargoIn += +this.missedPaxCargo[i].cargoIn || 0;
        this.totalCargoOut += +this.missedPaxCargo[i].cargoOut || 0;
      }
    }
    if (this.helicopterPaxCargo && this.helicopterPaxCargo.length > 0) {
      for (let i = 0; i < this.helicopterPaxCargo.length; i++) {
        this.totalPaxIn += +this.helicopterPaxCargo[i].paxIn || 0;
        this.totalPaxOut += +this.helicopterPaxCargo[i].paxOut || 0;
        this.totalCargoIn += +this.helicopterPaxCargo[i].cargoIn || 0;
        this.totalCargoOut += +this.helicopterPaxCargo[i].cargoOut || 0;
      }
    }
    if (this.v2vPaxCargoTotals) {
      this.totalPaxIn += this.v2vPaxCargoTotals.paxIn || 0;
      this.totalPaxOut += this.v2vPaxCargoTotals.paxOut || 0;
      this.totalCargoIn += this.v2vPaxCargoTotals.cargoIn || 0;
      this.totalCargoOut += this.v2vPaxCargoTotals.cargoOut || 0;
    }
  }

  // Add/remove function
  addMissedTransferToArray() {
    this.missedPaxCargo.push({ location: '', from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  }
  addHelicopterTransferToArray() {
    this.helicopterPaxCargo.push({ from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  }
  removeLastFromMissedTransferArray() {
    this.missedPaxCargo.pop();
  }
  removeLastFromHelicopterTransferArray() {
    this.helicopterPaxCargo.pop();
  }

  // Save functions
  saveStats(saveFcnName: string, saveObject: object): void {
    // Generic saver for all the functions below
    const baseObj = {
      mmsi: this.vesselObject.mmsi,
    };
    this.commonService[saveFcnName]({...baseObj, ...saveObject}).pipe(
      map(
        (res: any) => {
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
    this.updatePaxCargoTotal();
  }
  saveMissedPaxCargo() {
    this.saveStats('saveMissedPaxCargo', {
      MissedPaxCargo: this.missedPaxCargo,
      date: this.vesselObject.date,
    });
    // this.nonAvailabilityChanged = false;
  }
  saveHelicopterPaxCargo() {
    this.saveStats('saveMissedPaxCargo', {
      date: this.vesselObject.date,
      HelicopterPaxCargo: this.helicopterPaxCargo
    });
    // this.nonAvailabilityChanged = false;
  }
  saveAllTurbineTransfers() {
    this.turbineTransfers.forEach(_transfer => {
      _transfer.paxIn = _transfer.paxIn || 0;
      _transfer.paxOut = _transfer.paxOut || 0;
      _transfer.cargoIn = _transfer.cargoIn || 0;
      _transfer.cargoOut = _transfer.cargoOut || 0;
      this.saveStats('updateSOVTurbinePaxInput', {
        _id: _transfer._id,
        paxIn: _transfer.paxIn,
        paxOut: _transfer.paxOut,
        cargoIn: _transfer.cargoIn,
        cargoOut: _transfer.cargoOut,
      });
    // this.nonAvailabilityChanged = false;
    });
    this.saveHelicopterPaxCargo();
    this.saveMissedPaxCargo();
  }
  saveTurbinePaxInput(transfer) {
    this.saveStats('updateSOVTurbinePaxInput', {
      _id: transfer._id,
      paxIn: transfer.paxIn || 0,
      paxOut: transfer.paxOut || 0,
      cargoIn: transfer.cargoIn || 0,
      cargoOut: transfer.cargoOut || 0
    });
    // this.nonAvailabilityChanged = false;
  }



  // Data formatting
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
