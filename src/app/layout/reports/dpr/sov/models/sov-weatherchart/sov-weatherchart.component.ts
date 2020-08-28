import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, ViewChild, } from '@angular/core';
import { WeatherOverviewChart } from '../../../models/weatherChart';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SovModel } from '../SovModel';
import { isArray } from 'util';
import * as Chart from 'chart.js';
import { SettingsService } from '@app/supportModules/settings.service';
import { CalculationService } from '@app/supportModules/calculation.service';

@Component({
  selector: 'app-sov-weatherchart',
  templateUrl: './sov-weatherchart.component.html',
  styleUrls: [
    './sov-weatherchart.component.scss',
    '../../sovreport.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovWeatherchartComponent implements OnChanges {
  @Input() sovModel: SovModel;
  @Input() vesselUtcOffset: number; // UTC offset vessel
  @Input() printmode = false;

  weatherOverviewChart: WeatherOverviewChart;
  weatherOverviewChartCalculated = false;
  utcOffset = 0;

  constructor(
    private datetimeService: DatetimeService,
    private settings: SettingsService,
    private calcService: CalculationService
  ) { }

  ngOnChanges() {
    this.createWeatherOverviewChart();
  }

  testValidWeatherField(weatherField: number[]) {
    return (
      isArray(weatherField) &&
      weatherField.reduce(
        (curr: boolean, val: any) => curr || typeof val === 'number',
        false
      )
    );
  }

  createWeatherOverviewChart() {
    if (this.weatherOverviewChart) {
      this.weatherOverviewChart.destroy();
    }
    const weather = this.sovModel.sovInfo.weatherConditions;
    this.utcOffset = this.settings.getTimeOffset(this.vesselUtcOffset) || 0;
    const offset = this.utcOffset / 24;
    if (weather !== undefined && isArray(weather.time)) {
      this.weatherOverviewChartCalculated = true;
      const timeStamps = weather.time.map(matlabTime => {
        return this.datetimeService
          .MatlabDateToUnixEpoch(matlabTime + offset)
          .toISOString(false);
      });
      const dsets = [];
      let chartTitle = weather.wavesource === '_NaN_' ? '' : 'Source: ' + weather.wavesource
      // Loading each of the weather sources if they exist and are not NaN
      const waveParams = Object.keys(weather).filter(
        key => key !== 'time' && key !== 'wavesource'
      );
      // For each wave parameter
      waveParams.forEach(param => {
        const data = weather[param];
        if ( isArray(data) && data.some((elt, _i) => elt && elt !== '_NaN_' && data[_i + 1])  ) {
          const label = param
            .replace('waveHs', 'Hs')
            .replace('waveTp', 'Tp');
          let ax = this.getAxis(label);
          dsets.push({
            data: data.map((dataElt, i) => {
              if (typeof dataElt === 'number' && dataElt >= 0) {
                return { x: timeStamps[i], y: dataElt };
              } else {
                return { x: timeStamps[i], y: NaN };
              }
            }),
            label: label,
            pointHoverRadius: 5,
            pointHitRadius: 30,
            unit: ax.unit,
            pointRadius: 0,
            borderWidth: 2,
            fill: false,
            yAxisID: ax.axisID,
            // By default, we will now hide data that isnt handled properly
            hidden: ax.axisID === 'hidden'
          });
        }
      });

      // Now create collection with all the dockings and v2v operations
      let dockingData = new Array();
      let start: any;
      let stop: any;
      this.sovModel.platformTransfers.forEach(transfer => {
        start = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.arrivalTimePlatform + offset
        );
        stop = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.departureTimePlatform + offset
        );
        dockingData.push({ x: start, y: 1});
        dockingData.push({ x: stop, y: 1});
        dockingData.push({ x: stop + 0.0001, y: NaN});
      });
      this.addOperationsInfo(dsets, dockingData, {
        label: 'Platform transfers',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
      })

      // Turbine operations
      dockingData = new Array();
      this.sovModel.turbineTransfers.forEach(transfer => {
        start = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.startTime + offset
        );
        stop = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.stopTime + offset
        );
        dockingData.push({ x: start, y: 1});
        dockingData.push({ x: stop, y: 1});
        dockingData.push({ x: stop + 0.0001, y: NaN});
      });
      this.addOperationsInfo(dsets, dockingData, {
        label: 'Turbine transfers',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
      })
      
      // V2v transfers
      dockingData = new Array();
      this.sovModel.vessel2vessels.forEach(vessel => {
        vessel.transfers.forEach(transfer => {
          start = this.datetimeService.MatlabDateToUnixEpoch(
            transfer.startTime + offset
          );
          stop = this.datetimeService.MatlabDateToUnixEpoch(
            transfer.stopTime + offset
          );
          dockingData.push({ x: start, y: 1});
          dockingData.push({ x: stop, y: 1});
          dockingData.push({ x: stop + 0.0001, y: NaN});
        });
      });
      this.addOperationsInfo(dsets, dockingData, {
        label: 'V2v transfers',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
      })

      // Transit
      console.log(this.sovModel)
      dockingData = new Array();
      this.sovModel.transits.forEach(_transit => {
        start = this.datetimeService.MatlabDateToUnixEpoch(
          _transit.dayNum + offset
        );
        stop = this.datetimeService.MatlabDateToUnixEpoch(
          _transit.dayNum + _transit.transitTimeMinutes / 60 / 24 + offset
        );
        dockingData.push({ x: start, y: 1});
        dockingData.push({ x: stop, y: 1});
        dockingData.push({ x: stop + 0.0001, y: NaN});
      });
      this.addOperationsInfo(dsets, dockingData, {
        label: 'Transit',
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
      })

      setTimeout(() => {
        this.weatherOverviewChart = new WeatherOverviewChart(
          {
            dsets: dsets,
            timeStamps: <any>timeStamps,
            wavedataSourceName: chartTitle,
            utcOffset: this.utcOffset,
          },
          this.calcService,
          this.settings
        );
      }, 300);
    }
  }

  getAxis(label: string) {
    let unit = '';
    let axisID = 'hidden';
    switch (label) {
      case 'Hs':
      case 'Hmax':
      case 'waveHmax':
        unit = 'm'; // Indicates unit in database, not displayed unit
        axisID = 'Hs';
        break;
      case 'waveDirection':
      case 'windDirection':
      case 'waveDir':
      case 'windDir':
        unit = 'deg';
        axisID = 'waveDir';
        break;
      case 'Tp':
      case 'Tz':
      case 'T0':
        unit = 's';
        axisID = 'Tp';
        break;
      case 'Wind':
      case 'WindAvg':
      case 'WindGust':
      case 'windAvg':
      case 'windGust':
        unit = 'km/h';
        axisID = 'Wind';
        break;
      default:
        console.error('Unhandled unit: ' + label);
    }
    return {
      unit: unit,
      axisID: axisID,
    }
  }

  private addOperationsInfo(dsets: Array<any>, ops: Array<any>, config: any) {
    if (ops.length > 0) {
      dsets.push({... {
        data: ops,
        label: 'Vessel operations',
        pointHoverRadius: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 0,
        yAxisID: 'hidden',
        lineTension: 0,
      }, ... config});
    }
  }

  datasetIsActive(dset: { hidden: boolean }, dsetIndex: number, chart: Chart) {
    const meta = chart.getDatasetMeta(dsetIndex);
    let hidden: boolean;
    if (meta.hidden === null) {
      hidden = dset.hidden === true;
    } else {
      hidden = meta.hidden;
    }
    const final = !hidden;
    return final;
  }
}
