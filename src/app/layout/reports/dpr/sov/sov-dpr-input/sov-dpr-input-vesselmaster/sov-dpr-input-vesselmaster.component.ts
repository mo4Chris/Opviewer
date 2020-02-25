import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sov-dpr-input-vesselmaster',
  templateUrl: './sov-dpr-input-vesselmaster.component.html',
  styleUrls: ['./sov-dpr-input-vesselmaster.component.scss', '../../sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SovDprInputVesselmasterComponent implements OnInit, OnChanges {
  @Input() vesselObject;
  @Input() tokenInfo;

  @Input() standby: ReadonlyInput;
  @Input() vesselNonAvailability: ReadonlyInput;
  @Input() weatherDowntime: ReadonlyInput;
  @Input() accessDayType: {status: string};

  @Input() hoc: ReadonlyInput;
  @Input() toolbox: ReadonlyInput;
  @Input() liquids;
  @Input() catering;
  @Input() dp;
  @Input() remarks;
  @Input() dprApprovalCount;

  @Output() dprApproval: EventEmitter<any> = new EventEmitter<any>();
  @Output() loaded = new EventEmitter<boolean>();

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
    private datetimeService: DatetimeService,
    public modalService: NgbModal
  ) { }

  fuelChanged = false;
  incidentsChanged = false;
  weatherDowntimeChanged = false;
  cateringChanged = false;
  remarksChanged = false;
  dpChanged = false;

  dprSignedBySkipper = 1;
  times = [];
  allHours = [];
  all5Minutes = [];
  hseDprInput = {
    marineCount: {value: 0, comment: ''},
    clientCrewCount: {value: 0, comment: ''},
    hocAmount: {value: 0, comment: ''},
    toolboxAmount: {value: 0, comment: ''},
    technicalBreakdownAmount: {value: 0, comment: ''},
    fuelConsumption: {value: 0, comment: ''},
    lubOilConsumption: {value: 0, comment: ''},
    waterConsumption: {value: 0, comment: ''}
  };

  updateHseDprInput() {
    this.hseDprInput.marineCount.value = (this.catering.marine + this.catering.marineContractors);
    this.hseDprInput.clientCrewCount.value = this.catering.project;
    this.hseDprInput.hocAmount.value = this.hoc.Total;
    this.hseDprInput.toolboxAmount.value = this.toolbox.Total;
    this.hseDprInput.technicalBreakdownAmount.value = this.vesselNonAvailability.Array.length;
    this.hseDprInput.fuelConsumption.value = (+this.liquids.fuel.consumed + +this.liquids.fuel.discharged);
    this.hseDprInput.lubOilConsumption.value = (+this.liquids.luboil.consumed + +this.liquids.luboil.discharged);
    this.hseDprInput.waterConsumption.value = (+this.liquids.domwater.consumed + +this.liquids.domwater.discharged);
    this.commonService.updateDprFieldsSOVHseDpr({mmsi: this.vesselObject.mmsi, date: this.vesselObject.date, dprFields: this.hseDprInput}).subscribe();
  }

  ngOnInit() {
    this.createTimes();
    this.createSeperateTimes();
  }

  ngOnChanges() {
    this.fuelChanged = false;
    this.incidentsChanged = false;
    this.weatherDowntimeChanged = false;
    this.cateringChanged = false;
    this.remarksChanged = false;

    // This one was in the onChanges, but the other update functions are not - can one be removed?
    this.updatePoB();
    this.updateHseDprInput();
    this.updateHOCTotal();
    this.updateToolboxTotal();
    this.loaded.emit(true);
  }

  updateHOCTotal() {
    this.hoc.Total = 0;
    this.hoc.TotalNew = this.hoc.TotalOld;
    if (this.hoc.Array.length !== 0) {
        this.hoc.Array.forEach(element => {
            this.hoc.Total = this.hoc.Total + +element.amount;
            this.hoc.TotalNew = this.hoc.TotalNew + +element.amount;
        });
    }
}

  updateToolboxTotal() {
      this.toolbox.Total = 0;
      this.toolbox.TotalNew = this.toolbox.TotalOld;
      if (this.toolbox.Array.length !== 0) {
          this.toolbox.Array.forEach(element => {
              this.toolbox.Total = this.toolbox.Total + +element.amount;
              this.toolbox.TotalNew = this.toolbox.TotalNew + +element.amount;
          });
      }
  }


  createTimes() {
    this.times = this.datetimeService.createTimesQuarterHour();
  }

  createSeperateTimes() {
    this.allHours = this.datetimeService.createHoursTimes();
    this.all5Minutes = this.datetimeService.createFiveMinutesTimes();
  }

  // Various save functions
  saveStats(saveFcnName: string, saveObject: object): void {
    // Generic saver for all the functions below
    const baseObj = {
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
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
    this.updateHseDprInput();
  }
  saveFuelStats() {
    this.saveStats('saveFuelStatsSovDpr', {liquids: this.liquids});
    this.fuelChanged = false;
  }
  saveIncidentStats() {
    this.toolbox.Array = this.toolbox.Array.filter(function (result, _i) {
        return +result.amount !== 0;
    });
    this.hoc.Array = this.hoc.Array.filter(function (result, _i) {
        return +result.amount !== 0;
    });
    this.saveStats('saveIncidentDpr', {
        toolbox: this.toolbox.Array,
        hoc: this.hoc.Array,
        ToolboxAmountNew: this.toolbox.TotalNew,
        HOCAmountNew: this.hoc.TotalNew
    });
    this.incidentsChanged = false;
  }
  saveWeatherDowntimeStats() {
    this.saveStats('saveWeatherDowntimeDpr', {
      weatherDowntime: this.weatherDowntime.Array,
    });
    this.saveStats('saveNonAvailabilityDpr', {
      vesselNonAvailability: this.vesselNonAvailability.Array,
    });
    this.saveStats('saveStandByDpr', {
      standBy: this.standby.Array
    });
    this.saveStats('saveAccessDayType', {accessDayType: this.accessDayType});
    this.weatherDowntimeChanged = false;
  }
  saveCateringStats() {
    this.saveStats('saveCateringStats', {
      catering: this.catering
    });
    this.cateringChanged = false;
  }
  saveDPStats() {
    this.saveStats('saveDPStats', {
      dp: this.dp.Array
    });
    this.dpChanged = false;
  }
  saveRemarksStats() {
    this.saveStats('saveRemarksStats', {
      remarks: this.remarks
    });
    this.remarksChanged = false;
  }

  confirmSignoff(modalRef: NgbModalRef) {
    this.modalService.open(modalRef, {
      ariaLabelledBy: 'modal-basic-title',
    });
  }

  signOffDpr() {
    this.saveStats('saveDprSigningSkipper', {
      date: this.vesselObject.date,
      mmsi: this.vesselObject.mmsi
    });
    this.dprApproval.emit(this.dprSignedBySkipper);
  }

  // Updates stats on save - these are triggered from the html
  updateFuel() {
    this.liquids.fuel.newValue = +(+this.liquids.fuel.oldValue + +this.liquids.fuel.loaded - +this.liquids.fuel.consumed - +this.liquids.fuel.discharged).toFixed(1);
  }
  updateLuboil() {
    this.liquids.luboil.newValue = +(+this.liquids.luboil.oldValue + +this.liquids.luboil.loaded - +this.liquids.luboil.consumed - +this.liquids.luboil.discharged).toFixed(1);
  }
  updateDomwater() {
    this.liquids.domwater.newValue = +(+this.liquids.domwater.oldValue + +this.liquids.domwater.loaded - +this.liquids.domwater.consumed - +this.liquids.domwater.discharged).toFixed(1);
  }
  updatePotwater() {
    this.liquids.potwater.newValue = +(+this.liquids.potwater.oldValue + +this.liquids.potwater.loaded - +this.liquids.potwater.consumed - this.liquids.potwater.discharged).toFixed(1);
  }
  updatePoB() {
    this.catering.totalPob = (0 + +this.catering.marineContractors + +this.catering.marine + +this.catering.project);
  }

  // Push / pop functions for the various arrays
  addHoCToArray() {
    this.hoc.Array.push({ value: '', amount: 1 });
  }
  addToolboxToArray() {
    this.toolbox.Array.push({ value: '', amount: 1 });
  }
  addVesselNonAvailabilityToArray() {
    this.vesselNonAvailability.Array.push({ reason: 'DC small breakdown', from: '00:00', to: '00:00' });
  }
  addStandByToArray() {
    this.standby.Array.push({ reason: 'No work planned', from: '00:00', to: '00:00' });
  }
  addWeatherDowntimeToArray() {
    this.weatherDowntime.Array.push({ decidedBy: 'Siemens Gamesa', from: '00:00', to: '00:00', vesselsystem: 'Gangway' });
  }
  addDPToArray() {
    this.dp.Array.push({ from: { hour: '00', minutes: '00' }, to: { hour: '00', minutes: '00' } });
  }
  removeLastFromDPArray() {
    this.dp.Array.pop();
  }
  removeLastFromToolboxArray() {
    this.toolbox.Array.pop();
  }
  removeLastFromHOCArray() {
    this.hoc.Array.pop();
  }
  removeLastFromVesselNonAvailabilityArray() {
    this.vesselNonAvailability.Array.pop();
  }
  removeLastFromStandByArray() {
    this.standby.Array.pop();
  }
  removeLastFromWeatherDowntimeArray() {
    this.weatherDowntime.Array.pop();
  }

}

interface ReadonlyInput {
  Array: Array<any>;
  Total?: number;
  TotalOld?: number;
  TotalNew?: number;
}
