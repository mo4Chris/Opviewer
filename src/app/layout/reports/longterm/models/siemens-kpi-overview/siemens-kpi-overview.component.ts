import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { LongtermVesselObjectModel } from '@app/layout/reports/longterm/longterm.component';
import { forkJoin } from 'rxjs';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { platform } from 'os';


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
  kpis: SiemensKpi[] = [{
    month: 'Test Date',
    site: 'TEST',
    effectiveWorkingDays: 1,
    totalUtilHours: 10,
    totalWeatherDowntime: 1,
    totalTechnicalDowntime: 1,
    totalFuelUsed: 1,
    fuelUsedPerWorkingDay: 1,
    totalPaxTransfered: 1,
    paxTransferedGangway: 1,
    numCargoOps: 1,
    numPortCalls: 1,
    numMaintainanceOps: 1,
  }];


  constructor(
    private newService: CommonService,
    private dateService: DatetimeService
  ) { }

  ngOnChanges(change) {
    console.log(change);
    this.loadData();
  }

  loadData() {
    const makeRequest = (reqFields: string[]) => {
      return {
        dateMin: 0,
        dateMax: 1000000000,
        mmsi: this.mmsi,
        reqFields: reqFields,
      };
    };
    forkJoin([
      this.newService.getVessel2vesselsByRangeForSov(makeRequest(['paxIn', 'paxOut', 'cargoIn', 'cargoOut'])),
      this.newService.getPortcallsByRange(makeRequest(['date'])),
      this.newService.getTurbineTransfersForVesselByRangeForSOV(makeRequest(['fieldname'])),
      this.newService.getPlatformTransfersForVesselByRangeForSOV(makeRequest(['location'])),
      this.newService.getDprInputsByRange(makeRequest(['standBy', 'vesselNonAvailability', 'weatherDowntime',
        'liquids', 'date'])
    )]).subscribe(([v2vs, portcalls, transfers, platforms, dprs]) => {
      console.log(v2vs);
      console.log(portcalls);
      console.log(transfers);
      console.log(platforms);
      console.log(dprs);
      
      const dpr = <FilteredDprData[]> <any> this.dateService.groupDataByMonth(dprs[0]);
      const _transfers = this.dateService.groupDataByMonth(transfers[0]);
      const _platforms = this.dateService.groupDataByMonth(platforms[0]);
      const _v2vs = this.dateService.groupDataByMonth(v2vs[0]);
      const _portcalls = this.dateService.groupDataByMonth(portcalls[0]);
      console.log(_transfers);

      console.log('**************');
      dpr.forEach(_dpr => {
        const filter = (datas) => datas.find(_transfer => _transfer.month.date.year === _dpr.month.date.year && _transfer.month.date.month === _dpr.month.date.month);
        const transfer = filter(_transfers);
        const platform = filter(_platforms);
        const v2v = filter(_v2vs);
        const portcall = filter(_portcalls);
        console.log(transfer)
        const site = transfer ? transfer.fieldname[0] : (platform ? 'platform' : '-');
        this.kpis.push(this.computeKpiForMonth({site: site}, _dpr, v2v, portcall));
      });
      
    });
  }
  
  computeKpiForMonth(info: {site: string}, dprs: FilteredDprData, v2vs: any[], portcalls: any[]): SiemensKpi {
    let kpi: SiemensKpi = {};
    
    // console.log('--------');
    // console.log(dprs);
    kpi.month = dprs.month.dateString;
    kpi.site = info.site;

    let standByHours = 0, techDowntimeHours = 0, weatherDowntimeHours = 0, utilHours = 0;

    for (let i = 0; i < dprs.date.length; i++) {
      const date = dprs.date[i];
      const ops = new Array(4 * 24).fill(STATUS_WORKING);
      // const dpr = dprs.find(_dpr => dpr.date === date) || EMPTY_DPR;
      // const portcall = portcalls.find(_portcall => _portcall.date === date);

      this.applyDowntime(ops, STATUS_STANDBY, dprs.standBy[i]);
      this.applyDowntime(ops, STATUS_TECHNICAL_DOWNTIME, dprs.vesselNonAvailability[i]);
      this.applyDowntime(ops, STATUS_WEATHER_ALLVESSEL, dprs.weatherDowntime[i], (x) => x.vesselsystem === 'Whole vessel');
      this.applyDowntime(ops, STATUS_WEATHER_OTHER, dprs.weatherDowntime[i], (x) => x.vesselsystem !== 'Whole vessel');
      this.applyDowntime(ops, STATUS_WEATHER_OTHER, dprs.weatherDowntime[i]);

      standByHours += ops.reduce((prev, curr) => curr === STATUS_STANDBY ? prev + 1/4 : prev, 0);
      techDowntimeHours += ops.reduce((prev, curr) => curr === STATUS_TECHNICAL_DOWNTIME ? prev + 1/4 : prev, 0);
      weatherDowntimeHours += ops.reduce((prev, curr) => curr === STATUS_WEATHER_ALLVESSEL ? prev + 1/4 : prev, 0);
      
      utilHours += 24 - ops.reduce((prev, curr) => (curr === STATUS_STANDBY  || curr === STATUS_TECHNICAL_DOWNTIME || curr === STATUS_PORTCALL_UNPLANNED) ? prev + 1/4 : prev, 0);
    }

    kpi.totalTechnicalDowntime = techDowntimeHours;
    kpi.totalWeatherDowntime = weatherDowntimeHours;
    kpi.totalUtilHours = utilHours;


    // for i = 1 : numDaysInMonth
    // % For each day in month
    // date        = dates(i);
    // dpr         = filter(dprs, 'date', date);
    // assert(numel(dpr)>0, 'No DPR found for %s', datestr(date));
    // portcall    = filter(portCalls, 'date', date);


    // ops     = ones(4 * 24, STATUS_WORKING);
    // ops     = applyDownTime(ops, STATUS_STANDBY, dpr.standBy);
    // ops     = applyDownTime(ops, STATUS_TECHNICAL_DOWNTIME, dpr.vesselNonAvailability);
    // ops     = applyDownTime(ops, STATUS_WEATHER_ALLVESSEL, dpr.weatherDowntime, @(x) strcmp(x.vesselsystem, 'Whole vessel'));
    // ops     = applyDownTime(ops, STATUS_WEATHER_OTHER, dpr.weatherDowntime, @(x) ~strcmp(x.vesselsystem, 'Whole vessel'));
    // if numel(portcall)
    //     ops     = applyPortCalls(ops, STATUS_PORTCALL_PLANNED, portcall);
    // end

    // standbyHours(i)     = sum(ops == STATUS_STANDBY) / 4;
    // weatherHours(i)     = sum(ops == STATUS_WEATHER_ALLVESSEL) / 4;
    // techDownHours(i)    = sum(ops == STATUS_TECHNICAL_DOWNTIME) / 4;
    // portCallHours(i)    = sum(ops == STATUS_PORTCALL_PLANNED | ops == STATUS_PORTCALL_UNPLANNED) / 4;
    // % WARNING -> CURRENTLY CAN NEVER HAVE UNPLANNED PORTCALL!
    // utilHours(i)        = 24 - sum(ops == STATUS_STANDBY | ops == STATUS_PORTCALL_UNPLANNED | ops == STATUS_TECHNICAL_DOWNTIME) / 4;

    // fuelUsed(i)         = str2double(dpr.liquids.fuel.consumed);
    // if ischar(dpr.liquids.fuel.loaded)
    //     fuelBunkered(i)     = str2double(dpr.liquids.fuel.loaded);
    // end
// end

    return kpi;
  }

  splitByDate(array, startDate: number, stopDate: number) {

  }

  private applyDowntime(ops: any[], code: number, times: {startTime: string, stopTime: string}[], filter = (_: any) => true) {
    if (times) {
      times.forEach(time => {
        if (filter(time)) {
          const index = this.objectToIndex(time);
          for (let _i = index.start; _i <= index.stop; _i++) {
            ops[_i] = code;
          }
        }
      });
    }
  }

  private objectToIndex(obj: {startTime: string, stopTime: string}) {
    return {
      start: +obj.startTime,
      stop: +obj.stopTime
    };
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
  effectiveWorkingDays: number;
  totalUtilHours: number;
  totalWeatherDowntime: number;
  totalTechnicalDowntime: number;
  totalFuelUsed: number;
  fuelUsedPerWorkingDay: number;
  totalPaxTransfered: number;
  paxTransferedGangway: number;
  numCargoOps: number;
  numPortCalls: number;
  numMaintainanceOps: number;
}
