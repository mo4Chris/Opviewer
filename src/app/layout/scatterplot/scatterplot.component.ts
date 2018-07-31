import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss']
})
export class ScatterplotComponent implements OnInit {
  
  scatterData;
  scatterDataArray = [];

  backgroundcolors = [
    'rgba(255, 99, 132, 0.4)',
    'rgba(54, 162, 235, 0.4)',
    'rgba(255, 206, 86, 0.4)',
    'rgba(75, 192, 192, 0.4)',
    'rgba(153, 102, 255, 0.4)',
    'rgba(0,0,0,0.4)',
    'rgba(255, 159, 64, 0.4)',
    'rgba(255,255,0,0.4)',
    'rgba(255,0,255,0.4)',
    'rgba(0,255,255,0.4)'
  ];
  bordercolors =  [
    'rgba(255,99,132,1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,255,0,1)',
    'rgba(255,0,255,1)',
    'rgba(0,255,255,1)',
  ];

  constructor(private newService: CommonService) { }
  public showContent: boolean = false;
  ngOnInit() {
    //minimal timeout has to be 38ms to work. 150ms has been set just to be sure
    setTimeout(()=>this.showContent=true, 150);
    this.setScatterPoints().subscribe();
  }

  // scatter chart
  public scatterChartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true
  };

  public scatterChartType: string = 'scatter';
  public scatterChartLegend: boolean = true;

  setScatterPoints(){
    return this.newService
    .GetScatter("test")
    .map(
      (scatterData) => {
        for (var _i = 0; _i < scatterData.length; _i++) {
          var obj = {};
          obj['label'] = scatterData[_i].name;
          obj['data'] = scatterData[_i].data;
          obj['backgroundColor'] = this.backgroundcolors[_i];
          obj['borderColor'] = this.bordercolors[_i];
          obj['radius'] = 8;
          obj['pointHoverRadius'] = 10;
          this.scatterDataArray.push(obj);
        }
      })
    .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
  }
}
