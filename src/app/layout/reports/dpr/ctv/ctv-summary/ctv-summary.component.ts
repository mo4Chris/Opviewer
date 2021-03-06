import { Component, Input, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { CTVGeneralStatsModel } from '../../models/generalstats.model';
import { TokenModel } from '@app/models/tokenModel';
import { AlertService } from '@app/supportModules/alert.service';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { SettingsService } from '@app/supportModules/settings.service';

@Component({
  selector: 'app-ctv-summary',
  templateUrl: './ctv-summary.component.html',
  styleUrls: [
    './ctv-summary.component.scss',
    '../ctvreport/ctvreport.component.scss',
  ],
})
export class CtvSummaryComponent implements OnChanges {
  @Input() general: CTVGeneralStatsModel;
  @Input() generalInputStats: CtvGeneralInputStatsModel;
  @Input() engine: CtvEngineModel;
  @Input() visitedPark: string;
  @Input() tokenInfo: TokenModel; // ToDo remove in favour of permission service

  toolboxOptions = ['Bunkering OPS', '2 man lifting', 'Battery maintenance', 'Bird survey', 'Working on engines', 'using dock craine', 'lifting between vessel and TP',
    'Power washing', 'Daily slinging and craning', 'Fueling substation', 'gearbox oil change', 'servicing small generator', 'Replacing bow fender straps',
    'Main engine oil and filter changed', 'Generator service', 'Craining ops', 'Bunkering at fuel barge', 'New crew'];
  drillOptions = ['Man over board', 'Abandon ship', 'Fire', 'Oil Spill', 'Other drills'];

  public fuelConsumedValue = '0 liter';
  public tripEfficiency = 'N/a';

  constructor(
    private alert: AlertService,
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService,
    public permission: PermissionService,
    public settings: SettingsService
  ) {
  }

  ngOnChanges() {
    if (this.engine && this.general && this.general.sailedDistance) {
      this.tripEfficiency = this.calcService.getFuelEcon(this.engine.fuelUsedTotalM3, this.general.sailedDistance, this.settings.unit_distance);
      }
    this.setValueForFuelConsumed();
  }

  saveGeneralStats() {
    // ToDo We need some way to trigger this function
    this.newService.saveCTVGeneralStats(this.generalInputStats).pipe(
      map(res => {
        this.alert.sendAlert({text: res.data, type: 'success'});
      }),
      catchError(error => {
        this.alert.sendAlert({text: error, type: 'danger'});
        throw error;
      })).subscribe();
  }

  setValueForFuelConsumed() {
    if (this.generalInputStats?.fuelConsumption && this.generalInputStats.fuelConsumption > 0) {
      this.fuelConsumedValue = this.roundNumber(this.generalInputStats.fuelConsumption, 10, ' liter');
    } else if (this.engine?.fuelUsedTotalM3) {
      const val_rnd = this.roundNumber(this.engine.fuelUsedTotalM3, 10)
      this.fuelConsumedValue = this.calcService.switchUnitAndMakeString(val_rnd, 'm3', 'liter');
    } else {
      this.fuelConsumedValue = this.calcService.switchUnitAndMakeString(0, 'm3', 'liter');
    }
  }

  matlabDatenumToTimeString(serial) {
    return this.dateService.matlabDatenumToTimeString(serial);
  }

  roundNumber(number: number, decimal = 10, addString = '') {
    return this.calcService.roundNumber(number, decimal = decimal, addString = addString);
  }

  switchUnitAndMakeString(value: string | number, oldUnit: string, newUnit: string) {
    return this.calcService.switchUnitAndMakeString(value, oldUnit, newUnit);
  }
}

interface CtvEngineModel {
  fuelUsedTotalM3: number;
  fuelUsedDepartM3: number;
  fuelUsedReturnM3: number;
  fuelUsedTransferM3: number;
  fuelPerHour: number;
  fuelOther: number;
  co2TotalKg: number;

}

interface CtvGeneralInputStatsModel {
  date: number;
  mmsi: number;
  fuelConsumption: number;
  landedOil: number;
  landedGarbage: number;
  toolboxConducted: any[];
  drillsConducted: any[];
  observations: any;
  incidents: any;
  passengers: any;
  customInput: string;
}
