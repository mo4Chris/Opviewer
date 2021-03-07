import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { LongtermColorScheme } from '../../../models/color_scheme';

@Component({
  selector: 'app-fuel-overview',
  templateUrl: './fuel-overview.component.html',
  styleUrls: ['./fuel-overview.component.scss']
})
export class FuelOverviewComponent implements OnChanges {
  
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    ){}

  @Input() vesselObject: { dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[], vesselname: string[] };
  @Input() vesselNames; 
  @Input() tokenInfo: TokenModel;
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  

  noData = true;
  RawData: RawGeneralModel[];
  vesselName = '';
  chart: Chart;
  private backgroundcolors = LongtermColorScheme.backgroundColors;
  
  ngOnChanges(): void {
    if (this.chart) {
      this.reset();
    }

    this.getDataForGraph();
  }

  getDataForGraph() { 
    this.newService.getCtvInputsByRange({
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: ['DPRstats', 'inputStats', 'date']
    }).subscribe((rawdata) => {

      if (rawdata.length > 0 && rawdata[0].date.length > 0) {
        this.processDataForGraph(rawdata);
      } else {
        this.noData = true;
      }
      //this.ref.detectChanges();
    });

  }

  processDataForGraph(rawData) {
    
    let dataset = [];
    console.log(dataset);

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
          x : '',
          y : 0
        };
        console.log(this.dateService.MatlabDateToJSDate( vesselDataset.date[index] ));
        xyDataset.x = this.dateService.MatlabDateToJSDate(vesselDataset.date[index]);
        xyDataset.y = this.getFuelValue(vesselDataset, index) ?? 0;

        if (xyDataset.y !== 0){
          datasetSet.data.push(xyDataset);
        }
      }
      dataset.push(datasetSet);
    });

    this.createGraph(dataset);
  }

  createGraph(dataset) {

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'scatter',
      data: {datasets: dataset},
      options: {
        title: {
            display: true,
            text: 'Vessel activity chart',
            fontSize: 20,
            position: 'top'
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
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
            // ticks: {
            //   min: this.dateService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin),
            //   max: this.dateService.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax + 1),
            //   maxTicksLimit: 21,
            // },
            gridLines: {
              display: false,
            }
          }],
          yAxes: [{
            id: 'y-axis-0',
            scaleLabel: {
              display: true,
              labelString: 'fuel consumption',
            },
            // ticks: {
            //   min: 0,
            //   max: 24,
            //   stepSize: 4,
            // }
          }],
        },
        annotation: {
            events: ['mouseover', 'mouseout', 'dblclick', 'click'],
        }
    }
    });
    console.log(this.chart);
    this.chart.update();
  }

  reset() {
    this.chart.destroy();
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
