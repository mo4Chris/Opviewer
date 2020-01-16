import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SovType } from '../models/SovType';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-sov-dpr-input',
  templateUrl: './sov-dpr-input.component.html',
  styleUrls: ['./sov-dpr-input.component.scss']
})
export class SovDprInputComponent implements OnInit, OnChanges {
  @Input() sovModel;
  @Input() vesselObject;
  @Input() tokenInfo;

  SovTypeEnum = SovType;

  constructor(
    private datetimeService: DatetimeService,
    private commonService: CommonService,
    private alert: AlertService,
  ) { }


  HOCArray = [];
  HOCTotal = 0;
  HOCTotalOld = 0;
  HOCTotalNew = 0;
  ToolboxArray = [];
  ToolboxTotal = 0;
  ToolboxTotalOld = 0;
  ToolboxTotalNew = 0;
  VesselNonAvailabilityArray = [];
  standByArray = [];
  dpArray = [];
  WeatherDowntimeArray = [];


  fuelChanged = false;
  incidentsChanged = false;
  nonAvailabilityChanged = false;
  weatherDowntimeChanged = false;
  cateringChanged = false;
  remarksChanged = false;
  poBChanged = false;
  dpChanged = false;


  times = [];
  allHours = [];
  all5Minutes = [];
  totalCargoIn = 0;
  totalCargoOut = 0;
  totalPaxIn = 0;
  totalPaxOut = 0;

  totalStandbyTime = '00:00';
  totalTechnicalDowntimeTime = '00:00';
  totalWeatherDowntimeTime = '00:00';

  v2vCargoIn = 0;
  v2vCargoOut = 0;
  v2vPaxIn = 0;
  v2vPaxOut = 0;

  remarks = '';

  cateringObject = {};
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

  missedPaxCargo = [];
  helicopterPaxCargo = [];


  ngOnInit() {
    this.createTimes();
    this.createSeperateTimes();
  }

  ngOnChanges() {
    this.fuelChanged = false;
    this.incidentsChanged = false;
    this.nonAvailabilityChanged = false;
    this.weatherDowntimeChanged = false;
    this.cateringChanged = false;
    this.remarksChanged = false;

    this.updatePaxCargoTotal();
    this.updateHOCTotal();
    this.updatePoB();
    this.updateToolboxTotal();
    this.updatev2vPaxCargoTotal();
    this.setDPRInputFields();
  }


  updateHOCTotal() {
    this.HOCTotal = 0;
    this.HOCTotalNew = this.HOCTotalOld;
    if (this.HOCArray.length !== 0) {
      this.HOCArray.forEach(element => {
        this.HOCTotal = this.HOCTotal + +element.amount;
        this.HOCTotalNew = this.HOCTotalNew + +element.amount;
      });
    }
  }

  updateToolboxTotal() {
    this.ToolboxTotal = 0;
    this.ToolboxTotalNew = this.ToolboxTotalOld;
    if (this.ToolboxArray.length !== 0) {
      this.ToolboxArray.forEach(element => {
        this.ToolboxTotal = this.ToolboxTotal + +element.amount;
        this.ToolboxTotalNew = this.ToolboxTotalNew + +element.amount;
      });
    }
  }

