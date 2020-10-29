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


@Component({
  selector: 'app-ctv-utilization-graph',
  templateUrl: './utilizationGraph.component.html',
  styleUrls: ['../../longtermCTV.component.scss',
    './utilizationGraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilizationGraphComponent implements OnInit, OnChanges {
  constructor(
    private newService: CommonService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private ref: ChangeDetectorRef,
  ) {
  }

  @Input() vesselObject: { dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[] };
  @Input() tokenInfo: TokenModel;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

  Chart: Chart;
  RawData: RawGeneralModel[];
  TimeBreakdown: TimeBreakdown[];
  vesselName: string;
  noData = false;
  backgroundcolors = LongtermColorScheme.backgroundColors;

  ngOnInit() {
    this.updateChart();

  }

  ngOnChanges() {
    this.updateChart();
  }

  updateChart() {
    this.noData = false;
    this.getChartData((TimeBreakdowns: TimeBreakdown[], breakdownDates: number[]) => {
      const matlabDates: number[] = this.calculationService.linspace(this.vesselObject.dateMin, this.vesselObject.dateMax);
      const dateLabels = matlabDates.map((daynum: number) => {
        return this.dateTimeService.MatlabDateToUnixEpochViaDate(daynum);
      }); // Can only have one vessel
      let validIdx: number;
      const getDset = (options: object) => {
        const def = {
          label: 'No data',
          data: [],
          stack: this.vesselName,
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
        if (validIdx === -1 || isInvalidData(TimeBreakdowns[validIdx])) {
          inbound.data.push(0);
          outbound.data.push(0);
          inField.data.push(0);
        } else {
          const local = TimeBreakdowns[validIdx];
          const hours = {
            minutesTransitInbound: 0,
            minutesTransitOutbound: 0,
            minutesInField: 0
          };
          Object.keys(local).forEach(key => {
            // 'hoursWaiting', 'hoursSailing', 'hoursOfCTVops', 'hoursAtTurbine', 'hoursAtPlatform'
            switch (key) {
              case 'minutesTransitInbound':
                hours.minutesTransitInbound = local[key];
                break;
              case 'minutesTransitOutbound':
                hours.minutesTransitOutbound = local[key];
                break;
              case 'minutesInField':
                hours.minutesInField = local[key];
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
        datasets: [inbound, outbound, inField],
      };
      if (this.Chart) {
        // Update the chart
        this.Chart.data = dsets;
        this.Chart.scales['x-axis-time'].options.ticks.min = dateLabels[0];
        this.Chart.scales['x-axis-time'].options.ticks.max = dateLabels[-1];
        this.Chart.update();
      } else {
        this.constructNewChart(dsets);
      }
    });

    function isInvalidData(data: TimeBreakdown) {
      return ['_ArrayType_'].some((key: string) => {
        if (data[key]) {
          return true;
        } else {
          return false;
        }
      });
    }
  }

  navigateToDPR(navItem: { mmsi: number, matlabDate: number }) {
    this.navigateToVesselreport.emit(navItem);
  }

  getChartData(cb: (data: TimeBreakdown[], matlabDates: number[]) => void) {
    const chartData = [];

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
      }).subscribe((rawdata: RawGeneralModel[][]) => {
      if (rawdata.length > 0 && rawdata[0].length > 0) {

        this.RawData = rawdata[0];
        this.vesselName = this.RawData[0].vesselname;

        rawdata[0].forEach(generalData => {
          const generalDataDay = {
            date: generalData.date,
            minutesInField: 0,
            minutesTransitInbound: 0,
            minutesTransitOutbound: 0,
          };
          if (generalData.minutesInField > 0) {
            generalDataDay.minutesInField = generalData.minutesInField / 60;
            generalDataDay.minutesTransitOutbound =  ((generalData.DPRstats.WindFarmArrivalTime - generalData.DPRstats.portDepartureTime) * 24) || 0;
            generalDataDay.minutesTransitInbound =  ((generalData.DPRstats.portArrivalTime - generalData.DPRstats.departureWindFarmTime) * 24) || 0;
          }
          chartData.push(generalDataDay);

          this.TimeBreakdown = chartData;
        });



      } else {
        this.noData = true;
      }
      if (cb && typeof (this.RawData) === 'object') {
        cb(this.TimeBreakdown, this.RawData.map(rawDataElt => rawDataElt.date));
      }
      this.ref.detectChanges();
    });

  }

  constructNewChart(
    dsets: any,
  ) {

    console.log(dsets);
    const calcService = this.calculationService;
    const dateService = this.dateTimeService;
    this.Chart = new Chart('utilizationGraph', {
      type: 'bar',
      data: dsets,
      options: {
        title: {
          display: true,
          text: 'Vessel utilization chart',
          fontSize: 20,
          position: 'top'
        },
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
          display: true,
          labels: {
            defaultFontSize: 24,
            defaultFontStyle: 'bold',
            filter: (legItem, chart) => {
              return chart.datasets[legItem.datasetIndex].showInLegend;
            }
          },
          onClick: (event: MouseEvent, legItem) => {
            const Key = legItem.text;
            const _dsets = this.Chart.config.data.datasets;
            _dsets.forEach(dset => {
              const metaKey = Object.keys(dset._meta)[0];
              if (dset.label === Key && dset._meta[metaKey]) {
                dset._meta[metaKey].hidden = dset._meta[metaKey].hidden ? undefined : true;
              }
            });
            this.Chart.update();
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
              min: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin),
              max: this.dateTimeService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax),
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
}

interface RawGeneralModel {
  date: number;
  mmsi: number;
  vesselName: string;
  minutesInField: number;
  DPRstats: Object;
}

interface TimeBreakdown {
  hoursOfCTVops: number;
  hoursSailing: number;
  hoursWaiting: number;
  hoursAtTurbine: number;
}
