import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { CalculationService } from "../../../../supportModules/calculation.service";
import * as Chart from "chart.js";
import * as annotation from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-sovreport',
  templateUrl: './sovreport.component.html',
  styleUrls: ['./sovreport.component.scss']
})
export class SovreportComponent implements OnInit {

  @Output() overviewZoomLvl : EventEmitter<number> = new EventEmitter<number>();
  @Output() detailZoomLvl : EventEmitter<number> = new EventEmitter<number>();

  mapTypeId = "roadmap";
  streetViewControl = false;

  chart;
  backgroundcolors = [
    "#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"
  ];

  constructor(private calculationService: CalculationService) {}

  ngOnInit() {
      this.overviewZoomLvl.emit(9);
      this.detailZoomLvl.emit(10);

      Chart.pluginService.register(annotation);
      this.createOperationalPieChart();
      this.createworkActivityPieChart();
      this.createWOWandNoAccessPieChart();
      this.createWeatherLimitDocking1Graph();
      this.createWeatherLimitDocking2Graph();
      this.createWeatherLimitDocking3Graph();
  }

  createOperationalPieChart() {
      this.chart = new Chart("operationalPieChart", {
          type: "pie",
          data: {
              datasets: [
                  {
                      data: [78, 10, 12],
                      backgroundColor: this.backgroundcolors,
                      radius: 8,
                      pointHoverRadius: 10,
                      borderWidth: 1
                  }
              ],
              labels: ["Traveling", "Approved", "Docking"]
          },
          options: {
              title: {
                  display: true,
                  position: "top",
                  text: "Operational activity",
                  fontSize: 25
              },
              responsive: true,
              radius: 6,
              pointHoverRadius: 6
          }
      });
  }

  createworkActivityPieChart() {
      this.chart = new Chart("workActivityPieChart", {
          type: "pie",
          data: {
              datasets: [
                  {
                      data: [24, 43, 33],
                      backgroundColor: this.backgroundcolors,
                      radius: 8,
                      pointHoverRadius: 10,
                      borderWidth: 1
                  }
              ],
              labels: ["Working", "WOWeather", "Non-access"]
          },
          options: {
              title: {
                  display: true,
                  position: "top",
                  text: "Work activity details",
                  fontSize: 25
              },
              responsive: true,
              radius: 6,
              pointHoverRadius: 6
          }
      });
  }

  createWOWandNoAccessPieChart() {
      this.chart = new Chart("WOWandNoAccessPieChart", {
          type: "pie",
          data: {
              datasets: [
                  {
                      data: [39, 6, 33, 18, 4],
                      backgroundColor: this.backgroundcolors,
                      radius: 8,
                      pointHoverRadius: 10,
                      borderWidth: 1
                  }
              ],
              labels: ["Wave height", "Wave period", "Wind speed", "Wave #4", "Wave #5"]
          },
          options: {
              title: {
                  display: true,
                  position: "top",
                  text: "WOW and no access details",
                  fontSize: 25
              },
              responsive: true,
              radius: 6,
              pointHoverRadius: 6
          }
      });
  }

  createWeatherLimitDocking1Graph() {
      this.chart = new Chart("weatherLimitDocking1Graph", {
          type: "line",
          data: {
              labels: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
              datasets: [
                  {
                      data: [80, 75, 5, 10, 5, 60, 60],
                      label: "Wind",
                      borderColor: "#3e95cd",
                      fill: false,
                      steppedLine: true
                  },
                  {
                      data: [100, 90, 25, 25, 10, 75, 80],
                      label: "DP",
                      borderColor: "#3cba9f",
                      fill: false,
                      steppedLine: true
                  }
              ]
          },
          options: {
              responsive: true,
              title: {
                  display: true,
                  position: "top",
                  text: "Docking #1",
                  fontSize: 25
              },
              annotation: {
                  annotations: [
                      {
                          type: "line",
                          drawTime: 'afterDatasetsDraw',
                          id: "average",
                          mode: "horizontal",
                          scaleID: "y-axis-0",
                          value: 30,
                          borderWidth: 2,
                          borderColor: "red"
                      },
                      {
                        type: "box",
                        drawTime: 'beforeDatasetsDraw',
                        id: "region",
                        xScaleID: "x-axis-0",
                        yScaleID: "y-axis-0",
                        xMin: '17:00',
                        xMax: '20:00',
                        backgroundColor: 'rgba(200,230,201,0.5)',
                    }   
                  ]
              },
              scales : {
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Time'
                  },
                }],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Utilasation %'
                  }
                }]
              }
          }
      });
  }

  createWeatherLimitDocking2Graph() {
    this.chart = new Chart("weatherLimitDocking2Graph", {
        type: "line",
        data: {
            labels: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
            datasets: [
                {
                    data: [80, 75, 5, 10, 5, 60, 60],
                    label: "Wind",
                    borderColor: "#3e95cd",
                    fill: false,
                    steppedLine: true
                },
                {
                    data: [100, 90, 25, 25, 10, 75, 80],
                    label: "DP",
                    borderColor: "#3cba9f",
                    fill: false,
                    steppedLine: true
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                position: "top",
                text: "Docking #2",
                fontSize: 25
            },
            annotation: {
                annotations: [
                    {
                        type: "line",
                        drawTime: 'afterDatasetsDraw',
                        id: "average",
                        mode: "horizontal",
                        scaleID: "y-axis-0",
                        value: 5,
                        borderWidth: 2,
                        borderColor: "red"
                    },
                    {
                      type: "box",
                      drawTime: 'beforeDatasetsDraw',
                      id: "region",
                      xScaleID: "x-axis-0",
                      yScaleID: "y-axis-0",
                      xMin: '16:00',
                      xMax: '19:00',
                      backgroundColor: 'rgba(200,230,201,0.5)',
                  }   
                ]
            },
            scales : {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Time'
                },
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Utilasation %'
                }
              }]
            }
        }
    });
}

createWeatherLimitDocking3Graph() {
  this.chart = new Chart("weatherLimitDocking3Graph", {
      type: "line",
      data: {
          labels: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
          datasets: [
              {
                  data: [80, 75, 5, 10, 5, 60, 60],
                  label: "Wind",
                  borderColor: "#3e95cd",
                  fill: false,
                  steppedLine: true
              },
              {
                  data: [100, 90, 25, 25, 10, 75, 80],
                  label: "DP",
                  borderColor: "#3cba9f",
                  fill: false,
                  steppedLine: true
              }
          ]
      },
      options: {
          responsive: true,
          title: {
              display: true,
              position: "top",
              text: "Docking #3",
              fontSize: 25
          },
          annotation: {
              annotations: [
                  {
                      type: "line",
                      drawTime: 'afterDatasetsDraw',
                      id: "average",
                      mode: "horizontal",
                      scaleID: "y-axis-0",
                      value: 50,
                      borderWidth: 2,
                      borderColor: "red"
                  },
                  {
                    type: "box",
                    drawTime: 'beforeDatasetsDraw',
                    id: "region",
                    xScaleID: "x-axis-0",
                    yScaleID: "y-axis-0",
                    xMin: '19:00',
                    xMax: '21:00',
                    backgroundColor: 'rgba(200,230,201,0.5)',
                }   
              ]
          },
          scales : {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Time'
              },
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Utilasation %'
              }
            }]
          }
      }
  });
}
}
