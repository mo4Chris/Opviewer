import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Chart from 'chart.js';
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
    private calcService: CalculationService,
    ){}


  @Input() retrievedData;   
  vesselName = '';
  chart: Chart;
  noData = true;
  private backgroundcolors = LongtermColorScheme.backgroundColors;

  ngOnChanges(): void {
    if (this.chart) {
      this.reset();
    }

    this.processDataForGraph(this.retrievedData);
  }

  processDataForGraph(rawData) {
    let dataset = [];
    if(rawData !== undefined) {
      rawData.forEach((vesselDataset, index) => {
        const datasetSet = {
          label: '',
          data: [],
          borderColor: this.backgroundcolors[index],
          backgroundColor: this.backgroundcolors[index]
        };

        datasetSet.label = vesselDataset.label[0];
        for (let index = 0; index < vesselDataset.date.length; index++) {
          const xyDataset = {
          };
          const fuelUsed =  this.getFuelValue(vesselDataset, index) ?? 0;
          const distSailed = this.getDistanceSailed(vesselDataset, index) ?? 0;

          xyDataset.x = this.parser.parseScatterDate(vesselDataset.date[index]) ;
          xyDataset.y = fuelUsed / distSailed ?? 0;

          if (xyDataset.y > 0 && xyDataset.y !== NaN){
            datasetSet.data.push(xyDataset);
          }
        }
        if(datasetSet.data.length > 0){
          dataset.push(datasetSet);
        }
      });
    }
    console.log(dataset.length);
    if (dataset.length > 0) {
      this.noData = false;
      this.createGraph(dataset);
    } else { 
      this.noData = true;
    }
   
  }

  createGraph(dataset) {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'scatter',
      data: {datasets: dataset},
      options: {
        title: {
            display: true,
            text: 'Daily fuel average per nautical mile',
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

  private getDistanceSailed(dprs, i : number) {
   return dprs?.DPRstats[i]?.sailedDistance;
  }

  private getFuelValue(dprs, i : number) {
    if (dprs?.inputStats[i]?.fuelConsumption > 0) {
      return dprs?.inputStats[i]?.fuelConsumption;
    } else if (dprs?.DPRstats[i]?.TotalFuel !== "n/a") {
      return dprs?.DPRstats[i]?.TotalFuel;
    } else {
      return null;
    }
  }

}

interface DatasetModel {
    label: String,
    data: Object[]
}

interface RawGeneralModel {
  dayNum: number;
  mmsi: number;
  vesselName: string;
}
