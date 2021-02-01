import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { AlertService } from '@app/supportModules/alert.service';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { V2vPaxTotalModel } from '../sov-v2v-transfers/sov-v2v-transfers.component';
import { PlatformTransfer } from '../models/Transfers/PlatformTransfer';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';

@Component({
  selector: 'app-sov-platform-transfers',
  templateUrl: './sov-platform-transfers.component.html',
  styleUrls: ['./sov-platform-transfers.component.scss', '../sovreport.component.scss']
})
export class SovPlatformTransfersComponent implements OnChanges {
  @Input() readonly = true;
  @Input() vesselObject: VesselObjectModel;

  @Input() platformTransfers: PlatformTransfer[] = [];
  @Input() v2vPaxCargoTotals: V2vPaxTotalModel;

  @Input() missedPaxCargo = [];
  @Input() helicopterPaxCargo = [];

  totalCargoIn = 0;
  totalCargoOut = 0;
  totalPaxIn = 0;
  totalPaxOut = 0;

  gangwayActive = true;

  constructor(
    private calcService: CalculationService,
    private datetimeService: DatetimeService,
    private alert: AlertService,
    private commonService: CommonService,
    ) { }

  ngOnChanges() {
    this.updatePaxCargoTotal();
    this.gangwayActive = this.platformTransfers.some(transfer => transfer.gangwayDeployedDuration > 0);
  }

  // loadMissingHeliData() {
  //   this.commonService.getSovDprInput(this.vesselObject).subscribe(SovDprInput => {
  //     if (SovDprInput.length > 0) {
  //       this.missedPaxCargo = SovDprInput[0].missedPaxCargo;
  //       this.helicopterPaxCargo = SovDprInput[0].helicopterPaxCargo;
  //     }
  //   });
  // }

  updatePaxCargoTotal() {
    this.totalPaxIn = 0;
    this.totalPaxOut = 0;
    this.totalCargoIn = 0;
    this.totalCargoOut = 0;
    if (this.platformTransfers.length > 0) {
      for (let i = 0; i < this.platformTransfers.length; i++) {
        this.totalPaxIn += +this.platformTransfers[i].paxIn || 0;
        this.totalPaxOut += +this.platformTransfers[i].paxOut || 0;
        this.totalCargoIn += +this.platformTransfers[i].cargoIn || 0;
        this.totalCargoOut += +this.platformTransfers[i].cargoOut || 0;
      }
    }
    if (this.missedPaxCargo.length > 0) {
      for (let i = 0; i < this.missedPaxCargo.length; i++) {
        this.totalPaxIn += +this.missedPaxCargo[i].paxIn || 0;
        this.totalPaxOut += +this.missedPaxCargo[i].paxOut || 0;
        this.totalCargoIn += +this.missedPaxCargo[i].cargoIn || 0;
        this.totalCargoOut += +this.missedPaxCargo[i].cargoOut || 0;
      }
    }
    if (this.helicopterPaxCargo.length > 0) {
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
  // Various save functions
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
  }
  saveHelicopterPaxCargo() {
    this.saveStats('saveHelicopterPaxCargo', {
      date: this.vesselObject.date,
      HelicopterPaxCargo: this.helicopterPaxCargo
    });
  }
  saveAllPlatformTransfers() {
    this.platformTransfers.forEach(_transfer => {
      _transfer.paxIn = _transfer.paxIn || 0;
      _transfer.paxOut = _transfer.paxOut || 0;
      _transfer.cargoIn = _transfer.cargoIn || 0;
      _transfer.cargoOut = _transfer.cargoOut || 0;
      this.saveStats('updateSOVPlatformPaxInput', {
        _id: _transfer._id,
        paxIn: _transfer.paxIn,
        paxOut: _transfer.paxOut,
        cargoIn: _transfer.cargoIn,
        cargoOut: _transfer.cargoOut,
      });
    });
    this.saveHelicopterPaxCargo();
    this.saveMissedPaxCargo();
  }
  savePlatformPaxInput(transfer) {
    this.saveStats('updateSOVPlatformPaxInput', {
      _id: transfer._id,
      paxIn: transfer.paxIn || 0,
      paxOut: transfer.paxOut || 0,
      cargoIn: transfer.cargoIn || 0,
      cargoOut: transfer.cargoOut || 0
    });
  }



  // Data formatting
  GetDecimalValueForNumber(num, endpoint) {
    return this.calcService.getDecimalValueForNumber(num, endpoint);
  }
  getDecimalTimeToFormattedTime(time) {
    return this.datetimeService.formatMatlabDuration(time);
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
