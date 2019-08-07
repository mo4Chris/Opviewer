import { Component, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../common.service';


import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';

// @Component({
//   selector: 'app-scatterplot',
  // templateUrl: './scatterplot.component.html',
  // styleUrls: ['./scatterplot.component.scss']
// })
export class ScatterplotComponent {
  scatterData;
  scatterDataArray = [];
  scatterDataArrayVessel = [];
  comparisonArray

  backgroundcolors = [
    'rgba(255,0,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0, 255, 255 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255,255,0,1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,0.4)'
  ];
  bordercolors = [
    'rgba(255,0,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0, 255, 255 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,99,132,1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255,255,0,1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,1)'
  ];
  pointStyles = [
    'circle',
    'cross',
    'rect',
    'triangle',
    'crossRot',
    'star',
    'RectRounded',
    'dash',
  ];


  constructor(
    private vesselObject,
    private newService: CommonService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public router: Router,
    private userService: UserService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService
    ) {}

  labelValues = [];
  myChart = [];
  showContent = false;
  datasetValues = [];
  varAnn = { annotations: [] };
  defaultVesselName = '';
  graphXLabels = { scales: {} };
  // tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public scatterChartLegend = false;


  graphData = [];




  // getGraphDataPerComparison() {
    // for (let _i = 0; _i < this.comparisonArray.length; _i++) {
    //   this.newService.getTransfersForVesselByRange({
    //     'mmsi': this.vesselObject.mmsi, 
    //     'dateMin': this.vesselObject.dateMin, 
    //     'dateMax': this.vesselObject.dateMax, 
    //     x: this.comparisonArray[_i].x, 
    //     y: this.comparisonArray[_i].y 
    //   }).pipe(
  //       map(
  //         (scatterData) => {
  //           this.graphData[_i] = scatterData;
  //         }), catchError(error => {
  //           console.log('error: ' + error);
  //           throw error;
  //         })).subscribe();
  //   }
  //   setTimeout(() => this.setScatterPointsVessel(), 1000);
  // }


  setScatterPointsVessel() {
    const scatterDataArray = [];
    this.labelValues = [];
    for (let _i = 0; _i < this.graphData.length; _i++) {
      for (let _j = 0; _j < this.graphData[_i].length; _j++) {
        if (this.graphData[_i][_j].label !== undefined && this.graphData[_i][_j].label[0]) {
          this.labelValues[_j] = this.graphData[_i][_j].label[0].replace('_', ' ');
        } else {
          setTimeout(() => {this.labelValues[_j] = this.graphData[_i][_j].label[0].replace('_', ' ');}, 1000);
        }
        // ToDo: this parsing needs to happen upstream
        // switch (this.comparisonArray[_i].y) {
        //   case 'score':
        //     this.graphData[_i][_j] = this.calculateScoreData(this.graphData[_i][_j]);
        //     break;
        //   case 'impactForceNmax':
        //     this.graphData[_i][_j] = this.calculateImpactData(this.graphData[_i][_j]);
        //     break;
        // }

        // switch (this.comparisonArray[_i].x) {
        //   case 'startTime':
        //     this.graphData[_i][_j] = this.createTimeLabels(this.graphData[_i][_j]);
        //     break;
        // }
        scatterDataArray[_i] = this.graphData[_i];
      }
    }
    this.scatterDataArrayVessel = scatterDataArray;
    this.createValues();

    setTimeout(() => this.showContent = true, 0);
  }

  createTimeLabels(scatterData) {
    const obj = [];
    for (let _i = 0, arr_i = 0; _i < scatterData.length; _i++) {
      if (scatterData[_i].x !== null && typeof scatterData[_i].x !== 'object') {
        obj[arr_i] = {
          'x': this.MatlabDateToUnixEpochViaDate(scatterData[_i].x),
          'y': scatterData[_i].y
        };
        arr_i++;
      }
    }
    return obj;
  }


  onDropdownClose() {
    console.log('closed');
  }

  createScatterChart() {
    const dateService = this.dateTimeService;
    for (let _j = 0; _j < this.comparisonArray.length; _j++) {
      if (this.scatterDataArrayVessel[_j] && this.scatterDataArrayVessel[_j].length > 0) {
        this.myChart[_j] = new Chart('canvas' + _j, {
          type: this.comparisonArray[_j].graph,
          data: {
            datasets: this.datasetValues[_j]
          },
          options: {
            tooltips: {
              callbacks: {
                beforeLabel: function (tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label;
                },
                label: function (tooltipItem, data) {
                  return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                },
                afterLabel: function(tooltipItem, data) {
                  return 'Value: ' + Math.round(tooltipItem.yLabel * 100) / 100;
                }
              }
            },
            scaleShowVerticalLines: false,
            responsive: true,
            radius: 2,
            legend: {
              display: true,
              labels: {
                defaultFontSize: 24,
                defaultFontStyle: 'bold'
              }
            },
            pointHoverRadius: 2,
            animation: {
              duration: 0,
            },
            hover: {
              animationDuration: 0,
            },
            responsiveAnimationDuration: 0,
            scales: {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.comparisonArray[_j].xLabel
                },
                type: 'time',
                time: {
                  min: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMin).getTime()),
                  max: new Date(this.MatlabDateToUnixEpochViaDate(this.vesselObject.dateMax + 1).getTime()),
                  unit: 'day'
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.comparisonArray[_j].yLabel
                }
              }]
            },
            annotation: this.varAnn,
          },
          plugins: [
            {
              beforeInit: function (chartInstance) {
                const legendOpts = chartInstance.options.legend;
                if (legendOpts) {
                  createNewLegendAndAttach(chartInstance, legendOpts);
                }
              },
              beforeUpdate: function (chartInstance) {
                let legendOpts = chartInstance.options.legend;

                if (legendOpts) {
                  legendOpts = Chart.helpers.configMerge(Chart.defaults.global.legend, legendOpts);

                  if (chartInstance.newLegend) {
                    chartInstance.newLegend.options = legendOpts;
                  } else {
                    createNewLegendAndAttach(chartInstance, legendOpts);
                  }
                } else {
                  Chart.layoutService.removeBox(chartInstance, chartInstance.newLegend);
                  delete chartInstance.newLegend;
                }
              },
              afterEvent: function (chartInstance, e) {
                const legend = chartInstance.newLegend;
                if (legend) {
                  legend.handleEvent(e);
                }
              }
            }
          ],
        });
      }
    }
  }

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

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe(params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  getVesselNameFromParameter() {
    let vesselName;
    this.route.params.subscribe(params => vesselName = params.vesselName);
    return vesselName;
  }


  MatlabDateToUnixEpochViaDate(serial) {
    return this.dateTimeService.MatlabDateToUnixEpochViaDate(serial);
  }


  createValues() {
    this.datasetValues = [];
    for (let j = 0; j < this.scatterDataArrayVessel.length; j++) {
      this.datasetValues[j] = [];
      for (let i = 0; i < this.scatterDataArrayVessel[j].length; i++) {
        this.datasetValues[j].push({
          data: this.scatterDataArrayVessel[j][i],
          label: this.labelValues[i],
          pointStyle: this.pointStyles[i],
          backgroundColor: this.backgroundcolors[i],
          radius: 6,
          borderColor: this.bordercolors[i],
          pointHoverRadius: 10,
          borderWidth: 1,
          hitRadius: 10,
        });
      }
    }
    if (this.myChart[0] == null) {
      this.createScatterChart();
    } else {
      if (this.scatterDataArrayVessel[0].length <= 0) {
        for (let j = 0; j < this.scatterDataArrayVessel.length; j++) {
          this.myChart[j].destroy();
        }
      } else {
        for (let j = 0; j < this.scatterDataArrayVessel.length; j++) {
          this.myChart[j].destroy();
        }
        this.createScatterChart();
     }
   }
  setTimeout(() => this.showContent = true, 0);
}
}

Chart.NewLegend = Chart.Legend.extend({
  afterFit: function () {
    this.height = this.height + 10;
  },
});

function createNewLegendAndAttach(chartInstance, legendOpts) {
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
