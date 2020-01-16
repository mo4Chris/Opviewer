import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/observable';

@Component({
  selector: 'app-sov-dpr-input-vesselmaster',
  templateUrl: './sov-dpr-input-vesselmaster.component.html',
  styleUrls: ['./sov-dpr-input-vesselmaster.component.scss', '../../sovreport.component.scss']
})
export class SovDprInputVesselmasterComponent implements OnInit, OnChanges {
  @Input() vesselObject;

  @Input() standby: ReadonlyInput;
  @Input() vesselNonAvailability: ReadonlyInput;
  @Input() weatherDowntime: ReadonlyInput;
  @Input() hoc: ReadonlyInput;
  @Input() toolbox: ReadonlyInput;
  @Input() liquids;
  @Input() peopleOnVessel;
  @Input() catering;
  @Input() dp;
  @Input() remarks;

  constructor(
    private commonService: CommonService,
    private alert: AlertService
  ) { }

  fuelChanged = false;
  incidentsChanged = false;
  nonAvailabilityChanged = false;
  weatherDowntimeChanged = false;
  cateringChanged = false;
  remarksChanged = false;
  poBChanged = false;
  dpChanged = false;

  ngOnInit() {
  }

  ngOnChanges() {
    this.fuelChanged = false;
    this.incidentsChanged = false;
    this.nonAvailabilityChanged = false;
    this.weatherDowntimeChanged = false;
    this.cateringChanged = false;
    this.remarksChanged = false;

    // This one was in the onChanges, but the other update functions are not - can one be removed?
    this.updatePoB();
  }

  // Various save functions
  saveStats(saveFcn: (obj: object) => Observable<any>, saveObject: object) {
    // Generic saver for all the functions below
    const baseObj = {
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
    };
    saveFcn({...baseObj, ...saveObject}).pipe(
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
  }
  saveFuelStats() {
    this.saveStats(this.commonService.saveFuelStatsSovDpr, {liquids: this.liquids});
    this.fuelChanged = false;
  }
  saveIncidentStats() {
    this.toolbox.Array = this.toolbox.Array.filter(function (result, _i) {
        return +result.amount !== 0;
    });
    this.hoc.Array = this.hoc.Array.filter(function (result, _i) {
        return +result.amount !== 0;
    });
    this.saveStats(this.commonService.saveIncidentDpr, {
        toolbox: this.toolbox.Array,
        hoc: this.hoc.Array,
        ToolboxAmountNew: this.toolbox.TotalNew,
        HOCAmountNew: this.hoc.TotalNew
    });
    this.incidentsChanged = false;
  }
  saveWeatherDowntimeStats() {
    this.saveStats(this.commonService.saveWeatherDowntimeDpr, {
      weatherDowntime: this.weatherDowntime,
    });
    this.saveStats(this.commonService.saveNonAvailabilityDpr, {
      vesselNonAvailability: this.vesselNonAvailability,
    });
    this.saveStats(this.commonService.saveStandByDpr, {
      standBy: this.standby.Array
    });
    this.weatherDowntimeChanged = false;
  }
  saveCateringStats() {
    this.saveStats(this.commonService.saveCateringStats, {
      catering: this.catering
    });
    this.cateringChanged = false;
  }
  saveDPStats() {
    this.saveStats(this.commonService.saveDPStats, {
      dp: this.dp.Array
    });
    this.dpChanged = false;
  }
  savePoBStats() {
    this.saveStats(this.commonService.savePoBStats, {
      peopleonBoard: this.peopleOnVessel
    });
    this.poBChanged = false;
  }
  saveRemarksStats() {
    this.saveStats(this.commonService.saveRemarksStats, {
      remarks: this.remarks
    });
    this.remarksChanged = false;
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
    this.peopleOnVessel.Total = (0 + +this.peopleOnVessel.marineContractors + +this.peopleOnVessel.marine + +this.peopleOnVessel.project);
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
