import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { ComprisonArrayElt, RawScatterData } from './scatterInterface';
import { CommonService, StatsRangeRequest } from '@app/common.service';
import * as Chart from 'chart.js';
import { Observable } from 'rxjs';
import { LongtermColorScheme } from './color_scheme';

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

  load(queryElt: StatsRangeRequest, dataType: string): Observable<any> {
    let loadable: Observable<any>;
    switch (dataType) {
      case 'transfer':
        loadable = this.newService.getTransfersForVesselByRange(queryElt);
        break;
      case 'transit':
        loadable = this.newService.getTransfersForVesselByRange(queryElt);
        break;
      default:
        throw Error('Unsupported data pipeline!')
    }
    return loadable;
  }

  processData(Type: string, elt: number) {
    switch (Type) {
      case 'startTime': case 'date':
        return this.createTimeLabels(elt);
      case 'Hs':
        return elt;
      case 'score':
        return elt;
      case 'impactForceNmax':
        return elt / 1000;
      case 'MSI':
        return elt;
      case 'transitTimeMinutes':
        return elt;
      case 'vesselname':
        return elt;
      case 'date':
        return elt;
      case 'speed': case 'speedInTransitAvgKMH': case 'speedInTransitKMH':
        return this.calculationService.switchSpeedUnits([elt], 'km/h', this.settings.unit_speed)[0];
      default:
        return NaN;
    }
  }

  createTimeLabels(timeElt: number) {
    if (timeElt !== null && typeof timeElt !== 'object') {
      return this.MatlabDateToUnixEpochViaDate(timeElt);
    } else {
      return NaN;
    }
  }

  filterNans(rawData: ScatterDataElt[], type: string) {
    // ToDo: not have bargraph call this fcn
    if (type === 'bar') {
      return rawData;
    } else {
      return rawData.filter(data => !(isNaN(data.x as number) || isNaN(data.y as number) || data.y === 0));
    }
  }

  setAnnotations(compElt: ComprisonArrayElt) {
    return compElt.annotation ? [compElt.annotation()] : [];
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

  createChartlyDset(datas: any[], type: string, labels: string[]): ScatterValueArray[] {
    return datas.map((_data, i) => {
      return {
        data: this.filterNans(_data, type),
        label: labels[i],
        pointStyle: this.pointStyles[i],
        backgroundColor: i < this.backgroundcolors.length ? this.backgroundcolors[i] : 'rgba(0,0,0,0.3)',
        borderColor: this.bordercolors[i],
        radius: 4,
        pointHoverRadius: 10,
        borderWidth: this.borderWidth[i],
        hitRadius: 10,
      } as ScatterValueArray
    })
  }
  
 createNewLegendAndAttach(chartInstance, legendOpts) {
    const legend = new Chart.NewLegend({
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

  // Utility
  getMatlabDateYesterday() {
    return this.dateTimeService.getMatlabDateYesterday();
  }
  getMatlabDateLastMonth() {
    return this.dateTimeService.getMatlabDateLastMonth();
  }
  getJSDateYesterdayYMD() {
    return this.dateTimeService.getJSDateYesterdayYMD();
  }
  getJSDateLastMonthYMD() {
    return this.dateTimeService.getJSDateLastMonthYMD();
  }
  MatlabDateToJSDateYMD(serial) {
    return this.dateTimeService.MatlabDateToJSDateYMD(serial);
  }
  unixEpochtoMatlabDate(epochDate) {
    return this.dateTimeService.unixEpochtoMatlabDate(epochDate);
  }
  MatlabDateToUnixEpochViaDate(serial) {
    return this.dateTimeService.MatlabDateToUnixEpochViaDate(serial);
  }
  parseScatterDate(t: number) {
    return new Date(this.MatlabDateToUnixEpochViaDate(t).getTime())
  }
}

type SingleAxisType = 'hidden' | 'date' | 'numeric' | 'label'
interface axisType {
  x: SingleAxisType,
  y: SingleAxisType,
}

interface ScatterArguments {
  axisType: {x: string, y: string};
  graphIndex: number;
  datasets: ScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins ?: number[];
}

interface ScatterValueArray {
  data: ScatterDataElt[];
  label: string;
  pointStyle: string;
  backgroundColor: string;
  borderColor: string;
  radius: number;
  pointHoverRadius: number;
  borderWidth: number;
  hitRadius: number;
  showInLegend?: boolean;
}

interface ScatterDataElt {
  x: number|Date;
  y: number|Date;
  key?: string;
  callback?: Function;
}