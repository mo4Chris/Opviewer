import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SovType } from '../models/SovType';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { TokenModel } from '@app/models/tokenModel';
import { SovModel } from '../models/SovModel';

@Component({
  selector: 'app-sov-dpr-input',
  templateUrl: './sov-dpr-input.component.html',
  styleUrls: ['./sov-dpr-input.component.scss', '../sovreport.component.scss']
})
export class SovDprInputComponent implements OnInit, OnChanges {
  @Input() sovModel: SovModel;
  @Input() vesselObject;
  @Input() tokenInfo: TokenModel;
  @Input() readonly: boolean;

  SovTypeEnum = SovType;

  constructor(
    private datetimeService: DatetimeService,
    private commonService: CommonService,
  ) { }


  hoc = {
    Array: [],
    Total: 0,
    TotalOld: 0,
    TotalNew: 0,
  };
  toolbox = {
    Array: [],
    Total: 0,
    TotalOld: 0,
    TotalNew: 0,
  };
  vesselNonAvailability = {Array: []};
  standBy = {Array: []};
  dp = {Array: []};
  weatherDowntime = {Array: []};

  // times = [];
  // allHours = [];
  // all5Minutes = [];
  // totalCargoIn = 0;
  // totalCargoOut = 0;
  // totalPaxIn = 0;
  // totalPaxOut = 0;

  // v2vCargoIn = 0;
  // v2vCargoOut = 0;
  // v2vPaxIn = 0;
  // v2vPaxOut = 0;

  remarks = '';

  catering = {};
  peopleonBoard = {
    marine: 0,
    marineContractors: 0,
    project: 0
  };
  PoBTotal = 0;

  liquidsObject = {
    fuel: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    luboil: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    domwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    potwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
  };



  ngOnInit() {
    // this.createTimes();
    // this.createSeperateTimes();
  }

  ngOnChanges() {
    // this.updatePaxCargoTotal();
    this.updateHOCTotal();
    this.updateToolboxTotal();
    // this.updatev2vPaxCargoTotal();
    this.setDPRInputFields();
    console.log(this);
  }


  updateHOCTotal() {
    this.hoc.Total = 0;
    this.hoc.TotalNew = this.hoc.TotalOld;
    if (this.hoc.Array.length !== 0) {
      this.hoc.Array.forEach(element => {
        this.hoc.Total += +element.amount;
        this.hoc.TotalNew += +element.amount;
      });
    }
  }

  updateToolboxTotal() {
    this.toolbox.Total = 0;
    this.toolbox.TotalNew = this.toolbox.TotalOld;
    if (this.toolbox.Array.length !== 0) {
      this.toolbox.Array.forEach(element => {
        this.toolbox.Total += +element.amount;
        this.toolbox.TotalNew += +element.amount;
      });
    }
  }

  // updatev2vPaxCargoTotal() {
  //   this.v2vCargoIn = 0;
  //   this.v2vCargoOut = 0;
  //   this.v2vPaxIn = 0;
  //   this.v2vPaxOut = 0;
  //   if (this.sovModel.vessel2vessels.length > 0) {
  //     for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
  //       this.v2vPaxIn = this.v2vPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.v2vPaxIn + 0;
  //       this.v2vPaxOut = this.v2vPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.v2vPaxOut + 0;
  //       this.v2vCargoIn = this.v2vCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.v2vCargoIn + 0;
  //       this.v2vCargoOut = this.v2vCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.v2vCargoOut + 0;
  //     }
  //   }
  // }

  // createTimes() {
  //   this.times = this.datetimeService.createTimesQuarterHour();
  // }

  // createSeperateTimes() {
  //   this.allHours = this.datetimeService.createHoursTimes();
  //   this.all5Minutes = this.datetimeService.createFiveMinutesTimes();
  // }

  // ToDo: Move this to relevant components
  // updatePaxCargoTotal() {
  //   this.totalPaxIn = 0;
  //   this.totalPaxOut = 0;
  //   this.totalCargoIn = 0;
  //   this.totalCargoOut = 0;

