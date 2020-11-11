import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { Observable } from 'rxjs';
import { isNumber } from 'util';

@Component({
  selector: 'app-engine-overview',
  templateUrl: './engine-overview.component.html',
  styleUrls: ['./engine-overview.component.scss']
})
export class EngineOverviewComponent implements OnChanges {
  @Input() mmsi: number[];
  @Input() dateMin = 738000;
  @Input() dateMax = 738300;
  vesselNames: string[] = [];

  public engines: any[][] = [];
  public get hasData() {
    return this.engines.length > 0;
  }

  constructor(
    private newService: CommonService,
    private calcService: CalculationService,
    private dateService: DatetimeService,
  ) { }

  ngOnChanges() {
    this.vesselNames = [];
    this.loadEngineData().subscribe(engines => {
      this.vesselNames = engines.map(e => e.label[0]).filter(x => x !== undefined);
      this.engines = engines.map(eng_vessel => {
        const grouped = this.dateService.groupDataByMonth(eng_vessel);
        return grouped.map(e => {
          return {
            month: e.month.dateString,
            numDays: e.fuelUsedTotalM3.reduce((total, fuel) => fuel > 0 ? total + 1 : total, 0),
            totalFuel: e.fuelUsedTotalM3.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0),
            avgFuelDepart: 1000 * e.fuelPerHourDepart.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0) / e.fuelPerHourDepart.length,
            avgFuelReturn: 1000 * e.fuelPerHourReturn.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0) / e.fuelPerHourReturn.length,
            totalCO2: 1 / 1000 * e.co2TotalKg.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0),
          };
        });
      });
      console.log(this.engines[0]);
    });
  }

  loadEngineData(): Observable<any[]> {
    return this.newService.getEngineStatsForRange({
      dateMin: this.dateMin,
      dateMax: this.dateMax,
      mmsi: this.mmsi,
      reqFields: ['fuelPerHourDepart', 'fuelPerHourReturn', 'fuelUsedTotalM3', 'co2TotalKg']
    });
  }

  roundNumber(num: number, dec?: number, str?: string) {
    return this.calcService.roundNumber(num, dec, str);
  }
}
