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

  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true
};

public barChartType: string = 'scatter';
public barChartLegend: boolean = true;

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
        obj['radius'] = 6;
        obj['pointHoverRadius'] = 8;
        this.scatterDataArray.push(obj);
      }
    })
   .catch((error) => {
      console.log('error ' + error);
      throw error;
    });
}

public barChartData: any[] = [
    
    {
      radius: 8,
      label: 'Scatter Dataset',
      data: [{ x: -10, y: 0},  { x: 10, y: 5}],
      backgroundColor: this.backgroundcolors[1],
      borderColor: this.bordercolors[1]
    },
    {
      radius: 8,
      label: 'Scatter Dataset 2',
      data: [{ x: -8, y: 2}, { x: 5, y: 8}],
      backgroundColor: this.backgroundcolors[2],
      borderColor: this.bordercolors[2]
    },
    {
      radius: 8,
      label: 'Scatter Dataset 3',
      data: [{ x: -5, y: -1}, { x: -3, y: 3}],
      backgroundColor: this.backgroundcolors[3],
      borderColor: this.bordercolors[3]
    },
    {
      radius: 8,
      label: 'Scatter Dataset 4',
      data: [{ x: 0, y: 10}, { x: 9, y: 8}],
      backgroundColor: this.backgroundcolors[4],
      borderColor: this.bordercolors[4]
    },
    {
      radius: 8,
      label: 'Scatter Dataset 5',
      data: [{ x: 2, y: 5}, { x: 4, y: 4}],
      backgroundColor: this.backgroundcolors[5],
      borderColor: this.bordercolors[5]
    },
    {
      radius: 8,
      label: 'Scatter Dataset 6',
      data: [{ x: 1, y: 4}, { x: -4, y: 4}],
      backgroundColor: this.backgroundcolors[6],
      borderColor: this.bordercolors[6]
    }
];

// Doughnut
public doughnutChartLabels: string[] = [
    'Download Sales',
    'In-Store Sales',
    'Mail-Order Sales'
];
public doughnutChartData: number[] = [350, 450, 100];
public doughnutChartType: string = 'doughnut';

}