  //   if (this.sovModel.sovType === this.SovTypeEnum.Turbine && this.sovModel.turbineTransfers.length > 0) {
  //     for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
  //       this.totalPaxIn = this.totalPaxIn + +this.sovModel.turbineTransfers[i].paxIn || this.totalPaxIn + 0;
  //       this.totalPaxOut = this.totalPaxOut + +this.sovModel.turbineTransfers[i].paxOut || this.totalPaxOut + 0;
  //       this.totalCargoIn = this.totalCargoIn + +this.sovModel.turbineTransfers[i].cargoIn || this.totalCargoIn + 0;
  //       this.totalCargoOut = this.totalCargoOut + +this.sovModel.turbineTransfers[i].cargoOut || this.totalCargoOut + 0;
  //     }
  //   } else if (this.sovModel.sovType === this.SovTypeEnum.Platform && this.sovModel.platformTransfers.length > 0) {
  //     for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
  //       this.totalPaxIn = this.totalPaxIn + +this.sovModel.platformTransfers[i].paxIn || this.totalPaxIn + 0;
  //       this.totalPaxOut = this.totalPaxOut + +this.sovModel.platformTransfers[i].paxOut || this.totalPaxOut + 0;
  //       this.totalCargoIn = this.totalCargoIn + +this.sovModel.platformTransfers[i].cargoIn || this.totalCargoIn + 0;
  //       this.totalCargoOut = this.totalCargoOut + +this.sovModel.platformTransfers[i].cargoOut || this.totalCargoOut + 0;
  //     }
  //   }

  //   if (this.missedPaxCargo.length > 0) {
  //     for (let i = 0; i < this.missedPaxCargo.length; i++) {
  //       this.totalPaxIn = this.totalPaxIn + +this.missedPaxCargo[i].paxIn;
  //       this.totalPaxOut = this.totalPaxOut + +this.missedPaxCargo[i].paxOut;
  //       this.totalCargoIn = this.totalCargoIn + +this.missedPaxCargo[i].cargoIn;
  //       this.totalCargoOut = this.totalCargoOut + +this.missedPaxCargo[i].cargoOut;
  //     }
  //   }
  //   if (this.helicopterPaxCargo.length > 0) {
  //     for (let i = 0; i < this.helicopterPaxCargo.length; i++) {
  //       this.totalPaxIn = this.totalPaxIn + +this.helicopterPaxCargo[i].paxIn;
  //       this.totalPaxOut = this.totalPaxOut + +this.helicopterPaxCargo[i].paxOut;
  //       this.totalCargoIn = this.totalCargoIn + +this.helicopterPaxCargo[i].cargoIn;
  //       this.totalCargoOut = this.totalCargoOut + +this.helicopterPaxCargo[i].cargoOut;
  //     }
  //   }

  //   if (this.sovModel.vessel2vessels.length > 0) {
  //     for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
  //       this.totalPaxIn = this.totalPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.totalPaxIn + 0;
  //       this.totalPaxOut = this.totalPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.totalPaxOut + 0;
  //       this.totalCargoIn = this.totalCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.totalCargoIn + 0;
  //       this.totalCargoOut = this.totalCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.totalCargoOut + 0;
  //     }
  //   }
  // }

  // addMissedTransferToArray() {
  //   this.missedPaxCargo.push({ location: '', from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  // }

  // addHelicopterTransferToArray() {
  //   this.helicopterPaxCargo.push({ from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  // }

  // removeLastFromMissedTransferArray() {
  //   this.missedPaxCargo.pop();
  // }

  // removeLastFromHelicopterTransferArray() {
  //   this.helicopterPaxCargo.pop();
  // }

  setDPRInputFields() {
    this.commonService.getSovDprInput(this.vesselObject).subscribe(SovDprInput => {
      if (SovDprInput.length > 0) {
        this.hoc.Array = SovDprInput[0].hoc;
        this.toolbox.Array = SovDprInput[0].toolbox;
        this.vesselNonAvailability.Array = SovDprInput[0].vesselNonAvailability;
        this.standBy.Array = SovDprInput[0].standBy || [];
        this.weatherDowntime.Array = SovDprInput[0].weatherDowntime;
        this.liquidsObject = SovDprInput[0].liquids;
        this.peopleonBoard = SovDprInput[0].PoB;
        this.remarks = SovDprInput[0].remarks;
        this.catering = SovDprInput[0].catering;
        this.dp.Array = SovDprInput[0].dp;
        this.hoc.TotalOld = SovDprInput[0].HOCAmountOld;
        this.hoc.TotalNew = SovDprInput[0].HOCAmountNew;
        this.toolbox.TotalOld = SovDprInput[0].ToolboxAmountOld;
        this.toolbox.TotalNew = SovDprInput[0].ToolboxAmountNew;
        // this.missedPaxCargo = SovDprInput[0].missedPaxCargo;
        // this.helicopterPaxCargo = SovDprInput[0].helicopterPaxCargo;
        // this.updatePoB();
      }

    }, null, () => {

    });
  }

