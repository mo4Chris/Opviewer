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
    amountDockings: 1,
    totalPaxTransfered: 1,
    numCargoOps: 1,
    totalDistanceSailed: 'N/a',
    cargoDownKg: 1,
    cargoUpKg: 1,
  }]];
  currentDate = this.dateService.matlabDatenumToYMD(this.dateService.getMatlabDateYesterday());

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
      this.newService.getTransfersForVesselByRangeForCTV(makeRequest(['fieldname', 'paxUp', 'paxDown', 'cargoUp', 'cargoDown', 'detector'])),
      this.newService.getCtvInputsByRange(makeRequest(['inputStats','DPRstats', 'date'])),
      this.newService.getEngineStatsForRange(makeRequest(['fuelUsedTotalM3', 'date'])
      )]).subscribe(([transfers, dprs, engines]) => {
        this.kpis = [];

        this.mmsi.forEach((_mmsi, _i) => {
          const matchedTransfers  = transfers.find(val => val._id == _mmsi) || {};
          const matchedDprs       = dprs.find(val => val._id == _mmsi) || {};
          const matchedEngines    = engines.find(val => val._id == _mmsi) || {};

          const dpr         = this.dateService.groupMatlabDatenumsByMonth(matchedDprs);
          const _transfers  = this.dateService.groupMatlabDatenumsByMonth(matchedTransfers);
          const _engines    = this.dateService.groupMatlabDatenumsByMonth(matchedEngines);
          const _kpis       = [];

          dpr.forEach((_dpr, index) => {
            // TODO move to dateservice
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
    // TODO move to dateservice
    if (dprs.month.date.year === this.currentDate.year && dprs.month.date.month === this.currentDate.month) {
      numDaysInMonth = this.currentDate.day;
    } else {
      numDaysInMonth = dprs.month.numDays;
    }
    for (let i = 0; i < dprs.date.length; i++) {
      fuelUsed                 += this.getFuelValue(dprs, engines, i) ??  0;
      sailedMiles              += dprs?.DPRstats[i]?.sailedDistance ?? 0;
    }

    let paxTransfer = 0, amountDockings = 0, cargoUpKg = 0, cargoDownKg = 0,  cargoOps = 0;
    if (turbine) {
      paxTransfer     += turbine.paxUp      ?.reduce((prev, curr) => prev + this.parseInput(curr), 0) ?? 0;
      paxTransfer     += turbine.paxDown    ?.reduce((prev, curr) => prev + this.parseInput(curr), 0) ?? 0;
      cargoUpKg       += turbine.cargoUp    ?.reduce((prev, curr) => prev + this.parseInput(curr), 0) ?? 0;
      cargoDownKg     += turbine.cargoDown  ?.reduce((prev, curr) => prev + this.parseInput(curr), 0) ?? 0;
      cargoOps        += turbine.cargoUp    ?.filter(value => value > 0)?.length ?? 0;
      cargoOps        += turbine.cargoDown  ?.filter(value => value > 0)?.length ?? 0;
      amountDockings  += turbine.detector   ?.filter(value => value == 'docking')?.length ?? 0;
    }

    // TODO use user settings instead of hardcoded units
    kpi.totalFuelUsed           = this.calcService.roundNumber(fuelUsed || 0, 10, ' l');
    if (sailedMiles > 0){
      kpi.fuelUsedPerWorkingDay = this.calcService.roundNumber(fuelUsed / sailedMiles || 0, 10, ' l / NM');
    } else {
      kpi.fuelUsedPerWorkingDay = 'N/a';
    }
    kpi.totalDistanceSailed     = this.calcService.roundNumber(sailedMiles || 0, 10, ' NM');
    kpi.totalPaxTransfered      = paxTransfer;
    kpi.amountDockings          = amountDockings;
    kpi.cargoUpKg               = cargoUpKg;
    kpi.cargoDownKg             = cargoDownKg;
    kpi.numCargoOps             = cargoOps;
    return kpi;
  }

  private formatFieldName(rawname: string): string {
    if (rawname) return rawname.replace('_turbine_coordinates', '').replace(/_/g, ' ') ?? '-';
    return '-';
  }
  private parseInput(n: number | string): number {
    if (!n) return 0;
    if (typeof (n) === 'number') {
      return isNaN(n) ? 0 : n;
    } else if (typeof (n) === 'string') {
      return parseInt(n, 10) || 0;
    }
    return 0;
  }

  private getFuelValue(dprs, engines, i : number): number {
    if (dprs?.inputStats[i]?.fuelConsumption > 0) return dprs?.inputStats[i]?.fuelConsumption;
    const fuelM3 = engines?.fuelUsedTotalM3?.[i];
    if (typeof fuelM3 == 'number' && fuelM3 > 0) return <number> this.calcService.switchUnits(fuelM3 || 0, 'm3', 'liter');
    return 0;
  }
}
interface ctvKpi {
  month: string;
  site: string;
  totalFuelUsed: string;
  totalDistanceSailed: string;
  fuelUsedPerWorkingDay: string;
  amountDockings: number;
  totalPaxTransfered: number;
  numCargoOps: number;
  cargoUpKg: number;
  cargoDownKg: number;
}
