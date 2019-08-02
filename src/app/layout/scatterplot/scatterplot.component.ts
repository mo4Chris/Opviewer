import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';


import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss']
})
export class ScatterplotComponent implements OnInit {
  scatterData;
  scatterDataArray = [];
  scatterDataArrayVessel = [];
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  modalReference: NgbModalRef;

  backgroundcolors = [
    'rgba(255,255,0,0.4)',
    'rgba(255,0,255,0.4)',
    'rgba(0,255,255,0.4)',
    'rgba(228, 94, 157 , 0.4)',
    'rgba(255, 159, 64, 0.4)',
    'rgba(255, 99, 132, 0.4)',
    'rgba(255, 206, 86, 0.4)',
    'rgba(75, 192, 192, 0.4)',
    'rgba(153, 102, 255, 0.4)',
    'rgba(0,0,0,0.4)'
  ];
  bordercolors = [
    'rgba(255,255,0,1)',
    'rgba(255,0,255,1)',
    'rgba(0,255,255,1)',
    'rgba(228, 94, 157 , 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255,99,132,1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(0,0,0,1)'
  ];

  multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false
  };

  constructor(private newService: CommonService, private route: ActivatedRoute, private modalService: NgbModal, calendar: NgbCalendar, public router: Router, private userService: UserService) {
    this.fromDate = calendar.getPrev(calendar.getPrev(calendar.getToday(), 'd', 1), 'm', 1);
    this.toDate = calendar.getPrev(calendar.getToday(), 'd', 1);
  }

  maxDate = { year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  vesselObject = { 'dateMin': this.getMatlabDateLastMonth(), 'mmsi': [this.getMMSIFromParameter()], 'dateNormalMin': this.getJSDateLastMonthYMD(), 'dateMax': this.getMatlabDateYesterday(), 'dateNormalMax': this.getJSDateYesterdayYMD() };

  datePickerValue = this.maxDate;
  Vessels;
  transferData;
  labelValues = [];
  myChart = [];
  myDatepicker;
  showContent = false;
  datasetValues = [];
  varAnn = { annotations: [] };
  defaultVesselName = '';
  dropdownValues = [{ mmsi: this.getMMSIFromParameter(), nicename: this.getVesselNameFromParameter() }];
  graphXLabels = { scales: {} };
  noPermissionForData = false;
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public scatterChartLegend = false;

  comparisonArray = [
    { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores' },
    { x: 'startTime', y: 'impactForceNmax', graph: 'scatter', xLabel: 'Time', yLabel: 'Peak impact force [kN]' }
  ];

  graphData = [];

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered = (date: NgbDate) => this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  isInside = (date: NgbDate) => date.after(this.fromDate) && date.before(this.toDate);
  isRange = (date: NgbDate) => date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);

  openModal(content) {
    this.modalReference = this.modalService.open(content);
  }

  closeModal() {
    this.modalReference.close();
  }

  ngOnInit() {
    Chart.pluginService.register(ChartAnnotation);

    this.noPermissionForData = false;
    if (this.tokenInfo.userPermission === 'admin') {
      this.newService.getVessel().subscribe(data => this.Vessels = data);
    } else {
      this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => this.Vessels = data);
    }
    if (this.vesselObject.mmsi.length > 0) {
      this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
        if (validatedValue.length === 1) {
          this.getGraphDataPerComparison();
        } else {
          this.showContent = true;
          this.noPermissionForData = true;
        }
        setTimeout(() => this.showContent = true, 1000);
      });
    }
  }

  getGraphDataPerComparison() {
    for (let _i = 0; _i < this.comparisonArray.length; _i++) {
      this.newService.getTransfersForVesselByRange({ 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: this.comparisonArray[_i].x, y: this.comparisonArray[_i].y }).pipe(
        map(
          (scatterData) => {
            console.log(scatterData);
            this.graphData[_i] = scatterData;
          }), catchError(error => {
            console.log('error: ' + error);
            throw error;
          })).subscribe();
    }
    setTimeout(() => this.setScatterPointsVessel(), 600);
  }


  setScatterPointsVessel() {

    const scatterDataArray = [];
    this.labelValues = [];
    for (let _i = 0; _i < this.graphData.length; _i++) {
      for (let _j = 0; _j < this.graphData[_i].length; _j++) {
        this.labelValues[_j] = this.graphData[_i][_j].label[0];

        switch (this.comparisonArray[_i].y) {
          case 'score':
            this.graphData[_i][_j] = this.calculateScoreData(this.graphData[_i][_j]);
            break;
          case 'impactForceNmax':
            this.graphData[_i][_j] = this.calculateImpactData(this.graphData[_i][_j]);
            break;
        }

        switch (this.comparisonArray[_i].x) {
          case 'startTime':
            this.graphData[_i][_j] = this.createTimeLabels(this.graphData[_i][_j]);
            break;
        }
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
          'x': this.MatlabDateToUnixEpoch(scatterData[_i].x),
          'y': scatterData[_i].y
        };
        arr_i++;
      }
    }
    return obj;
  }

  calculateImpactData(scatterData) {
    const obj = [];
    for (let _i = 0, arr_i = 0; _i < scatterData.xVal.length; _i++) {
      if (scatterData.xVal[_i] !== null && typeof scatterData.xVal[_i] !== 'object') {
        obj[arr_i] = {
          'x': scatterData.xVal[_i],
          'y': (scatterData.yVal[_i] / 1000)
        };
        arr_i++;
      }
    }
    return obj;
  }

  calculateScoreData(scatterData) {
    const obj = [];
    for (let _i = 0, arr_i = 0; _i < scatterData.xVal.length; _i++) {
      if (scatterData.xVal[_i] !== null && typeof scatterData.xVal[_i] !== 'object') {
        obj[arr_i] = {
          'x': scatterData.xVal[_i],
          'y': scatterData.yVal[_i]
        };
        arr_i++;
      }
    }
    return obj;

  }

  createScatterChart() {
    for (let _j = 0; _j < this.comparisonArray.length; _j++) {
      if (this.scatterDataArrayVessel[_j] && this.scatterDataArrayVessel[_j].length > 0) {
        this.myChart[_j] = new Chart('canvas' + _j, {
          type: this.comparisonArray[_j].graph,
          data: {
            datasets: this.datasetValues[_j]
          },
          options: {
            scaleShowVerticalLines: false,
            responsive: true,
            radius: 6,
            legend: {
              display: true,
            },
            pointHoverRadius: 6,
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
                  min: new Date(this.MatlabDateToUnixEpoch(this.vesselObject.dateMin).getTime()),
                  max: new Date(this.MatlabDateToUnixEpoch(this.vesselObject.dateMax + 1).getTime()),
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
          }
        });
      }
    }
  }

  getMatlabDateYesterday() {
    const matlabValueYesterday = moment().add(-1, 'days');
    matlabValueYesterday.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    return dateAsMatlab;
  }

  getMatlabDateLastMonth() {
    const matlabValueYesterday = moment().add(-1, 'months');
    matlabValueYesterday.utcOffset(0).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    return dateAsMatlab;
  }


  getJSDateYesterdayYMD() {
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  getJSDateLastMonthYMD() {
    const JSValueYesterday = moment().add(-1, 'months').utcOffset(0).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD');
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
    this.route.params.subscribe(params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  getVesselNameFromParameter() {
    let vesselName;
    this.route.params.subscribe(params => vesselName = params.vesselName);
    return vesselName;
  }

  MatlabDateToUnixEpoch(serial) {
    const time_info = new Date((serial - 719529) * 864e5);
    return time_info;
  }

  searchTransfersByNewSpecificDate() {
    const minValueAsMomentDate = moment(this.fromDate.day + '-' + this.fromDate.month + '-' + this.fromDate.year, 'DD-MM-YYYY');
    const maxpickerValueAsMomentDate = moment(this.toDate.day + '-' + this.toDate.month + '-' + this.toDate.year, 'DD-MM-YYYY');

    minValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    minValueAsMomentDate.format();

    maxpickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    maxpickerValueAsMomentDate.format();

    const momentMinDateAsIso = moment(minValueAsMomentDate).unix();
    const dateMinAsMatlab = this.unixEpochtoMatlabDate(momentMinDateAsIso);

    const momentMaxDateAsIso = moment(maxpickerValueAsMomentDate).unix();
    const dateMaxAsMatlab = this.unixEpochtoMatlabDate(momentMaxDateAsIso);

    this.vesselObject.dateMin = dateMinAsMatlab;
    this.vesselObject.dateMax = dateMaxAsMatlab;

    this.vesselObject.dateNormalMin = this.MatlabDateToJSDateYMD(dateMinAsMatlab);
    this.vesselObject.dateNormalMax = this.MatlabDateToJSDateYMD(dateMaxAsMatlab);

    const mmsiArray = [];
    if (this.dropdownValues !== undefined && this.dropdownValues[0].mmsi !== []) {
      for (let _j = 0; _j < this.dropdownValues.length; _j++) {
        mmsiArray.push(this.dropdownValues[_j].mmsi);
      }
      this.vesselObject.mmsi = mmsiArray;
    }

    this.buildPageWithCurrentInformation();
  }

  getTransfersForVesselByRange(vessel) {
    for (let _i = 0; _i < this.comparisonArray.length; _i++) {
      return this.newService
        .getTransfersForVesselByRange({ 'mmsi': this.vesselObject.mmsi, 'dateMin': this.vesselObject.dateMin, 'dateMax': this.vesselObject.dateMax, x: this.comparisonArray[_i].x, y: this.comparisonArray[_i].y }).pipe(
          map(
            (transfers) => {
              this.transferData = transfers;
              for (let _j = 0; _j < this.transferData.length; _j++) {
                this.labelValues[_j].label = this.transferData[_j].label[0];
              }
            }),
          catchError(error => {
            console.log('error ' + error);
            throw error;
          }));
    }
  }

  buildPageWithCurrentInformation() {
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length !== 0 && validatedValue.length === this.vesselObject.mmsi.length) {

        this.newService.getTransfersForVesselByRange({ mmsi: this.vesselObject.mmsi, x: this.comparisonArray[0].x, y: this.comparisonArray[0].y, dateMin: this.vesselObject.dateMin, dateMax: this.vesselObject.dateMax }).subscribe(_ => {
          this.getGraphDataPerComparison();
          setTimeout(() => this.showContent = true, 1050);
        });
      } else {
        this.showContent = true;
        this.noPermissionForData = true;
      }
    });
  }

  createValues() {
    this.datasetValues = [];
    for (let j = 0; j < this.scatterDataArrayVessel.length; j++) {
      this.datasetValues[j] = [];
      for (let i = 0; i < this.scatterDataArrayVessel[j].length; i++) {
        this.datasetValues[j].push({
          data: this.scatterDataArrayVessel[j][i],
          label: this.labelValues[i],
          backgroundColor: this.backgroundcolors[i],
          borderColor: this.bordercolors[i],
          radius: 8,
          pointHoverRadius: 10,
          borderWidth: 1
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
