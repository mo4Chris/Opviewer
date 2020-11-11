import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Observable } from 'rxjs';
import { isNumber } from 'util';

@Component({
  selector: 'app-engine-overview',
  templateUrl: './engine-overview.component.html',
  styleUrls: ['./engine-overview.component.scss']
})
export class EngineOverviewComponent implements OnChanges {
  @Input() mmsi: number[];
  dateMin = 738000;
  dateMax = 738100;
  vesselNames: string[] = [];

  public engines: any[];

  constructor(
    private newService: CommonService,
    private calcService: CalculationService
  ) { }

  ngOnChanges() {
    this.loadEngineData().subscribe(engines => {
      console.log(engines);
      this.engines = engines.map(e => {

        return {
          name: e._id,
          numDays: e.fuelUsedTotalM3.reduce((total, fuel) => fuel > 0 ? total + 1 : total, 0),
          totalFuel: e.fuelUsedTotalM3.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0),
          avgFuelDepart: 1000 * e.fuelPerHourDepart.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0) / e.fuelPerHourDepart.length,
          avgFuelReturn: 1000 * e.fuelPerHourReturn.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0) / e.fuelPerHourReturn.length,
          totalCO2: 1 / 1000 * e.co2TotalKg.reduce((total, fuel) => isNumber(fuel) ? total + fuel : total, 0),
        };
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
