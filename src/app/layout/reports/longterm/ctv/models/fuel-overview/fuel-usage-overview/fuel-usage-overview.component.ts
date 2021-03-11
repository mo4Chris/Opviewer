import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
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
    ) {}


  @Input() retrievedData;
  vesselName = '';
  chart: Chart;
  private backgroundcolors = LongtermColorScheme.backgroundColors;

  ngOnChanges(): void {
    if (this.chart) {
      this.reset();
    }

    this.processDataForGraph(this.retrievedData);
  }

  processDataForGraph(rawData) {
    const dataset = [];
    if (rawData !== undefined) {
      rawData.forEach((vesselDataset, index) => {
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
          xyDataset.y = this.getFuelValue(vesselDataset, _index) ?? 0;

          if (xyDataset.y !== 0) {
            datasetSet.data.push(xyDataset);
          }
        }
        dataset.push(datasetSet);
      });
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

  reset() {
    this.chart.destroy();
  }

  private getFuelValue(dprs, i: number) {
    if (dprs?.inputStats[i]?.fuelConsumption > 0) {
      return dprs?.inputStats[i]?.fuelConsumption;
    } else if (dprs?.DPRstats[i]?.TotalFuel !== 'n/a') {
      return dprs?.DPRstats[i]?.TotalFuel;
    } else {
      return null;
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
