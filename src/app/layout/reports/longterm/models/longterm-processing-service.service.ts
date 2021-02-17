import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { ComprisonArrayElt, RawScatterData } from './scatterInterface';
import { CommonService, StatsRangeRequest } from '@app/common.service';
import * as Chart from 'chart.js';
import { Observable, forkJoin } from 'rxjs';
import { LongtermColorScheme } from './color_scheme';
import { LongtermVesselObjectModel } from '../longterm.component';
import { map } from 'rxjs/operators';
import { now } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class LongtermProcessingService {
  backgroundcolors = LongtermColorScheme.backgroundColors;
  bordercolors = LongtermColorScheme.bordercolors;
  pointStyles = LongtermColorScheme.pointStyles;
  borderWidth = LongtermColorScheme.borderWidth;

  constructor(
    private calculationService: CalculationService,
    private settings: SettingsService,
    private dateTimeService: DatetimeService,
    private newService: CommonService,
  ) { }

  load(queryElt: StatsRangeRequest, dataType: string, vesselType: 'CTV' | 'SOV' | 'OSV', cb?: Function): Observable<any> {
    let loadable: Observable<any>;
    switch (vesselType) {
      case 'CTV':
        switch (dataType) {
          case 'transfer':
            loadable = this.newService.getTransfersForVesselByRange(queryElt);
            break;
          case 'transit':
            // We specifically filter transits to harbour-field or field harbour
            queryElt.reqFields.push('combinedId');
            loadable = this.newService.getTransitsForVesselByRange(queryElt).pipe(map(_transits => {
              _transits.forEach(transit => {
                const valid = transit.combinedId.map((_combinedId: number) => _combinedId === 12 || _combinedId === 21);
                queryElt.reqFields.map(name => {
                  if (transit[name]) {
                    transit[name] = transit[name].filter((_: any, _i: number) => valid[_i]);
                  }
                });
              });
              return _transits;
            }));
            break;
            case 'transitIn':
            // We specifically filter transits to field harbour
            queryElt.reqFields.push('combinedId');
            loadable = this.newService.getTransitsForVesselByRange(queryElt).pipe(map(_transits => {
              _transits.forEach(transit => {
                const valid = transit.combinedId.map((_combinedId: number) =>  _combinedId === 21);
                queryElt.reqFields.map(name => {
                  if (transit[name]) {
                    transit[name] = transit[name].filter((_: any, _i: number) => valid[_i]);
                  }
                });
              });
              return _transits;
            }));
            break;
            case 'transitOut':
            // We specifically filter transits to harbour-field
            queryElt.reqFields.push('combinedId');
            loadable = this.newService.getTransitsForVesselByRange(queryElt).pipe(map(_transits => {
              _transits.forEach(transit => {
                const valid = transit.combinedId.map((_combinedId: number) => _combinedId === 12);
                queryElt.reqFields.map(name => {
                  if (transit[name]) {
                    transit[name] = transit[name].filter((_: any, _i: number) => valid[_i]);
                  }
                });
              });
              return _transits;
            }));
            break;
            case 'engine':
              loadable = this.newService.getEngineStatsForRange(queryElt).pipe(map(elt => {
                return elt;
              }));
            break;
          default:
            throw Error('Unsupported CTV data pipeline <' + dataType + '>!');
        }
        break;
      case 'OSV': case 'SOV':
        switch (dataType) {
          case 'turbine':
            loadable = this.newService.getTurbineTransfersForVesselByRangeForSOV(queryElt);
            break;
          case 'platform':
            loadable = this.newService.getPlatformTransfersForVesselByRangeForSOV(queryElt);
            break;
          case 'transit':
            loadable = this.newService.getTransitsForVesselByRangeForSOV(queryElt);
            break;
          case 'transfer':
            loadable = this.getCombinedTransferObservable(queryElt, cb);
            break;
          default:
            throw Error('Unsupported SOV data pipeline <' + dataType + '>!');
        }
        break;
      default:
        throw Error('Invalid vessel type <' + vesselType + '>!');
    }
    return loadable;
  }

  processData(Type: string, elt: number) {
    switch (Type) {
      case 'startTime': case 'date': case'arrivalTimePlatform':
        return this.createTimeLabels(elt);
      case 'Hs':
        return elt;
      case 'score':
        return elt;
      case 'impactForceNmax':
        return elt / 1000;
      case 'MSI': case 'msi':
        return elt;
      case 'transitTimeMinutes':
        return elt;
      case 'visitDuration': case 'duration':
        return elt;
      case 'vesselname':
        return elt;
      case 'date':
        return elt;
      case 'fuelUsedTotalM3': case 'fuelUsedReturnM3': case 'fuelUsedDepartM3': case 'fuelUsedTransferM3':
        return 1000 * elt;
      case 'fuelPerHourTotal': case 'fuelPerHourReturn': case 'fuelPerHourDepart': case 'fuelPerHourTransfer':
        return 1000 * elt;
      case 'speed': case 'speedInTransitAvgKMH': case 'speedInTransitKMH':
        return this.calculationService.switchSpeedUnits([elt], 'km/h', this.settings.unit_speed)[0];
      default:
        throw Error('Unsupported type ' + Type);
        return NaN;
    }
  }

  createTimeLabels(timeElt: number) {
    if (timeElt !== null && typeof timeElt !== 'object') {
      return this.dateTimeService.matlabDatenumToDate(timeElt);
    } else {
      return NaN;
    }
  }

  filterNans(rawData: ScatterDataElt[], type: string) {
    // ToDo: not have bargraph call this fcn
    if (type === 'bar') {
      return rawData;
    } else {
      return rawData.filter(data => !(isNaN(data.x as number) || isNaN(data.y as number) || data.x === null || data.y === 0 || data.y === null));
    }
  }

  getAxisType(dataArrays: {data: {x: any, y: any}[]}[]): axisType {
    const type: axisType = {x: 'hidden', y: 'hidden'};
    dataArrays.some((dataArray: {data: {x: any, y: any}[]}) => {
      return dataArray.data.some((dataElt: {x: any, y: any}) => {
        if (typeof dataElt.x === 'string' && dataElt.x !== '_NaN_') {
          type.x = 'label';
          type.y = 'numeric';
        } else if (!(isNaN(dataElt.x) || isNaN(dataElt.y))) {
          if (typeof dataElt.x === 'number') {
            type.x = 'numeric';
          } else {
            type.x = 'date';
          }
          if (typeof dataElt.y === 'number') {
            type.y = 'numeric';
          } else {
            type.y = 'date';
          }
          return true;
        } else {
          return false;
        }
      });
    });
    return type;
  }

  createChartlyScatter(datas: ScatterDataElt[], index: number = 0, opts: LongtermScatterValueArrayOpts = {}): LongtermScatterValueArray {
    return {... {
      data: this.filterNans(datas, 'scatter'),
      label: 'N/a',
      pointStyle: this.pointStyles[index],
      backgroundColor: this.backgroundcolors[index] || 'rgba(0,0,0,0.3)',
      borderColor: this.bordercolors[index],
      radius: 4,
      pointHoverRadius: 10,
      borderWidth: this.borderWidth[index],
      hitRadius: 10,
      showInLegend: true
    }, ... opts};
  }

  createChartlyLine(datas: ScatterDataElt[], index: number = 0, opts: LongtermScatterValueArrayOpts = {}): LongtermScatterValueArray {
    return {... {
      data: this.filterNans(datas, 'area'),
      label: 'N/a',
      type: 'line',
      showInLegend: false,
      showLine: true,
      pointRadius: 0,
      backgroundColor: this.backgroundcolors[index].replace('1)', '0.4)'), // We need to lower opacity
      borderColor: this.backgroundcolors[index],
      fill: false,
      borderWidth: 0,
      lineTension: 0.1,
    }, ... opts};
  }

  createChartlyBar(datas: ScatterDataElt[], index: number = 0, opts: LongtermScatterValueArrayOpts = {}): LongtermScatterValueArray {
    return {... {
      data: datas,
      label: 'N/a',
      type: 'line',
      showInLegend: false,
      showLine: true,
      pointRadius: 0,
      backgroundColor: this.backgroundcolors[index], // We need to lower opacity
      borderColor: this.bordercolors[index],
      fill: false,
      borderWidth: 0,
      lineTension: 0.1,
    }, ... opts};
  }

  createNewLegendAndAttach(chartInstance, legendOpts): void {
    const legend = new Chart.Legend({
      ctx: chartInstance.chart.ctx,
      options: legendOpts,
      chart: chartInstance
    });
    if (chartInstance.legend) {
      Chart.layoutService.removeBox(chartInstance, chartInstance.legend);
      delete chartInstance.newLegend;
    }
    chartInstance.newLegend = legend;
    Chart.layoutService.addBox(chartInstance, legend);
  }

  reduceLabels(vesselObject: LongtermVesselObjectModel, received_mmsi: number[]): string[] {
    return received_mmsi.map(mmsi => {
      return vesselObject.vesselName[
        vesselObject.mmsi.findIndex(_mmsi => _mmsi === mmsi)
      ];
    });
  }

  setAnnotations(compElt: ComprisonArrayElt) {
    return compElt.annotation ? [compElt.annotation()] : [];
  }

  drawHorizontalLine(yVal: number, label?: string) {
    return {
      passive: false,
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y-axis-0',
      value: 1.0001 * yVal, // we add small number to make graphs auto-scale above the line
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 3,
      label: {
        position: 'left',
        xAdjust: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        fontColor: '#fff',
        enabled: true,
        content: label
      }
    };
  }

  defaultClickHandler (clickEvent: Chart.clickEvent, chartElt: Chart.ChartElement) {
    const ct = this as Chart;
    if (ct.lastClick !== undefined && now() - ct.lastClick < 300) {
      // Two clicks < 300ms ==> double click
      if (chartElt && chartElt.length > 0) {
        chartElt = chartElt[0];
        const dataElt = chartElt._chart.data.datasets[chartElt._datasetIndex].data[chartElt._index];
        if (dataElt.callback !== undefined) {
          dataElt.callback();
        }
      }
    }
    ct.lastClick = now();
  }

  // Utility
  getMatlabDateYesterday() {
    return this.dateTimeService.getMatlabDateYesterday();
  }
  getMatlabDateLastMonth() {
    return this.dateTimeService.getMatlabDatenumLastMonth();
  }
  getJSDateYesterdayYMD() {
    return this.dateTimeService.getYmdStringYesterday();
  }
  getJSDateLastMonthYMD() {
    return this.dateTimeService.getYmdStringLastMonth();
  }
  MatlabDateToJSDateYMD(serial: number) {
    return this.dateTimeService.matlabDatenumToYmdString(serial);
  }
  unixEpochtoMatlabDate(epochDate: number) {
    return this.dateTimeService.unixEpochtoMatlabDatenum(epochDate);
  }
  MatlabDateToUnixEpochViaDate(serial: number) {
    return this.dateTimeService.matlabDatenumToDate(serial);
  }
  parseScatterDate(t: number) {
    return new Date(this.MatlabDateToUnixEpochViaDate(t).getTime());
  }

  private fixLoadOrder(query: StatsRangeRequest, raws: any[]) {
    const proper = new Array(query.mmsi.length);
    let mmsi: number;
    for (let i = 0; i < query.mmsi.length; i++) {
      mmsi = query.mmsi[i];
      proper[i] = raws.find(_raw => _raw.id === mmsi);
    }
    return raws;
  }

  private getCombinedTransferObservable(queryElt: {
      mmsi: number[],
      dateMin: number,
      dateMax: number,
      reqFields: string[],
  }, groupCallback: Function): Observable<any> {
    // Retrieves data for both turbine and platform transfer stats
    const index = (arr: Array<any>, _mmsi: number) => {
      let content = null;
      arr.some((elt) => {
        if (elt._id === _mmsi) {
          content = elt;
          return true;
        }
        return false;
      });
      if (content) {
        content.groups = this.dateTimeService.groupMatlabDatenumsByMonth(content);
      }
      return content;
    };
    const queryEltTurb = { ... queryElt, ... {reqFields: ['startTime', 'duration', 'Hs']}};
    const queryEltPlatform = { ... queryElt, ... {reqFields: ['date', 'arrivalTimePlatform', 'visitDuration', 'Hs']}};

    return forkJoin(
      this.newService.getTurbineTransfersForVesselByRangeForSOV(queryEltTurb),
      this.newService.getPlatformTransfersForVesselByRangeForSOV(queryEltPlatform)
    ).pipe(map(([turbine = null, platform = null]) => {
        const output = [];
        queryElt.mmsi.forEach((_mmsi: number, _i) => {
          const local = {
            _id: _mmsi,
            label: [''],
            turbine: null,
            platform: null,
          };
          local.turbine = index(turbine, _mmsi);
          local.platform = index(platform, _mmsi);
          if (local.turbine) {
            local.label = local.turbine.label;
            output.push(local);
          } else if (local.platform) {
            local.label = local.platform.label;
            output.push(local);
          }
        });
        return output;
      }
    ));
  }
}

