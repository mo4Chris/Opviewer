import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as Chart from 'chart.js';
import { LongtermColorScheme } from '../../../../models/color_scheme';

@Component({
  selector: 'app-fuel-average-overview',
  templateUrl: './fuel-average-overview.component.html',
  styleUrls: ['./fuel-average-overview.component.scss']
})
export class FuelAverageOverviewComponent implements OnChanges {

  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private newService: CommonService,
    private ref: ChangeDetectorRef,
    ) {}


  @Input() vesselObject;
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();
  vesselName = '';
  chart: Chart;
  noData = true;
  public dsets: any[] = [];
  private backgroundcolors = LongtermColorScheme.backgroundColors;

  ngOnChanges(): void {
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

  private getChartData(
     cb: (out: {data: any[], matlabDates: number[], vesselname: string}[]) => void
    ) {
    this.newService.getEngineStatsForRange({
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: ['fuelUsedDepartM3', 'fuelUsedReturnM3' , 'fuelUsedTotalM3', 'date']
    }).subscribe((rawdatas) => {
      const outs: {data: any[], matlabDates: number[], vesselname: string}[] = [];
      if (rawdatas.length > 0 && rawdatas[0].date.length > 0) {
        rawdatas.map(rawdata => {
          const chartData = [];
          const matlabDates = rawdata.date;
          for (let _index = 0; _index < rawdata.date.length; _index++) {
            const generalDataDay: fuelObject = {
              date: rawdata.date[_index],
              fuelUsedDepartM3: 0,
              fuelUsedReturnM3: 0,
              fuelUsedTotalM3: 0,
            };
            if (rawdata.fuelUsedTotalM3[_index] > 0) {
              generalDataDay.fuelUsedDepartM3 = this.calculationService.switchUnits(rawdata?.fuelUsedDepartM3[_index], 'm3', 'liter');
              generalDataDay.fuelUsedReturnM3 = this.calculationService.switchUnits(rawdata?.fuelUsedReturnM3[_index] || 0, 'm3', 'liter');
              generalDataDay.fuelUsedTotalM3 =  this.calculationService.switchUnits(rawdata?.fuelUsedTotalM3[_index] - (rawdata?.fuelUsedDepartM3[_index] + rawdata?.fuelUsedReturnM3[_index]) || 0, 'm3', 'liter');
            }
            chartData.push(generalDataDay);
          }
          outs.push({
            data: chartData,
            vesselname: this.matchVesselnameByMmsi(rawdata._id),
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

private isInvalidData(data) {
  return ['_ArrayType_'].some((key: string) => {
    if (data[key]) {
      return true;
    } else {
      return false;
    }
  });
}

navigateToDPR(navItem: { mmsi: number, matlabDate: number }) {
  this.navigateToVesselreport.emit(navItem);
}

private buildGraphCallback (TimeBreakdowns, breakdownDates: number[], index: number, vesselname: string) {
  const matlabDates: number[] = this.calculationService.linspace(this.vesselObject.dateMin, this.vesselObject.dateMax);
  const dateLabels = matlabDates.map((daynum: number) => {
    return this.dateTimeService.MatlabDateToUnixEpochViaDate(daynum);
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

  const depart = getDset({
    label: 'Depart',
    backgroundColor: this.backgroundcolors[0].replace('1)', '0.7'),
  });
  const returntrip = getDset({
    label: 'Return',
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
      returntrip.data.push(0);
      inField.data.push(0);
      depart.data.push(0);
    } else {
      const local = TimeBreakdowns[validIdx];
      const hours = {
        fuelUsedDepartM3: 0,
        fuelUsedReturnM3: 0,
        fuelUsedTotalM3: 0,
      };
      Object.keys(local).forEach(key => {
        // 'hoursWaiting', 'hoursSailing', 'hoursOfCTVops', 'hoursAtTurbine', 'hoursAtPlatform'
        switch (key) {
          case 'fuelUsedDepartM3':
            hours.fuelUsedDepartM3 = local[key];
            break;
          case 'fuelUsedReturnM3':
            hours.fuelUsedReturnM3 = local[key];
            break;
          case 'fuelUsedTotalM3':
            hours.fuelUsedTotalM3 = local[key];
            break;
        }
      });
      depart.data.push(hours.fuelUsedDepartM3);
      returntrip.data.push(hours.fuelUsedReturnM3);
      inField.data.push(hours.fuelUsedTotalM3);

    }
  });

  const dsets = {
    labels: dateLabels,
    isFirst: index === 0,
    datasets: [depart, inField, returntrip ],
  };
  this.dsets[index] = dsets;
}

private matchVesselnameByMmsi(mmsi: number) {
  const index = this.vesselObject.mmsi.findIndex(x => x === mmsi);
  return this.vesselObject.vesselName[index];
}

  reset() {
    this.chart.destroy();
  }

}

interface fuelObject {
  date: Date,
  fuelUsedDepartM3: Number | Number[],
  fuelUsedReturnM3:  Number | Number[],
  fuelUsedTotalM3:  Number | Number[],
}

interface DatasetModel {
    label: String;
    data: Object[];
}

interface RawGeneralModel {
  dayNum: number;
  mmsi: number;
  vesselName: string;
}
