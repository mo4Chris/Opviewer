import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as Chart from 'chart.js';
import { now } from 'moment-timezone';
import { LongtermColorScheme } from '../../../../models/color_scheme';
import { LongtermProcessingService } from '../../../../models/longterm-processing-service.service';

@Component({
  selector: 'app-fuel-average-overview',
  templateUrl: './fuel-average-overview.component.html',
  styleUrls: ['./fuel-average-overview.component.scss']
})
export class FuelAverageOverviewComponent implements OnChanges {

  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    private parser: LongtermProcessingService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private newService: CommonService,
    ) {}


  @Input() vesselObject;
  vesselName = '';
  chart: Chart;
  noData = true;
  public dsets: any[] = [];
  private backgroundcolors = LongtermColorScheme.backgroundColors;

  ngOnChanges(): void {
    if (this.chart) {
      this.reset();
    }
    this.getChartData();
  }

  private getChartData(
    // cb: (out: {data: TimeBreakdown[], matlabDates: number[], vesselname: string}[]) => void
    ) {
    this.newService.getEngineStatsForRange({
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: ['fuelUsedDepartM3', 'fuelUsedReturnM3' , 'fuelUsedTotalM3', 'date']
    }).subscribe((rawdatas) => {
      console.log(rawdatas);

      if (rawdatas.length > 0 && rawdatas[0].date.length > 0) {

      // const outs: {data: TimeBreakdown[], matlabDates: number[], vesselname: string}[] = [];
      // if (rawdatas.length > 0 && rawdatas[0].length > 0) {
      //   rawdatas.map(rawdata => {
      //     const chartData = [];
      //     const matlabDates = rawdata.map(e => e.date);
      //     rawdata.forEach(generalData => {
      //       const generalDataDay = {
      //         date: generalData.date,
      //         minutesInField: 0,
      //         minutesTransitInbound: 0,
      //         minutesTransitOutbound: 0,
      //       };
      //       if (generalData.minutesInField > 0) {
      //         generalDataDay.minutesInField = generalData.minutesInField / 60;
      //         generalDataDay.minutesTransitOutbound = ((+generalData.DPRstats.WindFarmArrivalTime - +generalData.DPRstats.portDepartureTime) * 24) || 0;
      //         generalDataDay.minutesTransitInbound = ((+generalData.DPRstats.portArrivalTime - +generalData.DPRstats.departureWindFarmTime) * 24) || 0;
      //       }
      //       chartData.push(generalDataDay);
      //     });
      //     outs.push({
      //       data: chartData,
      //       vesselname: this.matchVesselnameByMmsi(rawdata[0].mmsi),
      //       matlabDates: matlabDates,
      //     });
      //   });
      // } else {
      //   this.noData = true;
      // }
      // if (cb && !this.noData) {
      //   this.ref.detectChanges();
      //   cb(outs);
      // }
      // this.ref.detectChanges();

    }
  });
}

private buildGraphCallback (TimeBreakdowns: TimeBreakdown[], breakdownDates: number[], index: number, vesselname: string) {
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

private constructNewChart() {
  const calcService = this.calculationService;
  const dateService = this.dateTimeService;
  this.chart = new Chart(this.canvas.nativeElement, {
    type: 'bar',
    data: this.dset,
    options: {
      tooltips: {
        filter: function (tooltipItem, data) {
          return data.datasets[tooltipItem.datasetIndex].xAxisID === 'x-axis-0';
        },
        callbacks: {
          beforeLabel: function (tooltipItem, data) {
            const date: Date = data.labels[tooltipItem.index];
            return [
              data.datasets[tooltipItem.datasetIndex].stack,
              dateService.jsDateToDMYString(date),
            ];
          },
          label: () => { }, // Disable to default color cb
          afterLabel: function (tooltipItem, data) {
            const info = [];
            data.datasets.forEach((dset, _i) => {
              if (dset.data[tooltipItem.index] > 0) {
                info.push(dset.label + ': ' + calcService.GetDecimalValueForNumber(dset.data[tooltipItem.index], ' hours'));
              }
            });
            return info;
          },
          title: function (tooltipItem, data) {
            // Prevents a bug from showing up in the bar chart tooltip
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      legend: {
        display: true, // this.dset.isFirst,
        labels: {
          defaultFontSize: 24,
          defaultFontStyle: 'bold',
          filter: (legItem, chart) => {
            return chart.datasets[legItem.datasetIndex].showInLegend;
          }
        },
        onClick: (event: MouseEvent, legItem) => {
          const Key = legItem.text;
          const _dsets = this.chart.config.data.datasets;
          _dsets.forEach(dset => {
            const metaKey = Object.keys(dset._meta)[0];
            if (dset.label === Key && dset._meta[metaKey]) {
              dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
            }
          });
          this.chart.update();
        }
      },
      scales: {
        xAxes: [{
          id: 'x-axis-0',
          stacked: true,
          display: false,
          min: 0,
        }, {
          id: 'x-axis-time',
          type: 'time',
          display: true,
          beginAtZero: false,
          time: {
            unit: 'day'
          },
          ticks: {
            min: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.dateMin),
            max: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.dateMax + 1),
            maxTicksLimit: 21,
          },
          gridLines: {
            display: false,
          }
        }],
        yAxes: [{
          id: 'y-axis-0',
          scaleLabel: {
            display: true,
            labelString: 'Number of hours',
          },
          ticks: {
            min: 0,
            max: 24,
            stepSize: 4,
          }
        }],
      },
      annotation: {
        events: ['mouseover', 'mouseout', 'dblclick', 'click'],
      },
      onClick: function (clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
        if (this.lastClick !== undefined && now() - this.lastClick < 300) {
          // Two clicks < 300ms ==> double click
          if (chartElt.length > 0) {
            chartElt = chartElt[chartElt.length - 1];
            const dataElt = chartElt._chart.data.datasets[chartElt._datasetIndex];
            if (dataElt.callback !== undefined) {
              dataElt.callback(chartElt._index);
            }
          }
        }
        this.lastClick = now();
      }
    }
  });
}


  reset() {
    this.chart.destroy();
  }

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