  updatev2vPaxCargoTotal() {
    this.v2vCargoIn = 0;
    this.v2vCargoOut = 0;
    this.v2vPaxIn = 0;
    this.v2vPaxOut = 0;
    if (this.sovModel.vessel2vessels.length > 0) {
      for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
        this.v2vPaxIn = this.v2vPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.v2vPaxIn + 0;
        this.v2vPaxOut = this.v2vPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.v2vPaxOut + 0;
        this.v2vCargoIn = this.v2vCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.v2vCargoIn + 0;
        this.v2vCargoOut = this.v2vCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.v2vCargoOut + 0;
      }
    }
  }

  createTimes() {
    this.times = this.datetimeService.createTimesQuarterHour();
  }

  createSeperateTimes() {
    this.allHours = this.datetimeService.createHoursTimes();
    this.all5Minutes = this.datetimeService.createFiveMinutesTimes();
  }

  updateFuel() {
    this.liquidsObject.fuel.newValue = +(+this.liquidsObject.fuel.oldValue + +this.liquidsObject.fuel.loaded - +this.liquidsObject.fuel.consumed - +this.liquidsObject.fuel.discharged).toFixed(1);
  }

  updateLuboil() {
    this.liquidsObject.luboil.newValue = +(+this.liquidsObject.luboil.oldValue + +this.liquidsObject.luboil.loaded - +this.liquidsObject.luboil.consumed - +this.liquidsObject.luboil.discharged).toFixed(1);
  }

  updateDomwater() {
    this.liquidsObject.domwater.newValue = +(+this.liquidsObject.domwater.oldValue + +this.liquidsObject.domwater.loaded - +this.liquidsObject.domwater.consumed - +this.liquidsObject.domwater.discharged).toFixed(1);
  }

  updatePotwater() {
    this.liquidsObject.potwater.newValue = +(+this.liquidsObject.potwater.oldValue + +this.liquidsObject.potwater.loaded - +this.liquidsObject.potwater.consumed - this.liquidsObject.potwater.discharged).toFixed(1);
  }

  updatePoB() {
    this.PoBTotal = 0;
    this.PoBTotal = (+this.PoBTotal + +this.peopleonBoard.marineContractors + +this.peopleonBoard.marine + +this.peopleonBoard.project);
  }

  objectTimeDifference(object) {
      return this.datetimeService.objectTimeDifference(object);
    }

    getTotalTimeStandby(standbyArray) {
        this.totalStandbyTime = this.datetimeService.arrayTotalTime(standbyArray);
    }

    getTotalTimeVesselNonAvailability(VesselNonAvailabilityArray) {
        this.totalTechnicalDowntimeTime = this.datetimeService.arrayTotalTime(VesselNonAvailabilityArray);
    }

    getTotalTimeWeatherDowntime(WeatherDowntimeArray) {
        this.totalWeatherDowntimeTime = this.datetimeService.arrayTotalTime(WeatherDowntimeArray);
    }

  updatePaxCargoTotal() {
    this.totalPaxIn = 0;
    this.totalPaxOut = 0;
    this.totalCargoIn = 0;
    this.totalCargoOut = 0;

    if (this.sovModel.sovType === this.SovTypeEnum.Turbine && this.sovModel.turbineTransfers.length > 0) {
      for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
        this.totalPaxIn = this.totalPaxIn + +this.sovModel.turbineTransfers[i].paxIn || this.totalPaxIn + 0;
        this.totalPaxOut = this.totalPaxOut + +this.sovModel.turbineTransfers[i].paxOut || this.totalPaxOut + 0;
        this.totalCargoIn = this.totalCargoIn + +this.sovModel.turbineTransfers[i].cargoIn || this.totalCargoIn + 0;
        this.totalCargoOut = this.totalCargoOut + +this.sovModel.turbineTransfers[i].cargoOut || this.totalCargoOut + 0;
      }
    } else if (this.sovModel.sovType === this.SovTypeEnum.Platform && this.sovModel.platformTransfers.length > 0) {
      for (let i = 0; i < this.sovModel.turbineTransfers.length; i++) {
        this.totalPaxIn = this.totalPaxIn + +this.sovModel.platformTransfers[i].paxIn || this.totalPaxIn + 0;
        this.totalPaxOut = this.totalPaxOut + +this.sovModel.platformTransfers[i].paxOut || this.totalPaxOut + 0;
        this.totalCargoIn = this.totalCargoIn + +this.sovModel.platformTransfers[i].cargoIn || this.totalCargoIn + 0;
        this.totalCargoOut = this.totalCargoOut + +this.sovModel.platformTransfers[i].cargoOut || this.totalCargoOut + 0;
      }
    }

    if (this.missedPaxCargo.length > 0) {
      for (let i = 0; i < this.missedPaxCargo.length; i++) {
        this.totalPaxIn = this.totalPaxIn + +this.missedPaxCargo[i].paxIn;
        this.totalPaxOut = this.totalPaxOut + +this.missedPaxCargo[i].paxOut;
        this.totalCargoIn = this.totalCargoIn + +this.missedPaxCargo[i].cargoIn;
        this.totalCargoOut = this.totalCargoOut + +this.missedPaxCargo[i].cargoOut;
      }
    }
    if (this.helicopterPaxCargo.length > 0) {
      for (let i = 0; i < this.helicopterPaxCargo.length; i++) {
        this.totalPaxIn = this.totalPaxIn + +this.helicopterPaxCargo[i].paxIn;
        this.totalPaxOut = this.totalPaxOut + +this.helicopterPaxCargo[i].paxOut;
        this.totalCargoIn = this.totalCargoIn + +this.helicopterPaxCargo[i].cargoIn;
        this.totalCargoOut = this.totalCargoOut + +this.helicopterPaxCargo[i].cargoOut;
      }
    }

    if (this.sovModel.vessel2vessels.length > 0) {
      for (let i = 0; i < this.sovModel.vessel2vessels[0].transfers.length; i++) {
        this.totalPaxIn = this.totalPaxIn + +this.sovModel.vessel2vessels[0].transfers[i].paxIn || this.totalPaxIn + 0;
        this.totalPaxOut = this.totalPaxOut + +this.sovModel.vessel2vessels[0].transfers[i].paxOut || this.totalPaxOut + 0;
        this.totalCargoIn = this.totalCargoIn + +this.sovModel.vessel2vessels[0].transfers[i].cargoIn || this.totalCargoIn + 0;
        this.totalCargoOut = this.totalCargoOut + +this.sovModel.vessel2vessels[0].transfers[i].cargoOut || this.totalCargoOut + 0;
      }
    }
  }

  addHoCToArray() {
    this.HOCArray.push({ value: '', amount: 1 });
  }

  addToolboxToArray() {
    this.ToolboxArray.push({ value: '', amount: 1 });
  }

  addVesselNonAvailabilityToArray() {
    this.VesselNonAvailabilityArray.push({ reason: 'DC small breakdown', from: '00:00', to: '00:00' });
  }

  addStandByToArray() {
    this.standByArray.push({ reason: 'No work planned', from: '00:00', to: '00:00' });
  }

  addWeatherDowntimeToArray() {
    this.WeatherDowntimeArray.push({ decidedBy: 'Siemens Gamesa', from: '00:00', to: '00:00', vesselsystem: 'Gangway' });
  }

  addMissedTransferToArray() {
    this.missedPaxCargo.push({ location: '', from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  }

  addHelicopterTransferToArray() {
    this.helicopterPaxCargo.push({ from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' }, paxIn: 0, paxOut: 0, cargoIn: 0, cargoOut: 0 });
  }

  addDPToArray() {
    this.dpArray.push({ from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' } });
  }

  removeLastFromMissedTransferArray() {
    this.missedPaxCargo.pop();
  }

  removeLastFromHelicopterTransferArray() {
    this.helicopterPaxCargo.pop();
  }
  removeLastFromDPArray() {
    this.dpArray.pop();
  }

  removeLastFromToolboxArray() {
    this.ToolboxArray.pop();
  }

  removeLastFromHOCArray() {
    this.HOCArray.pop();
  }

  removeLastFromVesselNonAvailabilityArray() {
    this.VesselNonAvailabilityArray.pop();
  }

  removeLastFromStandByArray() {
    this.standByArray.pop();
  }

  removeLastFromWeatherDowntimeArray() {
    this.WeatherDowntimeArray.pop();
  }

  setDPRInputFields() {
    this.commonService.getSovDprInput(this.vesselObject).subscribe(SovDprInput => {
      if (SovDprInput.length > 0) {
        this.HOCArray = SovDprInput[0].hoc;
        this.ToolboxArray = SovDprInput[0].toolbox;
        this.VesselNonAvailabilityArray = SovDprInput[0].vesselNonAvailability;
        this.standByArray = SovDprInput[0].standBy || [];
        this.WeatherDowntimeArray = SovDprInput[0].weatherDowntime;
        this.liquidsObject = SovDprInput[0].liquids;
        this.peopleonBoard = SovDprInput[0].PoB;
        this.remarks = SovDprInput[0].remarks;
        this.cateringObject = SovDprInput[0].catering;
        this.dpArray = SovDprInput[0].dp;
        this.HOCTotalOld = SovDprInput[0].HOCAmountOld;
        this.HOCTotalNew = SovDprInput[0].HOCAmountNew;
        this.ToolboxTotalOld = SovDprInput[0].ToolboxAmountOld;
        this.ToolboxTotalNew = SovDprInput[0].ToolboxAmountNew;
        this.missedPaxCargo = SovDprInput[0].missedPaxCargo;
        this.helicopterPaxCargo = SovDprInput[0].helicopterPaxCargo;
        this.updatePoB();
      }

    }, null, () => {

    });
  }

  saveMissedPaxCargo() {
    this.commonService.saveMissedPaxCargo({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      MissedPaxCargo: this.missedPaxCargo
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
    this.nonAvailabilityChanged = false;
  }

  saveHelicopterPaxCargo() {
    this.commonService.saveHelicopterPaxCargo({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      HelicopterPaxCargo: this.helicopterPaxCargo
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
    this.nonAvailabilityChanged = false;
  }


  saveAllTurbineTransfers() {
    for (let _i = 0; _i < this.sovModel.turbineTransfers.length; _i++) {
      this.sovModel.turbineTransfers[_i].paxIn = this.sovModel.turbineTransfers[_i].paxIn || 0;
      this.sovModel.turbineTransfers[_i].paxOut = this.sovModel.turbineTransfers[_i].paxOut || 0;
      this.sovModel.turbineTransfers[_i].cargoIn = this.sovModel.turbineTransfers[_i].cargoIn || 0;
      this.sovModel.turbineTransfers[_i].cargoOut = this.sovModel.turbineTransfers[_i].cargoOut || 0;
      this.commonService.updateSOVTurbinePaxInput({
        _id: this.sovModel.turbineTransfers[_i]._id,
        mmsi: this.sovModel.turbineTransfers[_i].mmsi,
        paxIn: this.sovModel.turbineTransfers[_i].paxIn,
        paxOut: this.sovModel.turbineTransfers[_i].paxOut,
        cargoIn: this.sovModel.turbineTransfers[_i].cargoIn,
        cargoOut: this.sovModel.turbineTransfers[_i].cargoOut
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
      this.nonAvailabilityChanged = false;
    }
    this.saveHelicopterPaxCargo();
    this.saveMissedPaxCargo();
  }

  saveAllPlatformTransfers() {
    for (let _i = 0; _i < this.sovModel.platformTransfers.length; _i++) {

      this.sovModel.platformTransfers[_i].paxIn = this.sovModel.platformTransfers[_i].paxIn || 0;
      this.sovModel.platformTransfers[_i].paxOut = this.sovModel.platformTransfers[_i].paxOut || 0;
      this.sovModel.platformTransfers[_i].cargoIn = this.sovModel.platformTransfers[_i].cargoIn || 0;
      this.sovModel.platformTransfers[_i].cargoOut = this.sovModel.platformTransfers[_i].cargoOut || 0;

      this.commonService.updateSOVPlatformPaxInput({
        _id: this.sovModel.platformTransfers[_i]._id,
        mmsi: this.sovModel.platformTransfers[_i].mmsi,
        paxIn: this.sovModel.platformTransfers[_i].paxIn || 0,
        paxOut: this.sovModel.platformTransfers[_i].paxOut || 0,
        cargoIn: this.sovModel.platformTransfers[_i].cargoIn || 0,
        cargoOut: this.sovModel.platformTransfers[_i].cargoOut || 0
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
      this.nonAvailabilityChanged = false;
    }
    this.saveHelicopterPaxCargo();
    this.saveMissedPaxCargo();
  }

  savev2vPaxInput() {
    for (let _i = 0; _i < this.sovModel.vessel2vessels[0].transfers.length; _i++) {
      this.sovModel.vessel2vessels[0].transfers[_i].paxIn = this.sovModel.vessel2vessels[0].transfers[_i].paxIn || 0;
      this.sovModel.vessel2vessels[0].transfers[_i].paxOut = this.sovModel.vessel2vessels[0].transfers[_i].paxOut || 0;
      this.sovModel.vessel2vessels[0].transfers[_i].cargoIn = this.sovModel.vessel2vessels[0].transfers[_i].cargoIn || 0;
      this.sovModel.vessel2vessels[0].transfers[_i].cargoOut = this.sovModel.vessel2vessels[0].transfers[_i].cargoOut || 0;
    }

    this.commonService.updateSOVv2vPaxInput({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      transfers: this.sovModel.vessel2vessels[0].transfers
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
    this.nonAvailabilityChanged = false;
  }


  savePlatformPaxInput(transfer) {
    this.commonService.updateSOVPlatformPaxInput({
      _id: transfer._id,
      mmsi: this.vesselObject.mmsi,
      paxIn: transfer.paxIn || 0,
      paxOut: transfer.paxOut || 0,
      cargoIn: transfer.cargoIn || 0,
      cargoOut: transfer.cargoOut || 0
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
    this.nonAvailabilityChanged = false;
  }

  saveTurbinePaxInput(transfer) {
      this.commonService.updateSOVTurbinePaxInput({
          _id: transfer._id,
          mmsi: this.vesselObject.mmsi,
          paxIn: transfer.paxIn || 0,
          paxOut: transfer.paxOut || 0,
          cargoIn: transfer.cargoIn || 0,
          cargoOut: transfer.cargoOut || 0
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
      this.nonAvailabilityChanged = false;
  }

    // universe functie van maken ipv 6x dezelfde functie
    saveFuelStats() {
      this.commonService.saveFuelStatsSovDpr({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          liquids: this.liquidsObject
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
      this.fuelChanged = false;
  }

  saveIncidentStats() {
      this.ToolboxArray = this.ToolboxArray.filter(function (result, _i) {
          return +result.amount !== 0;
      });
      this.HOCArray = this.HOCArray.filter(function (result, _i) {
          return +result.amount !== 0;
      });
      this.commonService.saveIncidentDpr({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          toolbox: this.ToolboxArray,
          hoc: this.HOCArray,
          ToolboxAmountNew:
          this.ToolboxTotalNew,
          HOCAmountNew: this.HOCTotalNew
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
      this.incidentsChanged = false;
  }


  saveWeatherDowntimeStats() {
      this.commonService.saveNonAvailabilityDpr({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          vesselNonAvailability: this.VesselNonAvailabilityArray
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

      this.commonService.saveWeatherDowntimeDpr({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          weatherDowntime: this.WeatherDowntimeArray
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

      this.commonService.saveStandByDpr({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          standBy: this.standByArray
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

      this.weatherDowntimeChanged = false;
  }

  saveCateringStats() {
      this.commonService.saveCateringStats({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          catering: this.cateringObject
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
      this.cateringChanged = false;
  }

  saveDPStats() {
      this.commonService.saveDPStats({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          dp: this.dpArray
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
      this.cateringChanged = false;
  }

  savePoBStats() {
      this.commonService.savePoBStats({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          peopleonBoard: this.peopleonBoard
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
      this.poBChanged = false;
  }

  saveRemarksStats() {
      this.commonService.saveRemarksStats({
          mmsi: this.vesselObject.mmsi,
          date: this.vesselObject.date,
          remarks: this.remarks
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
      this.remarksChanged = false;
  }


}
