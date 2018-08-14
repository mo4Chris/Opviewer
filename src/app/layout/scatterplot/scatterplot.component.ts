import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as moment from "moment";

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss']
})
export class ScatterplotComponent implements OnInit {
  
  scatterData;
  scatterDataArray = [];
  scatterDataArrayVessel = [];

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
    //minimal timeout has to be 38ms to work. 100ms has been set just to be sure
    setTimeout(()=>this.showContent=true, 1000);
    //this.setScatterPoints().subscribe();
    this.setScatterPointsVessel().subscribe();
    
  }

  // scatter chart
  public scatterChartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true,
    scales : {
      xAxes: [{
        type: 'time',
        distribution: 'series',
        time:{
          unit:'day'
       }
      }]
    } 
  };

  public scatterChartType: string = 'scatter';
  public scatterChartLegend: boolean = false;

  MatlabDateToUnixEpoch(serial) {
    var time_info  = moment((serial - 719529) * 864e5 );
    
    return time_info;
  }

  setScatterPointsVessel(){
    return this.newService
    .GetTransfersForVessel({"mmsi": 219770000, "date": 737271})
    .map(
      (scatterData) => {
        var obj = {};
        obj['data'] = [];
        for (var _i = 0; _i < scatterData.length; _i++) {
          if(scatterData[_i].impactForceNmax !== null){
            obj['data'][_i] = {
              "x" : this.MatlabDateToUnixEpoch(scatterData[_i].startTime),
              'y' : (scatterData[_i].impactForceNmax / 1000)
            }
          }
        }
        obj['radius'] = 8;
        obj['pointHoverRadius'] = 10;
        obj['borderColor'] = this.bordercolors[0];
        obj['backgroundColor'] = this.backgroundcolors[6];
        this.scatterDataArrayVessel.push(obj);
        setTimeout(()=>this.showContent=true, 0);
      })
    .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
  }

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
