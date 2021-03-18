import { Component, OnInit, OnChanges, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LongtermVesselObjectModel } from '@app/layout/reports/longterm/longterm.component';
import { forkJoin } from 'rxjs';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ctv-kpi-overview',
  templateUrl: './ctv-kpi-overview.component.html',
  styleUrls: ['./ctv-kpi-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvKpiOverviewComponent implements OnChanges {
  @Input() mmsi: number[];
  @Input() vesselNames: string[];
  @Input() matlabDateMin: number;
  @Input() minDate: number;
  @Input() maxDate: number;

  kpis: ctvKpi[][] = [[{
    month: 'Test Date',
    site: 'TEST',
    totalFuelUsed: 'N/a',
    fuelUsedPerWorkingDay: 'N/a',
    totalPaxTransfered: 1,
    numCargoOps: 1,
    totalDistanceSailed: 'N/a',
    cargoDownKg: 1,
    cargoUpKg: 1,
  }]];
  currentDate = this.dateService.MatlabDateToObject(this.dateService.getMatlabDateYesterday());

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnChanges() {
    this.loadData();
  }

  loadData() {
    const makeRequest = (reqFields: string[]) => {
      return {
        dateMin: this.minDate,
        dateMax: this.maxDate,
        mmsi: this.mmsi,
        reqFields: reqFields,
      };
    };
    forkJoin([
      this.newService.getTransfersForVesselByRangeForCTV(makeRequest(['fieldname', 'paxUp', 'paxDown', 'cargoUp', 'cargoDown'])),
      this.newService.getCtvInputsByRange(makeRequest(['inputStats','DPRstats', 'date'])),
      this.newService.getEngineStatsForRange(makeRequest(['fuelUsedTotalM3', 'date'])
      )]).subscribe(([transfers, dprs, engines]) => {
        this.kpis = [];

        this.mmsi.forEach((_mmsi, _i) => {
          const matchedTransfers  = transfers.find(val => val._id == _mmsi) || {};
          const matchedDprs       = dprs.find(val => val._id == _mmsi) || {};
          const matchedEngines    = engines.find(val => val._id == _mmsi) || {};

          const dpr         = this.dateService.groupDataByMonth(matchedDprs);
          const _transfers  = this.dateService.groupDataByMonth(matchedTransfers);
          const _engines    = this.dateService.groupDataByMonth(matchedEngines);
          const _kpis       = [];

          dpr.forEach((_dpr, index) => {
            const filter    = (datas) => datas.find(_transfer => _transfer.month.date.year === _dpr.month.date.year && _transfer.month.date.month === _dpr.month.date.month);
            const transfer  = filter(_transfers);
            const site      = transfer ? transfer.fieldname[0] : 'N/a';
            _kpis.push(this.computeKpiForMonth({ site: site }, _dpr, _engines[index], transfer));
          });
          this.kpis.push(_kpis.reverse());
        });
        this.ref.markForCheck();
      });
  }

  computeKpiForMonth(info: { site: string }, dprs, engines, turbine: any): ctvKpi {
    const kpi: ctvKpi = <ctvKpi>{};
    kpi.month           = dprs.month.dateString;
    kpi.site            = this.formatFieldName(info.site);
    let fuelUsed = 0, sailedMiles = 0;

    let numDaysInMonth: number;
    if (dprs.month.date.year === this.currentDate.year && dprs.month.date.month === this.currentDate.month) {
      numDaysInMonth = this.currentDate.day;
    } else {
      numDaysInMonth = dprs.month.numDays;
    }
    for (let i = 0; i < dprs.date.length; i++) {
      fuelUsed                 += this.getFuelValue(dprs, engines, i) ??  0;
      sailedMiles              += dprs?.DPRstats[i]?.sailedDistance ?? 0;
    }
    let paxTransfer = 0, cargoUpKg = 0, cargoDownKg = 0,  cargoOps = 0;
    if (turbine) {
      paxTransfer     += turbine.paxUp      .reduce((prev, curr) => prev + this.parseInput(curr), 0);
      paxTransfer     += turbine.paxDown    .reduce((prev, curr) => prev + this.parseInput(curr), 0);
      cargoUpKg       += turbine.cargoUp    .reduce((prev, curr) => prev + this.parseInput(curr), 0);
      cargoDownKg     += turbine.cargoDown  .reduce((prev, curr) => prev + this.parseInput(curr), 0);
      cargoOps        += turbine.cargoUp    .filter(value => value > 0).length;
      cargoOps        += turbine.cargoDown  .filter(value => value > 0).length;
    }
    kpi.totalFuelUsed           = this.calcService.roundNumber(fuelUsed || 0, 10, ' l');
    if (sailedMiles > 0){
      kpi.fuelUsedPerWorkingDay = this.calcService.roundNumber(fuelUsed / sailedMiles || 0, 10, ' l / NM');
    } else {
      kpi.fuelUsedPerWorkingDay = 'N/a';
    }
    kpi.totalDistanceSailed     = this.calcService.roundNumber(sailedMiles || 0, 10, ' NM');
    kpi.totalPaxTransfered      = paxTransfer;
    kpi.cargoUpKg               = cargoUpKg;
    kpi.cargoDownKg             = cargoDownKg;
    kpi.numCargoOps             = cargoOps;
    return kpi;
  }

  private formatFieldName(rawname: string) {
    if (rawname) {
      return rawname.replace('_turbine_coordinates', '').replace(/_/g, ' ');
    } else {
      return '-';
    }
  }
  private parseInput(n: number | string): number {
    if (n) {
      if (typeof (n) === 'number') {
        return isNaN(n) ? 0 : n;
      } else if (typeof (n) === 'string') {
        return parseInt(n, 10) || 0;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  private getFuelValue(dprs, engines, i : number) {
    if (dprs?.inputStats[i]?.fuelConsumption > 0) {
      return dprs?.inputStats[i]?.fuelConsumption;
    } else if (engines?.fuelUsedTotalM3[i] !== "n/a" && typeof engines?.fuelUsedTotalM3[i] === 'number' && engines?.fuelUsedTotalM3[i] > 0) {
      return this.calcService.switchUnits(engines?.fuelUsedTotalM3[i] || 0, 'm3', 'liter');
    }
  }
}
interface ctvKpi {
  month: string;
  site: string;
  totalFuelUsed: string;
  totalDistanceSailed: string;
  fuelUsedPerWorkingDay: string;
  totalPaxTransfered: number;
  numCargoOps: number;
  cargoUpKg: number;
  cargoDownKg: number;
}
