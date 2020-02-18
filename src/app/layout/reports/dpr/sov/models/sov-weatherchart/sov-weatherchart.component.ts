import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, ViewChild,  } from '@angular/core';
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

  weatherOverviewChart: WeatherOverviewChart;
  weatherOverviewChartCalculated = false;
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
    const weather = this.sovModel.sovInfo.weatherConditions;
    if (weather !== undefined && isArray(weather.time)) {
      this.weatherOverviewChartCalculated = true;
      const timeStamps = weather.time.map(matlabTime => {
        return this.datetimeService
          .MatlabDateToUnixEpoch(matlabTime)
          .toISOString(false);
      });
      const dsets = [];
      let chartTitle;
      if (weather.wavesource === '_NaN_') {
        // chartTitle = 'Weather overview';
        chartTitle = '';
      } else {
        chartTitle = [
          // 'Weather overview',
          'Source: ' + weather.wavesource
        ];
      }
      // Loading each of the weather sources if they exist and are not NaN
      const waveParams = Object.keys(weather).filter(
        key => key !== 'time' && key !== 'wavesource'
      );
      waveParams.forEach(param => {
        const data = weather[param];
        if (
          isArray(data) &&
          data.some(
            (elt, _i) => elt && elt !== '_NaN_' && data[_i + 1]
          )
        ) {
          const label = param
            .replace('waveHs', 'Hs')
            .replace('waveTp', 'Tp');
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
            unit: unit,
            pointRadius: 0,
            borderWidth: 2,
            fill: false,
            yAxisID: axisID,
            // By default, we will now hide data that isnt handled properly
            hidden: axisID === 'hidden'
          });
        }
      });

      // Now create collection with all the dockings and v2v operations
      const dockingData = new Array();
      let start;
      let stop;
      this.sovModel.platformTransfers.forEach(transfer => {
        start = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.arrivalTimePlatform
        );
        stop = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.departureTimePlatform
        );
        dockingData.push({ x: start, y: 1 });
        dockingData.push({ x: stop, y: 1 });
        dockingData.push({ x: stop + 0.0001, y: NaN });
      });
      this.sovModel.turbineTransfers.forEach(transfer => {
        start = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.startTime
        );
        stop = this.datetimeService.MatlabDateToUnixEpoch(
          transfer.stopTime
        );
        dockingData.push({ x: start, y: 1 });
        dockingData.push({ x: stop, y: 1 });
        dockingData.push({ x: stop + 0.0001, y: NaN });
      });
      this.sovModel.vessel2vessels.forEach(vessel => {
        vessel.transfers.forEach(transfer => {
          start = this.datetimeService.MatlabDateToUnixEpoch(
            transfer.startTime
          );
          stop = this.datetimeService.MatlabDateToUnixEpoch(
            transfer.stopTime
          );
          dockingData.push({ x: start, y: 1 });
          dockingData.push({ x: stop, y: 1 });
          dockingData.push({ x: stop + 0.0001, y: NaN });
        });
      });
      dsets.push({
        data: dockingData,
        label: 'Vessel transfers',
        pointHoverRadius: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 0,
        yAxisID: 'hidden',
        lineTension: 0
      });
      if (this.weatherOverviewChart) {
        this.weatherOverviewChart.destroy();
      }
      setTimeout(() => {
        this.weatherOverviewChart = new WeatherOverviewChart(
          {
            dsets: dsets,
            timeStamps: <any>timeStamps,
            wavedataSourceName: chartTitle
          },
          this.calcService,
          this.settings
        );
      }, 300);
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
