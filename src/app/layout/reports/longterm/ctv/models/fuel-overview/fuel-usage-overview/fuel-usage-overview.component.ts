import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Chart from 'chart.js';
import { LongtermColorScheme } from '../../../../models/color_scheme';
import { LongtermProcessingService } from '../../../../models/longterm-processing-service.service';

@Component({
  selector: 'app-fuel-usage-overview',
  templateUrl: './fuel-usage-overview.component.html',
  styleUrls: ['./fuel-usage-overview.component.scss']
})
export class FuelUsageOverviewComponent implements OnChanges {

  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    private parser: LongtermProcessingService,
    private calcService: CalculationService,
    ) {}


  @Input() retrievedData;
  vesselName = '';
  chart: Chart;
  private backgroundcolors = LongtermColorScheme.backgroundColors;
  noData = true;

  info = `Fuel consumption for each day in the selected period.
  When engine and fuel stats are monitored this will be used as a default value. 
  This value can be overwritten manually by the vesselmaster. 
  The manually inputted value is leading of the automatically retrieved value`;

  ngOnChanges(): void {
    if (this.chart) {
      this.reset();
    }
    this.processDataForGraph(this.retrievedData);
  }

  processDataForGraph(rawData) {
    const dataset = [];
    if (rawData.input !== undefined || rawData.engines !== undefined) {
      this.noData = false;
      rawData.input.forEach((vesselDataset, index) => {
        const datasetSet = {
          label: '',
          data: [],
          borderColor: this.backgroundcolors[index],
          backgroundColor: this.backgroundcolors[index]
        };

        datasetSet.label = vesselDataset.label[0];
        for (let _index = 0; _index < vesselDataset.date.length; _index++) {
          const xyDataset = {
            x: new Date,
            y: 0
          };
          xyDataset.x = this.parser.parseScatterDate(vesselDataset.date[_index]);
          xyDataset.y = this.getFuelValue(vesselDataset, rawData?.engines[index]?.fuelUsedTotalM3[_index], _index) ?? 0;

          if (xyDataset.y !== 0) {
            datasetSet.data.push(xyDataset);
          }
        }
        dataset.push(datasetSet);
      });
    } else {
      this.noData = true;
    }


    this.createGraph(dataset);
  }

  createGraph(dataset) {

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'scatter',
      data: {datasets: dataset},
      options: {
        title: {
            display: true,
            text: 'Fuel consumption per sailing day',
            fontSize: 20,
            position: 'top'
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        time: {
          unit: 'day'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString:  'Time'
            },
            type: 'time'
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Fuel usage'
            },
          }]
        },
    }
    });
    this.chart.update();
  }

  private isInvalidData(data) {
    if (data == undefined) {
      return true;
    }
    return ['_ArrayType_'].some((key: string) => {
      if (data[key]) {
        return true;
      } else {
        return false;
      }
    });
  }

  reset() {
    this.chart.destroy();
  }

  private getFuelValue(dprs, engines, i : number) {
    if (dprs?.inputStats[i]?.fuelConsumption > 0) {
      return dprs?.inputStats[i]?.fuelConsumption;
    } else if (!this.isInvalidData(engines) && typeof engines === 'number' && engines > 0) {
      return this.calcService.switchUnits(engines || 0, 'm3', 'liter');
    }
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
