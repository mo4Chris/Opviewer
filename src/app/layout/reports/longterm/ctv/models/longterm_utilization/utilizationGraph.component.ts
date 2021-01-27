import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { TokenModel } from '@app/models/tokenModel';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { map } from 'rxjs/operators';
import { now } from 'moment';
import { LongtermColorScheme } from '../../../models/color_scheme';
import { CtvDprStatsModel } from '@app/layout/reports/dpr/models/generalstats.model';
import { LongtermVesselObjectModel } from '../../../longterm.component';


@Component({
  selector: 'app-ctv-utilization-graph',
  templateUrl: './utilizationGraph.component.html',
  styleUrls: ['../../longtermCTV.component.scss',
    './utilizationGraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvUtilizationGraphComponent implements OnChanges {
  constructor(
    private newService: CommonService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private ref: ChangeDetectorRef,
  ) {
  }

  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();
  private backgroundcolors = LongtermColorScheme.backgroundColors;

  public dsets: any[] = [];
  public noData = false;

  get numVessels() {
    return this.vesselObject.mmsi.length;
  }

  ngOnChanges() {
    this.updateChart();
  }

  updateChart() {
    this.noData = false;
    this.getChartData((outputs) => {
      this.dsets = new Array(outputs.length);
      outputs.forEach((out, index) => {
        this.buildGraphCallback(out.data, out.matlabDates, index, out.vesselname);
      });
    });
  }

  navigateToDPR(navItem: { mmsi: number, matlabDate: number }) {
    this.navigateToVesselreport.emit(navItem);
  }

  private isInvalidData(data: TimeBreakdown) {
    return ['_ArrayType_'].some((key: string) => {
      if (data[key]) {
        return true;
      } else {
        return false;
      }
    });
  }
  private getChartData(cb: (out: {data: TimeBreakdown[], matlabDates: number[], vesselname: string}[]) => void) {
    this.newService.getGeneralForRange({
      vesselType: 'CTV',
      mmsi: this.vesselObject.mmsi,
      startDate: this.vesselObject.dateMin,
      stopDate: this.vesselObject.dateMax,
      projection: {
        _id: 0,
        date: 1,
        mmsi: 1,
        minutesInField: 1,
        DPRstats: 1,
        vesselname: 1,
      }
    }).subscribe((rawdatas: RawGeneralModel[][]) => {
      const outs: {data: TimeBreakdown[], matlabDates: number[], vesselname: string}[] = [];
      if (rawdatas.length > 0 && rawdatas[0].length > 0) {
        rawdatas.map(rawdata => {
          const chartData = [];
          const matlabDates = rawdata.map(e => e.date);
          rawdata.forEach(generalData => {
            const generalDataDay = {
              date: generalData.date,
              minutesInField: 0,
              minutesTransitInbound: 0,
              minutesTransitOutbound: 0,
            };
            if (generalData.minutesInField > 0) {
              generalDataDay.minutesInField = generalData.minutesInField / 60;
              generalDataDay.minutesTransitOutbound = ((+generalData.DPRstats.WindFarmArrivalTime - +generalData.DPRstats.portDepartureTime) * 24) || 0;
              generalDataDay.minutesTransitInbound = ((+generalData.DPRstats.portArrivalTime - +generalData.DPRstats.departureWindFarmTime) * 24) || 0;
            }
            chartData.push(generalDataDay);
          });
          outs.push({
            data: chartData,
            vesselname: this.matchVesselnameByMmsi(rawdata[0].mmsi),
            matlabDates: matlabDates,
          });
        });
      } else {
        this.noData = true;
      }
      if (cb && !this.noData) {
        this.ref.detectChanges();
        cb(outs);
      }
      this.ref.detectChanges();

    });
  }


  private buildGraphCallback (TimeBreakdowns: TimeBreakdown[], breakdownDates: number[], index: number, vesselname: string) {
    const matlabDates: number[] = this.calculationService.linspace(this.vesselObject.dateMin, this.vesselObject.dateMax);
    const dateLabels = matlabDates.map((daynum: number) => {
      return this.dateTimeService.matlabDatenumToDate(daynum);
    });
    let validIdx: number;
    const getDset = (options: object) => {
      const def = {
        label: 'No data',
        data: [],
        stack: vesselname,
        showInLegend: true,
        xAxisID: 'x-axis-0',
        yAxisID: 'y-axis-0',
        backgroundColor: LongtermColorScheme.missingData, // vColor.replace('1)', (5 - _j) / 5 + ')'),
        callback: (index: number) => this.navigateToDPR({
          mmsi: this.vesselObject.mmsi[0],
          matlabDate: matlabDates[index],
        }),
        categoryPercentage: 1.0,
        barPercentage: 1.0,
      };
      return { ...def, ...options };
    };

    const inbound = getDset({
      label: 'Inbound',
      backgroundColor: this.backgroundcolors[0].replace('1)', '0.7'),
    });
    const outbound = getDset({
      label: 'Outbound',
      backgroundColor: this.backgroundcolors[1],
    });
    const inField = getDset({
      label: 'In field',
      backgroundColor: this.backgroundcolors[2],
    });
    matlabDates.forEach(day => {
      // Loop over days
      validIdx = breakdownDates.findIndex(date => date === day);
      if (validIdx === -1 || this.isInvalidData(TimeBreakdowns[validIdx])) {
        outbound.data.push(0);
        inField.data.push(0);
        inbound.data.push(0);
      } else {
        const local = TimeBreakdowns[validIdx];
        const hours = {
          minutesTransitOutbound: 0,
          minutesInField: 0,
          minutesTransitInbound: 0,
        };
        Object.keys(local).forEach(key => {
          // 'hoursWaiting', 'hoursSailing', 'hoursOfCTVops', 'hoursAtTurbine', 'hoursAtPlatform'
          switch (key) {
            case 'minutesTransitOutbound':
              hours.minutesTransitOutbound = local[key];
              break;
            case 'minutesInField':
              hours.minutesInField = local[key];
              break;
            case 'minutesTransitInbound':
              hours.minutesTransitInbound = local[key];
              break;
          }
        });
        inbound.data.push(hours.minutesTransitInbound);
        outbound.data.push(hours.minutesTransitOutbound);
        inField.data.push(hours.minutesInField);
      }
    });

    const dsets = {
      labels: dateLabels,
      isFirst: index === 0,
      datasets: [outbound, inField, inbound],
    };
    this.dsets[index] = dsets;
  }

  private matchVesselnameByMmsi(mmsi: number) {
    const index = this.vesselObject.mmsi.findIndex(x => x === mmsi);
    return this.vesselObject.vesselName[index];
  }
}

interface RawGeneralModel {
  mmsi: number;
  vesselname: string;
  date: number;
  minutesInField: number;
  DPRstats: CtvDprStatsModel;
}

interface TimeBreakdown {
  hoursOfCTVops: number;
  hoursSailing: number;
  hoursWaiting: number;
  hoursAtTurbine: number;
}