type SingleAxisType = 'hidden' | 'date' | 'numeric' | 'label';
interface axisType {
  x: SingleAxisType;
  y: SingleAxisType;
}

interface ScatterArguments {
  axisType: {x: string, y: string};
  graphIndex: number;
  datasets: LongtermScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins ?: number[];
}

export interface LongtermScatterValueArray {
  data: ScatterDataElt[];
  label: string;
  pointStyle?: string;
  backgroundColor?: string;
  borderColor?: string;
  radius?: number;
  pointHoverRadius?: number;
  borderWidth?: number;
  hitRadius?: number;
  showInLegend?: boolean;
  type?: string;
  showLine?: boolean;
  pointRadius?: number;
  fill?: boolean | string;
  lineTension?: number;
}

interface LongtermScatterValueArrayOpts {
  type?: string;
  label?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  radius?: number;
  hitRadius?: number;
  showInLegend?: boolean;
  showLine?: boolean;
  lineTension?: number;
  pointStyle?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  fill?: boolean | string;
}

interface ScatterDataElt {
  x: number | Date;
  y: number | Date;
  label?: string[];
  key?: string;
  callback?: Function;
}

export interface LongtermParsedWavedata {
  timeStamp: any[];
  Hs: any[];
  Tp: any[];
  waveDir: any[];
  wind: any[];
  windDir: any[];
}
