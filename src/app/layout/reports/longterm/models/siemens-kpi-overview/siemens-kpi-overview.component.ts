import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { LongtermVesselObjectModel } from '@app/layout/reports/longterm/longterm.component';
import { forkJoin } from 'rxjs';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';


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
    month: 'Januari 2020',
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
      
      const dpr = this.dateService.groupDataByMonth(dprs[0]);
    });
  }
  
  computeKPI(info: {month: string, days: number[], site: string}, dprs: any[], v2vs: any[], portcalls: any[]): SiemensKpi {
    let kpi: SiemensKpi;
    kpi.month = info.month;
    kpi.site = info.site;

    for (let i = 0; i < info.days.length; i++) {
      const date = info.days[i];
      const ops = new Array(4 * 24, STATUS_WORKING);
      console.log(ops);
      const dpr = dprs.find(_dpr => dpr.date === date) || EMPTY_DPR;
      const portcall = portcalls.find(_portcall => _portcall.date === date);

      this.applyDowntime(ops, STATUS_STANDBY, dpr.standBy);
      this.applyDowntime(ops, STATUS_TECHNICAL_DOWNTIME, dpr.vesselNonAvailability);
      this.applyDowntime(ops, STATUS_WEATHER_ALLVESSEL, dpr.weatherDowntime, (x) => x.vesselsystem === 'Whole vessel');
      this.applyDowntime(ops, STATUS_WEATHER_OTHER, dpr.weatherDowntime);
    }
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

    kpi.effectiveWorkingDays = 1;
    return kpi;
  }

  splitByDate(array, startDate: number, stopDate: number) {

  }

  private applyDowntime(ops: any[], code: number, times: {startTime: string, stopTime: string}[], filter = (_: any) => true) {
    times.forEach(time => {
      if (filter(time)) {
        const index = this.objectToIndex(time);
        for (let _i = index.start; _i <= index.stop; _i++) {
          ops[_i] = code;
        }
      }
    });
  }

  private objectToIndex(obj: {startTime: string, stopTime: string}) {
    return {
      start: +obj.startTime,
      stop: +obj.stopTime
    };
  }
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
