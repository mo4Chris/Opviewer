import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { TurbineTransfer } from '../../sov/models/Transfers/TurbineTransfer';
import { TokenModel } from '@app/models/tokenModel';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';

@Component({
  selector: 'app-ctv-turbine-transfer',
  templateUrl: './ctv-turbine-transfer.component.html',
  styleUrls: [
    './ctv-turbine-transfer.component.scss',
    '../ctvreport/ctvreport.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CtvTurbineTransferComponent implements OnInit, OnChanges {
  @Input() transfers: TurbineTransfer[]
  @Input() tokenInfo: TokenModel
  @Output() onVideoRequest = new EventEmitter();

  
  commentOptions = ['Transfer OK', 'Unassigned', 'Tied off',
    'Incident', 'Embarkation', 'Vessel2Vessel',
    'Too much wind for craning', 'Trial docking',
    'Transfer of PAX not possible', 'Other'];

  constructor(
    private newService: CommonService,
    private alert: AlertService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {

  }

  saveComment(transferData) {
    if (transferData.comment !== 'Other') {
      transferData.commentChanged.otherComment = '';
    }
    transferData.commentDate = Date.now();
    transferData.userID = this.tokenInfo.userID;
    this.newService
      .saveTransfer(transferData)
      .pipe(
        map(res => {
          this.alert.sendAlert({text: res.data, type: 'success'});
          transferData.formChanged = false;
        }),
        catchError(error => {
            this.alert.sendAlert({text: error, type: 'danger'});
          throw error;
        })
      ).subscribe();
  }

  setRequest(transfer: any) {
    this.onVideoRequest.emit(transfer);
  }
  
  getMatlabDateToJSTime(serial) {
    return this.dateService.MatlabDateToJSTime(serial);
  }

  roundNumber(number, decimal = 10, addString = '') {
    return this.calcService.roundNumber(number, decimal = decimal, addString = addString);
  }

  getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    return this.dateService.MatlabDateToJSTimeDifference(serialEnd, serialBegin);
  }
}
