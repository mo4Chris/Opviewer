import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { TurbineTransfer } from '../../sov/models/Transfers/TurbineTransfer';
import { TokenModel } from '@app/models/tokenModel';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { map, catchError } from 'rxjs/operators';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { PermissionService } from '@app/shared/permissions/permission.service';

@Component({
  selector: 'app-ctv-turbine-transfer',
  templateUrl: './ctv-turbine-transfer.component.html',
  styleUrls: [
    './ctv-turbine-transfer.component.scss',
    '../ctvreport/ctvreport.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CtvTurbineTransferComponent {
  @Input() transfers: TurbineTransfer[];
  @Input() tokenInfo: TokenModel;
  @Output() onVideoRequest = new EventEmitter();
  videoRequestPermission: any;


  commentOptions = ['Transfer OK', 'Unassigned', 'Tied off',
    'Incident', 'Embarkation', 'Vessel2Vessel',
    'Too much wind for craning', 'Trial docking',
    'Transfer of PAX not possible', 'Other'];


  constructor(
    private newService: CommonService,
    private alert: AlertService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private permission: PermissionService,
  ) {
    this.videoRequestPermission = this.permission.ctvVideoRequest;
  }

  get waveAvailable(): boolean {
    return this.transfers && this.transfers.length > 0 && this.transfers.some(t => +t.Hs > 0);
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
    return this.dateService.matlabDatenumToTimeString(serial);
  }

  roundNumber(number, decimal = 10, addString = '') {
    return this.calcService.roundNumber(number, decimal = decimal, addString = addString);
  }

  getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    return this.dateService.getMatlabDatenumDifferenceString(serialEnd, serialBegin);
  }
}