  // saveMissedPaxCargo() {
  //   this.commonService.saveMissedPaxCargo({
  //     mmsi: this.vesselObject.mmsi,
  //     date: this.vesselObject.date,
  //     MissedPaxCargo: this.missedPaxCargo
  //   }).pipe(
  //     map(
  //       (res) => {
  //         this.alert.sendAlert({
  //           type: 'success',
  //           text: res.data,
  //         });
  //       }
  //     ),
  //     catchError(error => {
  //       this.alert.sendAlert({
  //         type: 'danger',
  //         text: error,
  //       });
  //       throw error;
  //     })
  //   ).subscribe();
  //   this.nonAvailabilityChanged = false;
  // }

  // saveHelicopterPaxCargo() {
  //   this.commonService.saveHelicopterPaxCargo({
  //     mmsi: this.vesselObject.mmsi,
  //     date: this.vesselObject.date,
  //     HelicopterPaxCargo: this.helicopterPaxCargo
  //   }).pipe(
  //     map(
  //       (res) => {
  //         this.alert.sendAlert({
  //           type: 'success',
  //           text: res.data,
  //         });
  //       }
  //     ),
  //     catchError(error => {
  //       this.alert.sendAlert({
  //         type: 'danger',
  //         text: error,
  //       });
  //       throw error;
  //     })
  //   ).subscribe();
  //   this.nonAvailabilityChanged = false;
  // }


  // saveAllTurbineTransfers() {
  //   for (let _i = 0; _i < this.sovModel.turbineTransfers.length; _i++) {
  //     this.sovModel.turbineTransfers[_i].paxIn = this.sovModel.turbineTransfers[_i].paxIn || 0;
  //     this.sovModel.turbineTransfers[_i].paxOut = this.sovModel.turbineTransfers[_i].paxOut || 0;
  //     this.sovModel.turbineTransfers[_i].cargoIn = this.sovModel.turbineTransfers[_i].cargoIn || 0;
  //     this.sovModel.turbineTransfers[_i].cargoOut = this.sovModel.turbineTransfers[_i].cargoOut || 0;
  //     this.commonService.updateSOVTurbinePaxInput({
  //       _id: this.sovModel.turbineTransfers[_i]._id,
  //       mmsi: this.sovModel.turbineTransfers[_i].mmsi,
  //       paxIn: this.sovModel.turbineTransfers[_i].paxIn,
  //       paxOut: this.sovModel.turbineTransfers[_i].paxOut,
  //       cargoIn: this.sovModel.turbineTransfers[_i].cargoIn,
  //       cargoOut: this.sovModel.turbineTransfers[_i].cargoOut
  //     }).pipe(
  //       map(
  //         (res) => {
  //           this.alert.sendAlert({
  //             type: 'success',
  //             text: res.data,
  //           });
  //         }
  //       ),
  //       catchError(error => {
  //         this.alert.sendAlert({
  //           type: 'danger',
  //           text: error,
  //         });
  //         throw error;
  //       })
  //     ).subscribe();
  //     this.nonAvailabilityChanged = false;
  //   }
  //   this.saveHelicopterPaxCargo();
  //   this.saveMissedPaxCargo();
  // }

  // saveAllPlatformTransfers() {
  //   for (let _i = 0; _i < this.sovModel.platformTransfers.length; _i++) {

  //     this.sovModel.platformTransfers[_i].paxIn = this.sovModel.platformTransfers[_i].paxIn || 0;
  //     this.sovModel.platformTransfers[_i].paxOut = this.sovModel.platformTransfers[_i].paxOut || 0;
  //     this.sovModel.platformTransfers[_i].cargoIn = this.sovModel.platformTransfers[_i].cargoIn || 0;
  //     this.sovModel.platformTransfers[_i].cargoOut = this.sovModel.platformTransfers[_i].cargoOut || 0;

