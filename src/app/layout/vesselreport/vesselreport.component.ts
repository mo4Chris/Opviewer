import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as moment from 'moment';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})

export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private userService: UserService) {

  }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  outsideDays = 'collapsed';
  vesselObject = {'date': this.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.getJSDateYesterdayYMD() };

  transferData;
  parkNamesData;
  Locdata;
  boatLocationData;
  datePickerValue = this.maxDate;
  dateData;
  typeOfLat;
  vessels;
  videoRequests;
  videoBudget;
  general = {};
  XYvars = [];
  charts = [];

  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public showContent = false;
  public showAlert = false;
  public noPermissionForData = false;
  zoomlvl = 9;
  latitude;
  longitude;
  mapTypeId = 'roadmap';
  streetViewControl = false;
  commentOptions = ['Transfer OK', 'Unassigned', 'Tied off',
    'Incident', 'Embarkation', 'Vessel2Vessel',
    'Too much wind for craning', 'Trial docking',
    'Transfer of PAX not possible', 'Other'];
  commentsChanged;
  changedCommentObj = { 'newComment': '', 'otherComment': '' };
  alert = { type: '', message: '' };
  timeout;
  vessel;
  parkNotFound = false;
  noTransits = true;
  videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';
  RequestLoading = true;

  onChange(event): void {
    this.searchTransfersByNewSpecificDate();
  }

  hasSailed(date: NgbDateStruct) {
    return this.dateHasSailed(date);
  }

  dateHasSailed(date: NgbDateStruct): boolean {
    for (let i = 0; i < this.dateData.length; i++) {
      const day: number = this.dateData[i].day;
      const month: number = this.dateData[i].month;
      const year: number = this.dateData[i].year;
      // tslint:disable-next-line:triple-equals
      if (day == date.day && month == date.month && year == date.year) {
        return true;
      }
    }
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe(params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  MatlabDateToJSDate(serial) {
    const dateInt = moment((serial - 719529) * 864e5).format('DD-MM-YYYY');
    return dateInt;
  }

  MatlabDateToJSDateYMD(serial) {
    const datevar = moment((serial - 719529) * 864e5).format('YYYY-MM-DD');
    return datevar;
  }
  JSDateYMDToObjectDate(YMDDate) {
    YMDDate = YMDDate.split('-');
    const ObjectDate = { year: YMDDate[0], month: YMDDate[1], day: YMDDate[2] };
    return ObjectDate;
  }

  MatlabDateToJSTime(serial) {
    if (!serial) {
      return "n/a";
    }
    const time_info = moment((serial - 719529) * 864e5).format('HH:mm:ss');

    return time_info;
  }

  unixEpochtoMatlabDate(epochDate) {
    const matlabTime = ((epochDate / 864e2) + 719530);
    return matlabTime;
  }

  MatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    serialEnd = moment((serialEnd - 719529) * 864e5).startOf('second');
    serialBegin = moment((serialBegin - 719529) * 864e5).startOf('second');
    const difference = serialEnd.diff(serialBegin);

    return moment(difference).subtract(1, 'hours').format('HH:mm:ss');
  }

  getTransfersForVessel(vessel) {

    let isTransfering = false;
    const responseTimes = [];

    return this.newService
      .GetTransfersForVessel(vessel).pipe(
        map(
          (transfers) => {
            this.transferData = transfers;
            if (transfers !== 0) {
              this.XYvars = [];
              const XYTempvars = [];
              for (let i = 0; i < transfers.length; i++) {

                if (transfers[i].slipGraph !== undefined) {
                  XYTempvars.push([]);
                  responseTimes.push([]);
                  for (let _i = 0; _i < transfers[i].slipGraph.slipX.length; _i++) {

                    XYTempvars[i].push({ x: this.MatlabDateToUnixEpoch(transfers[i].slipGraph.slipX[_i]), y: transfers[i].slipGraph.slipY[_i] });

                    if (isTransfering === false && transfers[i].slipGraph.transferPossible[_i] === 1) {
                      responseTimes[i].push(_i);
                      isTransfering = true;
                    } else if (isTransfering === true && transfers[i].slipGraph.transferPossible[_i] === 0) {
                      responseTimes[i].push(_i);
                      isTransfering = false;
                    }
                  }
                }
              }

              for (let i = 0; i < transfers.length; i++) {
                this.XYvars.push([]);

                if ( responseTimes.length !== 0) {
                  for (let _i = 0, _j = -1; _i < responseTimes[i].length + 1; _i++, _j++) {
                    let pointColor;
                    pointColor = ((_i % 2 === 0) ? (pointColor = 'rgba(255, 0, 0, 0.4)') : (pointColor = 'rgba(0, 150, 0, 0.4)'));
                    const BorderColor = 'rgba(0, 0, 0, 0)';

                    this.XYvars[i].push({data: [], backgroundColor: pointColor, borderColor: BorderColor, pointHoverRadius: 0});
                    if (_i === 0) {
                      this.XYvars[i][_i].data = XYTempvars[i].slice(0, responseTimes[i][_i]);
                    } else if (_i === responseTimes.length) {
                      this.XYvars[i][_i].data = XYTempvars[i].slice(responseTimes[i][_i]);
                    } else {
                      this.XYvars[i][_i].data = XYTempvars[i].slice(responseTimes[i][_j], responseTimes[i][_i]);
                    }
                  }
                }
              }
            }
          }),
        catchError(error => {
          console.log('error ' + error);
          throw error;
        }));
  }
  // todo: set to datetime service after SOV report is merged
  MatlabDateToUnixEpoch(serial) {
    const time_info = moment((serial - 719529) * 864e5);
    return time_info;
  }

  getComments(vessel) {
    return this.newService.getCommentsForVessel(vessel).pipe(
      map(
        (changed) => {
          this.commentsChanged = changed;
        }),
      catchError(error => {
        console.log('error ' + error);
        throw error;
      }));

  }

  getVideoRequests(vessel) {
    return this.newService.getVideoRequests(vessel).pipe(
      map(
        (requests) => {
          this.videoRequests = requests;
        }),
      catchError(error => {
        console.log('error ' + error);
        throw error;
      }));

  }

  getDatesWithTransfers(date) {
    return this.newService
      .getDatesWithValues(date).pipe(
        map(
          (dates) => {
            for (let _i = 0; _i < dates.length; _i++) {
              dates[_i] = this.JSDateYMDToObjectDate(this.MatlabDateToJSDateYMD(dates[_i]));
            }
            this.dateData = dates;
          }),
        catchError(error => {
          console.log('error ' + error);
          throw error;
        }));
  }

  createSlipgraphs() {
    this.charts = [];
    if (this.transferData.length > 0 && this.transferData[0].slipGraph !== undefined && this.transferData[0].slipGraph.slipX.length > 0) {
      const array = [];
      for (let i = 0; i < this.transferData.length; i++) {
        const line = {
          type: 'line',
          data: {
            datasets: this.XYvars[i]
          },
          options: {
            scaleShowVerticalLines: false,
            legend: false,
            tooltips: false,
            responsive: true,
            elements: {

              point:
                { radius: 0 },
              line:
                { tension: 0 }
            },
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
                  labelString: 'Time'
                },
                type: 'time'
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Slip (m)'
                }
              }]
            },
            annotation: {
              annotations: [
                {
                  type: 'line',
                  drawTime: 'afterDatasetsDraw',
                  id: 'average',
                  mode: 'horizontal',
                  scaleID: 'y-axis-0',
                  value: this.transferData[0].slipGraph.slipLimit,
                  borderWidth: 2,
                  borderColor: 'red'
                }
              ]
            },
          },
        };
        array.push(line);
      }
      this.createCharts(array);
    }
  }

  createCharts(pieData) {
    for (let j = 0; j < pieData.length; j++) {
      const tempChart = new Chart('canvas' + j, pieData[j]);
      this.charts.push(tempChart);
    }
  }

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
  }


  ngOnInit() {
    Chart.pluginService.register(ChartAnnotation);
    if (this.tokenInfo.userPermission === 'admin') {
      this.newService.GetVessel().subscribe(data => this.vessels = data);
    } else {
      this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
        this.vessels = data;

      });
    }
    this.BuildPageWithCurrentInformation();
  }

  // TODO: make complient with the newly added usertypes
  BuildPageWithCurrentInformation() {
    this.noPermissionForData = false;
    this.RequestLoading = true;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.getTransfersForVessel(this.vesselObject).subscribe(_ => {
          this.getDatesWithTransfers(this.vesselObject).subscribe(__ => {
            this.getComments(this.vesselObject).subscribe(_ => {
              this.getVideoRequests(this.vesselObject).subscribe(_ => {
                this.newService.getVideoBudgetByMmsi({ mmsi: this.vesselObject.mmsi }).subscribe(data => {
                  if (data[0]) {
                    this.videoBudget = data[0];
                  } else {
                    this.videoBudget = { maxBudget: -1, currentBudget: -1 };
                  }
                  this.vessel = this.vessels.find(x => x.mmsi === this.vesselObject.mmsi);
                  this.matchCommentsWithTransfers();
                  this.getGeneralStats(); 
                });
              });
            });
          });
          if (this.transferData.length !== 0) {
            this.newService.GetDistinctFieldnames({ 'mmsi': this.transferData[0].mmsi, 'date': this.transferData[0].date }).subscribe(data => {
              this.newService.GetSpecificPark({ 'park': data }).subscribe(data => {
                if (data[0]) {
                  this.Locdata = data, this.latitude = parseFloat(data[0].lat[Math.floor(data[0].lat.length / 2)]), this.longitude = parseFloat(data[0].lon[Math.floor(data[0].lon.length / 2)]);
                  this.parkNotFound = false;
                } else {
                  this.parkNotFound = true;
                }
              });
            });
            this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);
          }
          setTimeout(() => this.showContent = true, 1050);

          // when chartinfo has been generated create slipgraphs. If previously slipgraphes have existed destroy them before creating new ones.
          if (this.charts.length <= 0) {
            setTimeout(() => this.createSlipgraphs(), 10);
          } else {
            if (typeof this.transferData[0].slipGraph.slipX !== 'undefined' && this.transferData[0].slipGraph.slipX.length > 0) {
                for (let i = 0; i < this.charts.length; i++) {
                  this.charts[i].destroy();
                }
                setTimeout(() => this.createSlipgraphs(), 10);
              } else {
                for (let i = 0; i < this.charts.length; i++) {
                  this.charts[i].destroy();
                }
            }
          }
        });
      } else {
        this.showContent = true;
        this.noPermissionForData = true;
      }
    });
    setTimeout(() => this.RequestLoading = false, 2500);
  }

  matchCommentsWithTransfers() {
    for (let i = 0; i < this.transferData.length; i++) {
      this.transferData[i].showCommentChanged = false;
      this.transferData[i].commentChanged = this.changedCommentObj;
      this.transferData[i].formChanged = false;
      this.transferData[i].video_requested = this.matchVideoRequestWithTransfer(this.transferData[i]);
      for (let j = 0; j < this.commentsChanged.length; j++) {
        if (this.transferData[i]._id === this.commentsChanged[j].idTransfer) {
          this.transferData[i].commentChanged = this.commentsChanged[j];
          this.transferData[i].comment = this.commentsChanged[j].newComment;
          this.transferData[i].showCommentChanged = true;
          this.commentsChanged.splice(j, 1);
        }
      }
    }
  }

  matchVideoRequestWithTransfer(transfer) {
    let vid;
    if (this.vessel.videobudget == "_NaN_" || this.vessel.videobudget == undefined) {
      vid = {disabled: true, text: 'Unavailable'};
      return vid;
    }
    if (!this.videoRequests) {
      vid = { text: 'Not requested', disabled: false };
      return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
    }
    vid = this.videoRequests.find(x => x.videoPath === transfer.videoPath);
    if (vid) {
      vid.disabled = false;
      vid.text = 'Not requested';
      if (vid.active) {
        vid.text = 'Requested';
      }
      if (vid.status === 'denied' || vid.status === 'delivered' || vid.status === 'pending collection') {
        vid.text = vid.status[0].toUpperCase() + vid.status.substr(1).toLowerCase();
        vid.status = vid.status.replace(' ', '_');
        vid.disabled = true;
      }
      return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
    } else
      if (transfer.videoAvailable) {
        vid = { text: 'Not requested', disabled: false };
        return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
      } else {
        vid = { text: 'Unavailable', disabled: true };
        return vid;
      }
  }

  checkVideoBudget(duration, vid) {
    if (!vid.active) {
      if (this.videoBudget.maxBudget >= 0 && this.videoBudget.currentBudget >= 0) {
        if (this.videoBudget.maxBudget <= this.videoBudget.currentBudget + duration) {
          vid.disabled = true;
          if (vid.status !== 'denied' && vid.status !== 'delivered' && vid.status !== 'pending collection') {
            vid.text = 'Not enough budget';
          }
        }
      }
    }
    return vid;
  }

  getMatlabDateYesterday() {
    const matlabValueYesterday = moment().add(-2, 'days');
    matlabValueYesterday.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();

    const momentDateAsIso = moment(matlabValueYesterday).unix();

    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);

    return dateAsMatlab;
  }

  getJSDateYesterdayYMD() {
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  searchTransfersByNewSpecificDate() {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    datepickerValueAsMomentDate.format();

    const momentDateAsIso = moment(datepickerValueAsMomentDate).unix();

    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);

    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.MatlabDateToJSDateYMD(dateAsMatlab);

    this.BuildPageWithCurrentInformation();
  }

  getGeneralStats() {
      this.newService.getGeneral(this.vesselObject).subscribe(general => {
          if (general.data.length > 0 && general.data[0].DPRstats) {
              this.general = general.data[0].DPRstats;
              this.noTransits = false;
          } else {
              this.general = {};
              this.noTransits = true;
          }
      });
  }

  saveComment(transferData) {
    if (transferData.comment !== 'Other') {
      transferData.commentChanged.otherComment = '';
    }
    transferData.commentDate = Date.now();
    transferData.userID = this.tokenInfo.userID;
    this.newService.saveTransfer(transferData).pipe(
      map(
        (res) => {
          this.alert.type = 'success';
          this.alert.message = res.data;
          transferData.formChanged = false;
        }
      ),
      catchError(error => {
        this.alert.type = 'danger';
        this.alert.message = error;
        throw error;
      })
    ).subscribe(_ => {
      clearTimeout(this.timeout);
      this.showAlert = true;
      this.timeout = setTimeout(() => {
        this.showAlert = false;
      }, 7000);
    });
  }

  setRequest(transferData) {
    if (transferData.videoAvailable && !this.RequestLoading) {
      this.RequestLoading = true;
      if(this.vessel.videobudget != "_NaN_") {
        this.videoBudget.maxbudget = this.vessel.videobudget;
      } else {
        this.videoBudget.maxBudget = 0;
      }
      if (this.videoBudget.currentBudget < 0) {
        this.videoBudget.currentBudget = 0;
      }
      if (this.vessel.videoResetDay != "_NaN_"){
        this.videoBudget.resetDate = this.vessel.videoResetDay;
      }
      if (transferData.video_requested.text === 'Not requested') {
        transferData.video_requested.text = 'Requested';
        this.videoBudget.currentBudget += transferData.videoDurationMinutes;
      } else {
        transferData.video_requested.text = 'Not requested';
        this.videoBudget.currentBudget -= transferData.videoDurationMinutes;
      }
      transferData.maxBudget = this.videoBudget.maxBudget;
      transferData.currentBudget = this.videoBudget.currentBudget;
      transferData.resetDate = this.videoBudget.resetDate;
      this.newService.saveVideoRequest(transferData).pipe(
        map(
          (res) => {
            this.alert.type = 'success';
            this.alert.message = res.data;
            transferData.formChanged = false;
          }
        ),
        catchError(error => {
          this.alert.type = 'danger';
          this.alert.message = error;
          throw error;
        })
      ).subscribe(_ => {
        this.getVideoRequests(this.vesselObject).subscribe(_ => {
          for (let i = 0; i < this.transferData.length; i++) {
            this.transferData[i].video_requested = this.matchVideoRequestWithTransfer(this.transferData[i]);
          }
          this.RequestLoading = false;
        });
        this.newService.getVideoBudgetByMmsi({ mmsi: this.vesselObject.mmsi }).subscribe(data => this.videoBudget = data[0]);
        clearTimeout(this.timeout);
        this.showAlert = true;
        this.timeout = setTimeout(() => {
          this.showAlert = false;
        }, 7000);
      });
    }
  }

  roundNumber(number, decimal = 10, addString = '') {
    if (typeof number === 'string' || number instanceof String) {
      return number;
    }
    if (!number) {
      return "n/a";
    }

    return (Math.round(number * decimal) / decimal) + addString;
  }
}
