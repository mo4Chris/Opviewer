import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as moment from 'moment';
import {ActivatedRoute} from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';

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
    'rgba(54, 162, 235, 0.4)',
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
    'rgba(54, 162, 235, 1)',
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

  constructor(private newService: CommonService, private route: ActivatedRoute) { }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().month() + 1), day: moment().add(-1, 'days').date()};
  vesselObject = {'date': this.getMatlabDateYesterday(), 'mmsi' : this.getMMSIFromParameter(), 'dateNormal': this.getJSDateYesterdayYMD()};

  datePickerValue = this.maxDate;
  Vessels;
  transferData;
  myChart;
  showContent = false ;
  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
  public scatterChartLegend = false;


  createScatterChart() {
    this.myChart = new Chart('canvas', {
      type: 'scatter',
      data: {
      datasets: [{
          data: this.scatterDataArrayVessel[0],
          backgroundColor: this.backgroundcolors,
          borderColor: this.bordercolors,
          radius: 8,
          pointHoverRadius: 10,
          borderWidth: 1
          }]
      },
      options: {
        scaleShowVerticalLines: false,
        legend: false,
        responsive: true,
        radius: 6,
        pointHoverRadius: 6,
        scales : {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Time'
            },
            type: 'time',
            time: {
              min: this.MatlabDateToUnixEpoch(this.vesselObject.date),
              max: this.MatlabDateToUnixEpoch(this.vesselObject.date + 1),
              unit: 'hour'
          }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Impact force [kN]'
            }
          }]
        }
      }
    });
  }

  getDecodedAccessToken(token: string): any {
    try {
        return jwt_decode(token);
    } catch (Error) {
        return null;
    }
  }

  getMatlabDateYesterday() {
    const matlabValueYesterday = moment().add(-2, 'days');
    matlabValueYesterday.utcOffset(0).set({hour: 0, minute: 0, second: 0, millisecond: 0});
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab =  this.unixEpochtoMatlabDate(momentDateAsIso);
    return dateAsMatlab;
  }

  getJSDateYesterdayYMD() {
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).set({hour: 0, minute: 0, second: 0, millisecond: 0}).format('YYYY-MM-DD');
    return JSValueYesterday;
  }
  MatlabDateToJSDateYMD(serial) {
    const datevar = moment((serial - 719529) * 864e5).format('YYYY-MM-DD');
    return datevar;
  }

  unixEpochtoMatlabDate(epochDate) {
    const matlabTime = ((epochDate / 864e2) + 719530);
    return matlabTime;
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe( params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  ngOnInit() {
    if (this.tokenInfo.userPermission === 'admin') {
      this.newService.GetVessel().subscribe(data => this.Vessels = data);
    } else {
        this.newService.GetVesselsForCompany([{client: this.tokenInfo.userCompany}]).subscribe(data => this.Vessels = data);
    }
    setTimeout(() => this.showContent = true, 1000);
    this.setScatterPointsVessel().subscribe();
  }

  MatlabDateToUnixEpoch(serial) {
    const time_info  = moment((serial - 719529) * 864e5);
    return time_info;
  }

  searchTransfersByNewSpecificDate() {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({hour: 0, minute: 0, second: 0, millisecond: 0});
    datepickerValueAsMomentDate.format();
    const momentDateAsIso = moment(datepickerValueAsMomentDate).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.MatlabDateToJSDateYMD(dateAsMatlab);
    this.BuildPageWithCurrentInformation();
  }

  GetTransfersForVessel(vessel) {
     return this.newService
     .GetTransfersForVessel(vessel)
     .map(
       (transfers) => {
         this.transferData = transfers;
       })
      .catch((error) => {
         console.log('error ' + error);
         throw error;
       });
   }

  BuildPageWithCurrentInformation() {
    this.GetTransfersForVessel(this.vesselObject).subscribe(_ => {
      this.setScatterPointsVessel().subscribe();
      setTimeout(() => this.showContent = true, 1050);
      this.myChart.update();
    });
  }

  setScatterPointsVessel() {
    return this.newService
    .GetTransfersForVessel({'mmsi': this.vesselObject.mmsi, 'date': this.vesselObject.date})
    .map(
      (scatterData) => {
        const obj = [];
        for (let _i = 0, arr_i = 0; _i < scatterData.length; _i++) {
          if (scatterData[_i].impactForceNmax !== null && typeof scatterData[_i].impactForceNmax !== 'object') {
            obj[arr_i] = {
              'x' : this.MatlabDateToUnixEpoch(scatterData[_i].startTime),
              'y' : (scatterData[_i].impactForceNmax / 1000)
            };
            arr_i++;
          }
        }
        this.scatterDataArrayVessel[0] = (obj);
        console.log(this.vesselObject.date);
        if (this.myChart == null) {
          this.createScatterChart();
        } else {
          if (this.scatterDataArrayVessel[0].length <= 0) {
            this.myChart.destroy();
          } else {
            this.myChart.destroy();
            this.createScatterChart();
          }
        }
        setTimeout(() => this.showContent = true, 0);
      })
    .catch((error) => {
        console.log('error ' + error);
        throw error;
      });
  }
}
