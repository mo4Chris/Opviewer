import { Component, OnInit, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { LongtermVesselObjectModel } from '@app/layout/reports/longterm/longterm.component';
import { forkJoin } from 'rxjs';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { isArray, isNumber, isString } from 'util';


// Encode daily operations per 15 minutes
const STATUS_WORKING = 1;
const STATUS_STANDBY = 2;
const STATUS_TECHNICAL_DOWNTIME = 3;
const STATUS_PLANNED_MAINTAINANCE = 12;
const STATUS_WEATHER_ALLVESSEL = 4;
const STATUS_WEATHER_OTHER = 5;
const STATUS_PORTCALL_PLANNED = 6;
const STATUS_PORTCALL_UNPLANNED = 7;

const EMPTY_DPR = {
  standBy: [],
  vesselNonAvailability: [],
  weatherDowntime: [],
  liquids: {
    fuel: {loaded: 0, consumed: 0}
  }

};

@Component({
  selector: 'app-siemens-kpi-overview',
  templateUrl: './siemens-kpi-overview.component.html',
  styleUrls: ['./siemens-kpi-overview.component.scss']
})
export class SiemensKpiOverviewComponent implements OnChanges {
  @Input() mmsi: number[];
  @Input() vesselNames: string[];
  @Input() matlabDateMin: number;

  kpis: SiemensKpi[][] = [[{
    month: 'Test Date',
    site: 'TEST',
    totalWorkingHours: 24,
    effectiveWorkingDays: 1,
    totalUtilHours: 10,
    totalWeatherDowntime: 1,
    totalTechnicalDowntime: 1,
    totalFuelUsed: 'N/a',
    fuelUsedPerWorkingDay: 'N/a',
    totalPaxTransfered: 1,
    paxTransferedGangway: 1,
    numCargoOps: 1,
    numPortCalls: 1,
    numMaintainanceOps: 1,
  }]];
  currentDate = this.dateService.MatlabDateToObject(this.dateService.getMatlabDateYesterday());
  private timeRegex = new RegExp('([0-9]{2}):([0-9]{2})');
  private defaultMinDate: number;

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService,
    private ref: ChangeDetectorRef,
  ) {
    this.defaultMinDate = this.dateService.getMatlabDateMonthsAgo(-6);
  }

  ngOnChanges(change) {
    this.loadData();
  }


  loadData() {
    const makeRequest = (reqFields: string[]) => {
      return {
        dateMin: this.matlabDateMin ? Math.max(this.defaultMinDate, this.matlabDateMin) : this.defaultMinDate, // 1 november 2019
        dateMax: this.dateService.getMatlabDateYesterday(),
        mmsi: this.mmsi,
        reqFields: reqFields,
      };
    };
    forkJoin([
      this.newService.getVessel2vesselsByRangeForSov(makeRequest(['date', 'transfers'])),
      this.newService.getPortcallsByRange(makeRequest(['date', 'startTime', 'stopTime', 'durationHr','plannedUnplannedStatus'])),
      this.newService.getTurbineTransfersForVesselByRangeForSOV(makeRequest(['fieldname', 'paxIn', 'paxOut', 'cargoIn', 'cargoOut', 'gangwayDeployedDuration'])),
      this.newService.getPlatformTransfersForVesselByRangeForSOV(makeRequest(['location', 'paxIn', 'paxOut', 'cargoIn', 'cargoOut', 'gangwayDeployedDuration'])),
      this.newService.getDprInputsByRange(makeRequest(['standBy', 'vesselNonAvailability', 'weatherDowntime', 'liquids', 'date'])
    )]).subscribe(([v2vs, portcalls, transfers, platforms, dprs]) => {
      this.kpis = [];
      this.mmsi.forEach((_mmsi, _i) => {
        const matchedTransfers = transfers.find(val => val._id === _mmsi);
        const matchedPlatforms = platforms.find(val => val._id === _mmsi);
        const dpr = <FilteredDprData[]> <any> this.dateService.groupDataByMonth(dprs.find(val => val._id === _mmsi) || {});
        const _transfers = this.dateService.groupDataByMonth(matchedTransfers || {});
        const _platforms = this.dateService.groupDataByMonth(matchedPlatforms || {});
        const _v2vs = this.dateService.groupDataByMonth(v2vs.find(val => val._id === _mmsi) || {});
        const _portcalls = this.dateService.groupDataByMonth(portcalls.find(val => val._id === _mmsi) || {});
        
        const _kpis = [];
        dpr.forEach(_dpr => {
          const filter = (datas) => datas.find(_transfer => _transfer.month.date.year === _dpr.month.date.year && _transfer.month.date.month === _dpr.month.date.month);
          const transfer = filter(_transfers);
          const platform = filter(_platforms);
          const v2v = filter(_v2vs);
          const portcall = filter(_portcalls) || {date: []};

          const site = transfer ? transfer.fieldname[0] : (platform ? 'platform' : '-');
          _kpis.push(this.computeKpiForMonth({site: site}, _dpr, portcall, transfer, platform, v2v));
        });
        this.kpis.push(_kpis.reverse());
      });
      this.ref.markForCheck();
    });
  }

  computeKpiForMonth(info: {site: string}, dprs: FilteredDprData, portcalls: any, turbine: any, platform: any, v2v: any): SiemensKpi {
    const kpi: SiemensKpi = <SiemensKpi> {};
    kpi.month = dprs.month.dateString;
    kpi.site = this.formatFieldName(info.site);
    let standByHours = 0, techDowntimeHours = 0, weatherDowntimeHours = 0, utilHours = 0;
    let portCallHours = 0, fuelUsed = 0, maintainanceOps = 0;
    let numDaysInMonth: number;
    if (dprs.month.date.year === this.currentDate.year && dprs.month.date.month === this.currentDate.month) {
      numDaysInMonth = this.currentDate.day;
    } else {
      numDaysInMonth = dprs.month.numDays;
    }

    for (let i = 0; i < dprs.date.length; i++) {
      const ops = new Array(4 * 24).fill(STATUS_WORKING);

      this.applyDowntime(ops, STATUS_STANDBY, dprs.standBy[i]);
      this.applyDowntime(ops, STATUS_TECHNICAL_DOWNTIME, dprs.vesselNonAvailability[i]);
      this.applyDowntime(ops, STATUS_WEATHER_ALLVESSEL, dprs.weatherDowntime[i], (x) => x.vesselsystem === 'Whole vessel');
      this.applyDowntime(ops, STATUS_WEATHER_OTHER, dprs.weatherDowntime[i], (x) => x.vesselsystem !== 'Whole vessel');

      const pcIndex = portcalls.date.findIndex(_date => _date === dprs.date[i]);
      if (pcIndex >= 0) {
        const s = portcalls.startTime[pcIndex];
        const e = portcalls.stopTime[pcIndex];
        const dtObj = {
          from: s === '_NaN_' ? '00:00' : this.dateService.MatlabDateToUnixEpoch(s).format('HH:mm'),
          to: e === '_NaN_' ? '24:00' : this.dateService.MatlabDateToUnixEpoch(e).format('HH:mm'),
          isPlanned: portcalls.plannedUnplannedStatus !== 'unplanned',
        };
        this.applyDowntime(ops, STATUS_PORTCALL_PLANNED, [dtObj], (x) => x.isPlanned);
        this.applyDowntime(ops, STATUS_PORTCALL_UNPLANNED, [dtObj], (x) => !x.isPlanned);
      }

      const applyOpsFilter = (codes: number[]) => ops.reduce((prev, curr) => {
        return codes.some(_code => curr === _code) ? prev + 1 / 4 : prev;
      }, 0);
      standByHours += applyOpsFilter([STATUS_STANDBY]);
      weatherDowntimeHours += applyOpsFilter([STATUS_WEATHER_ALLVESSEL]);
      techDowntimeHours += applyOpsFilter([STATUS_TECHNICAL_DOWNTIME]);
      portCallHours += applyOpsFilter([STATUS_PORTCALL_PLANNED, STATUS_PORTCALL_UNPLANNED]);
      utilHours += 24 - applyOpsFilter([STATUS_STANDBY, STATUS_TECHNICAL_DOWNTIME, STATUS_PORTCALL_UNPLANNED]);
      fuelUsed += +dprs.liquids[i].fuel.consumed || 0;
      maintainanceOps += dprs.vesselNonAvailability[i] ? dprs.vesselNonAvailability[i].length : 0;
    }

    let paxTransfer = 0, paxGangwayTransfer = 0, cargoOps = 0;
    if (turbine) {
      paxTransfer += turbine.paxIn.reduce((prev, curr) => curr ? prev + curr : prev, 0);
      paxTransfer += turbine.paxOut.reduce((prev, curr) => curr ? prev + curr : prev, 0);
      cargoOps += turbine.cargoIn.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
      cargoOps += turbine.cargoOut.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
      paxGangwayTransfer += turbine.gangwayDeployedDuration.reduce((prev: number, curr: any, _i: number) => {
        if (curr && curr > 0) {
          if (turbine.paxIn[_i]) {
            prev += turbine.paxIn[_i];
          }
          if (turbine.paxOut[_i]) {
            prev += turbine.paxOut[_i];
          }
        }
        return prev;
      }, 0);
    }
    if (platform) {
      paxTransfer += platform.paxIn.reduce((prev, curr) => curr ? prev + curr : prev, 0);
      paxTransfer += platform.paxOut.reduce((prev, curr) => curr ? prev + curr : prev, 0);
      cargoOps += platform
      .cargoIn.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
      cargoOps += platform.cargoOut.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
      paxGangwayTransfer += platform.paxIn.reduce((prev, curr) => curr && curr.gangwayDeployedDuration > 0 ? prev + curr : prev, 0);
      paxGangwayTransfer += platform.paxOut.reduce((prev, curr) => curr && curr.gangwayDeployedDuration > 0 ? prev + curr : prev, 0);
    }
    if (v2v) {
      v2v.transfers.forEach(_transfers => {
        if (isArray(_transfers)) {
          _transfers.forEach(_transfer => {
            paxTransfer += this.parseInput(_transfer.paxIn);
            paxTransfer += this.parseInput(_transfer.paxOut);
            cargoOps += this.parseInput(_transfer.cargoIn);
            cargoOps += this.parseInput(_transfer.cargoOut);
          })
        } else { // Only 1 transfer => not an array
          paxTransfer += this.parseInput(_transfers.paxIn);
          paxTransfer += this.parseInput(_transfers.paxOut);
          cargoOps += this.parseInput(_transfers.cargoIn);
          cargoOps += this.parseInput(_transfers.cargoOut);
        }
      });
    }
    
    kpi.totalTechnicalDowntime = Math.round(techDowntimeHours);
    kpi.totalWeatherDowntime = Math.round(weatherDowntimeHours);
    kpi.totalUtilHours = Math.round(utilHours);
    kpi.totalWorkingHours = Math.round(24 * numDaysInMonth - standByHours - weatherDowntimeHours - techDowntimeHours - portCallHours);
    kpi.effectiveWorkingDays = Math.round(kpi.totalWorkingHours / 24);
    kpi.numPortCalls = portcalls.date.length;
    kpi.totalFuelUsed = this.calcService.roundNumber(fuelUsed || 0, 10, ' m³');
    kpi.fuelUsedPerWorkingDay = this.calcService.roundNumber(fuelUsed / kpi.effectiveWorkingDays || 0, 100, ' m³/day');
    kpi.totalPaxTransfered = paxTransfer;
    kpi.paxTransferedGangway = paxGangwayTransfer;
    kpi.numCargoOps = cargoOps;
    kpi.numMaintainanceOps = maintainanceOps;
    return kpi;
  }

  private applyDowntime(ops: any[], code: number, times: {from: string, to: string}[], filter = (_: any) => true) {
    if (times) {
      times.forEach(time => {
        if (time && filter(time)) {
          const index = this.objectToIndex(time);
          if (index.stop < index.start) {
            console.warn('Got decreasing indices!');
            console.warn(index);
          }
          for (let _i = Math.round(index.start); _i <= index.stop; _i++) {
            ops[_i] = code;
          }
        }
      });
    }
  }
  private objectToIndex(obj: {from: string, to: string}) {
    const start = this.timeRegex.exec(obj.from);
    const stop = (obj.to === '00:00') ? ['', 24, 0] : this.timeRegex.exec(obj.to);
    return {
      start: 4 * +start[1] + +start[2] / 15,
      stop: 4 * +stop[1] + +stop[2] / 15,
    };
  }
  private formatFieldName(rawname: string) {
    if (rawname) {
      return rawname.replace('_turbine_coordinates', '').replace(/_/g, ' ');
    } else {
      return '-';
    }
  }

  private parseInput(n: number | string) : number {
    if (n) {
      if (isNumber(n)) {
        return isNaN(n) ? 0 : n;
      } else if (isString(n)) {
        return parseInt(n);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}



interface FilteredDprData {
  month: any;
  date: number[];
  standBy: any[];
  vesselNonAvailability: any[];
  weatherDowntime: any[];
  liquids: any[];
}

interface SiemensKpi {
  month: string;
  site: string;
  totalWorkingHours: number;
  effectiveWorkingDays: number;
  totalUtilHours: number;
  totalWeatherDowntime: number;
  totalTechnicalDowntime: number;
  totalFuelUsed: string;
  fuelUsedPerWorkingDay: string;
  totalPaxTransfered: number;
  paxTransferedGangway: number;
  numCargoOps: number;
  numPortCalls: number;
  numMaintainanceOps: number;
}
