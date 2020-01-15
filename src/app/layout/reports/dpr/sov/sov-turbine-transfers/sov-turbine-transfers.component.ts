import { Component, OnInit, Input } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { TurbineTransfer } from '../models/Transfers/TurbineTransfer';
import { CycleTime } from '../models/CycleTime';

@Component({
  selector: 'app-sov-turbine-transfers',
  templateUrl: './sov-turbine-transfers.component.html',
  styleUrls: ['./sov-turbine-transfers.component.scss', '../sovreport.component.scss' ]
})
export class SovTurbineTransfersComponent implements OnInit {
  @Input() turbineTransfers: TurbineTransfer[] = [];
  @Input() cycleTimes: CycleTime[] = [];

  gangwayActive = true;

  constructor(
    private calcService: CalculationService,
    private datetimeService: DatetimeService,
  ) {
    console.log(this);
  }

  ngOnInit() {
  }

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
