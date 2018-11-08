import { Component, OnInit, Input, Output } from '@angular/core';
import { CommonService } from '../../../../common.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Input() latitude;
  @Input() longitude;
  @Input() Locdata;
  @Input() boatLocationData;
  zoomLvl = 8;
  mapTypeId = 'roadmap';
  streetViewControl = false;

  chart;
  backgroundcolors = [
    'rgba(228, 94, 157 , 0.4)',
    'rgba(255, 99, 132, 0.4)',
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
    'rgba(228, 94, 157 , 1)',
    'rgba(255,99,132,1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,255,0,1)',
    'rgba(255,0,255,1)',
    'rgba(0,255,255,1)',
  ];

  constructor(private newService : CommonService, private calculationService : CalculationService) {

  }

  ngOnInit() {
    this.createOperationalPieChart();
    this.createworkActivityPieChart();
    this.createWOWandNoAccessPieChart();
    this.createWeatherLimitGraph();
  }

  createOperationalPieChart() {
    this.chart = new Chart('operationalPieChart', {
      type: 'pie',
      data: {
      datasets: [{
          data: [78, 10, 12],
          backgroundColor: this.backgroundcolors,
          borderColor: this.bordercolors,
          radius: 8,
          pointHoverRadius: 10,
          borderWidth: 1
          }],
          labels: [
            'Traveling', 'Approved', 'Docking'
          ]
      },
      options: {
        title: {
          display: true,
          position: 'top',
          text: 'Operational activity',
          fontSize: 25
        },
        responsive: true,
        radius: 6,
        pointHoverRadius: 6
      }
    });
  }

  createworkActivityPieChart() {
      this.chart = new Chart('workActivityPieChart', {
        type: 'pie',
        data: {
        datasets: [{
            data: [24, 43, 33],
            backgroundColor: this.backgroundcolors,
            borderColor: this.bordercolors,
            radius: 8,
            pointHoverRadius: 10,
            borderWidth: 1
            }],
            labels: [
              'Working', 'WOWeather', 'Non-access'
            ]
        },
        options: {
          title: {
            display: true,
            position: 'top',
            text: 'Work activity details',
            fontSize: 25
          },
          responsive: true,
          radius: 6,
          pointHoverRadius: 6
        }
      });
    }

    createWOWandNoAccessPieChart() {
      this.chart = new Chart('WOWandNoAccessPieChart', {
        type: 'pie',
        data: {
        datasets: [{
            data: [39, 6, 33, 18, 4],
            backgroundColor: this.backgroundcolors,
            borderColor: this.bordercolors,
            radius: 8,
            pointHoverRadius: 10,
            borderWidth: 1
            }],
            labels: [
              'Wave height', 'Wave period', 'Wind speed'
            ]
        },
        options: {
          title: {
            display: true,
            position: 'top',
            text: 'WOW and no access details',
            fontSize: 25
          },
          responsive: true,
          radius: 6,
          pointHoverRadius: 6
        }
      });
    }

    createWeatherLimitGraph() {
      this.chart = new Chart('weatherLimitGraph', {
        type: 'line',
        data: {
          labels: [1500,1600,1700,1750,1800,1850,1900],
          datasets: [{
            data: [54, 34, 65, 43, 78, 23, 45],
            label: 'test1',
            borderColor: "#3e95cd",
            fill: false,
            steppedLine: true
          },
          {
            data: [100, 24, 90, 80, 65, 12, 87],
            label: 'test2',
            borderColor: "#3cba9f",
            fill: false,
            steppedLine: true
          }
        ]
        },
        options: {
          title: {
            display: true,
            position: 'top',
            text: 'Docking #1',
            fontSize: 25
          },
        }
      });

      
    }

  objectToInt(objectvalue) {
    return this.calculationService.objectToInt(objectvalue);
  }
}
