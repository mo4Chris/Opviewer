import { Component, OnInit, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
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
  @Input() rovOperations: SovRovOpsModel[] = [];

  constructor(
    private commonService: CommonService,
    private alert: AlertService,
    private ref: ChangeDetectorRef,
  ) { }


  ngOnChanges() {
  }

  addRovOperationsToArray() {
    this.rovOperations.push({
      location: '',
      rovDeployed: {hours: '', minutes: ''},
      rovRetrieved: {hours: '', minutes: ''},
      observations: ''
    });
  }

  removeLastFromRovOperationsArray() {
    this.rovOperations.pop();
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

interface TimeObject {
  hours: string;
  minutes: string;
}

interface SovRovOpsModel {
  location: string;
  rovDeployed: TimeObject | '';
  rovRetrieved: TimeObject | '';
  observations: string;
}