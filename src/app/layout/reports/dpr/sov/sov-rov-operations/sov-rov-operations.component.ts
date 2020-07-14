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
  selector: 'app-sov-rov-operations',
  templateUrl: './sov-rov-operations.component.html',
  styleUrls: ['./sov-rov-operations.component.scss', '../sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SovRovOperationsComponent implements OnChanges {
  @Input() readonly = true;
  @Input() vesselObject: VesselObjectModel;
  @Input() sovRovOperations;
  @Input() rovOperations;

  allHours = [];
  all5Minutes = [];

  constructor(
    private datetimeService: DatetimeService,
    private calcService: CalculationService,
    private commonService: CommonService,
    private alert: AlertService,
    private ref: ChangeDetectorRef,
  ) { }


  ngOnChanges() {
  }

  addRovOperationsToArray() {
    this.rovOperations.transfers.push({ location: '', rovDeployed: {hours: '', minutes: ''}, rovRetrieved: {hours: '', minutes: ''}, observations: '' })
  }
  removeLastFromRovOperationsArray() {
    this.rovOperations.transfers.pop();
  }

  createSeperateTimes() {
    this.allHours = this.datetimeService.createHoursTimes();
    this.all5Minutes = this.datetimeService.createFiveMinutesTimes();
  }

  saveTransfers() {
    if(this.rovOperations.length > 0) {
      this.rovOperations.forEach(_rovOperations => {
        _rovOperations.location = _rovOperations.location || '';
        _rovOperations.rovDeployed = _rovOperations.rovDeployed || {hours: '00', minutes: '00'};
        _rovOperations.rovRetrieved = _rovOperations.rovRetrieved || {hours: '00', minutes: '00'};
        _rovOperations.observations = _rovOperations.observations || '';
      });
    }
    this.commonService.updateSovRovOperations({
      mmsi: this.vesselObject.mmsi,
      date: this.vesselObject.date,
      rovOperations: this.rovOperations,
    }).pipe(
      map(
        (res) => {
          this.alert.sendAlert({
            type: 'success',
            text: res.data,
          });
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
}

interface ReadonlyInput {
  Array: Array<any>;
  Total?: number;
  TotalOld?: number;
  TotalNew?: number;
}