  //     this.commonService.updateSOVPlatformPaxInput({
  //       _id: this.sovModel.platformTransfers[_i]._id,
  //       mmsi: this.sovModel.platformTransfers[_i].mmsi,
  //       paxIn: this.sovModel.platformTransfers[_i].paxIn || 0,
  //       paxOut: this.sovModel.platformTransfers[_i].paxOut || 0,
  //       cargoIn: this.sovModel.platformTransfers[_i].cargoIn || 0,
  //       cargoOut: this.sovModel.platformTransfers[_i].cargoOut || 0
  //     }).pipe(
  //       map(
  //         (res) => {
  //           this.alert.sendAlert({
  //             type: 'success',
  //             text: res.data,
  //           });
  //         }
  //       ),
  //       catchError(error => {
  //         this.alert.sendAlert({
  //           type: 'danger',
  //           text: error,
  //         });
  //         throw error;
  //       })
  //     ).subscribe();
  //     this.nonAvailabilityChanged = false;
  //   }
  //   this.saveHelicopterPaxCargo();
  //   this.saveMissedPaxCargo();
  // }

  // savev2vPaxInput() {
  //   for (let _i = 0; _i < this.sovModel.vessel2vessels[0].transfers.length; _i++) {
  //     this.sovModel.vessel2vessels[0].transfers[_i].paxIn = this.sovModel.vessel2vessels[0].transfers[_i].paxIn || 0;
  //     this.sovModel.vessel2vessels[0].transfers[_i].paxOut = this.sovModel.vessel2vessels[0].transfers[_i].paxOut || 0;
  //     this.sovModel.vessel2vessels[0].transfers[_i].cargoIn = this.sovModel.vessel2vessels[0].transfers[_i].cargoIn || 0;
  //     this.sovModel.vessel2vessels[0].transfers[_i].cargoOut = this.sovModel.vessel2vessels[0].transfers[_i].cargoOut || 0;
  //   }

  //   this.commonService.updateSOVv2vPaxInput({
  //     mmsi: this.vesselObject.mmsi,
  //     date: this.vesselObject.date,
  //     transfers: this.sovModel.vessel2vessels[0].transfers
  //   }).pipe(
  //     map(
  //       (res) => {
  //         this.alert.sendAlert({
  //           type: 'success',
  //           text: res.data,
  //         });
  //       }
  //     ),
  //     catchError(error => {
  //       this.alert.sendAlert({
  //         type: 'danger',
  //         text: error,
  //       });
  //       throw error;
  //     })
  //   ).subscribe();
  //   this.nonAvailabilityChanged = false;
  // }


  // savePlatformPaxInput(transfer) {
  //   this.commonService.updateSOVPlatformPaxInput({
  //     _id: transfer._id,
  //     mmsi: this.vesselObject.mmsi,
  //     paxIn: transfer.paxIn || 0,
  //     paxOut: transfer.paxOut || 0,
  //     cargoIn: transfer.cargoIn || 0,
  //     cargoOut: transfer.cargoOut || 0
  //   }).pipe(
  //     map(
  //       (res) => {
  //         this.alert.sendAlert({
  //           type: 'success',
  //           text: res.data,
  //         });
  //       }
  //     ),
  //     catchError(error => {
  //       this.alert.sendAlert({
  //         type: 'danger',
  //         text: error,
  //       });
  //       throw error;
  //     })
  //   ).subscribe();
  //   this.nonAvailabilityChanged = false;
  // }

  // saveTurbinePaxInput(transfer) {
  //     this.commonService.updateSOVTurbinePaxInput({
  //         _id: transfer._id,
  //         mmsi: this.vesselObject.mmsi,
  //         paxIn: transfer.paxIn || 0,
  //         paxOut: transfer.paxOut || 0,
  //         cargoIn: transfer.cargoIn || 0,
  //         cargoOut: transfer.cargoOut || 0
  //     }).pipe(
  //         map(
  //             (res) => {
  //                 this.alert.sendAlert({
  //                     type: 'success',
  //                     text: res.data,
  //                 });
  //             }
  //         ),
  //         catchError(error => {
  //             this.alert.sendAlert({
  //                 type: 'danger',
  //                 text: error,
  //             });
  //             throw error;
  //         })
  //     ).subscribe();
  //     this.nonAvailabilityChanged = false;
  // }


}
