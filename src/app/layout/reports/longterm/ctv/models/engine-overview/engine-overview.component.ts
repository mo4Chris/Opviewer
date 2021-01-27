import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { Observable } from 'rxjs';
import { isNumber } from 'util';
import { LongtermVesselObjectModel } from '../../../longterm.component';

@Component({
  selector: 'app-engine-overview',
  templateUrl: './engine-overview.component.html',
  styleUrls: ['./engine-overview.component.scss']
})
export class EngineOverviewComponent implements OnChanges {
  @Input() vesselObject: LongtermVesselObjectModel;
  public vesselNames: string[] = [];

  public engines: any[][] = [];
  public get hasData() {
    return this.engines.length > 0;
  }

  constructor(
    private newService: CommonService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
  ) {
  }

  ngOnChanges() {
    this.vesselNames = [];

    this.loadEngineData().subscribe(engines => {
      this.vesselNames = engines.map(e => {
        const index = this.vesselObject.mmsi.findIndex(mmsi => mmsi == e._id);
        return this.vesselObject.vesselName[index];
      });
      this.engines = engines.map(eng_vessel => {
        const grouped = this.dateService.groupMatlabDatenumsByMonth(eng_vessel);
        return grouped.map((e: any) => {
          return {
            month: e.month.dateString,
            numDays: this.getPositiveCount(e.fuelUsedTotalM3),
            totalFuel: this.getNanSum(e.fuelUsedTotalM3),
            avgFuel: this.getPositiveMean(e.fuelUsedTotalM3),
            avgFuelDepart: this.calcService.switchVolumeUnits(this.getPositiveMean(e.fuelPerHourDepart), 'm3', 'liter'),
            avgFuelReturn: this.calcService.switchVolumeUnits(this.getPositiveMean(e.fuelPerHourReturn), 'm3', 'liter'),
            totalCO2: this.calcService.switchWeightUnits(this.getNanSum(e.co2TotalKg), 'kg', 'tons'),
          };
        });
      });
    });
  }

  loadEngineData(): Observable<any[]> {
    return this.newService.getEngineStatsForRange({
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      mmsi: this.vesselObject.mmsi,
      reqFields: ['fuelPerHourDepart', 'fuelPerHourReturn', 'fuelUsedTotalM3', 'co2TotalKg']
    });
  }

  roundNumber(num: number, dec?: number, str?: string) {
    return this.calcService.roundNumber(num, dec, str);
  }
  getPositiveCount(y: number[]) {
    return y.reduce((total, x) => x > 0 ? total + 1 : total, 0);
  }
  getPositiveMean(x: Array<number>) {
    const y = x.filter(_x => _x > 0);
    return this.calcService.getNanMean(y);
  }
  getNanSum(y: Array<number>) {
    return y.reduce((total, x) => x > 0 ? total + x : total, 0);
  }
}

