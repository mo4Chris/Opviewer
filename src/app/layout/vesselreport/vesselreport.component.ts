import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';


import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})
export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute) {

  }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().month() + 1), day: moment().add(-1, 'days').date()};
  vesselObject = {'date': this.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.getJSDateYesterdayYMD()};

  transferData;
  parkNamesData;
  Locdata;
  boatLocationData;
  datePickerValue = this.maxDate;
  dateData;
  typeOfLat;
  vessels;

  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
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
      '_NaN_', 'Too much wind for craning', 'Trial docking',
      'Transfer of PAX not possible', 'Other'];
  commentsChanged;
  changedCommentObj = { 'newComment': '', 'otherComment': '' };
  alert = { type: '', message: '' };
  timeout;

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe( params => mmsi = parseFloat(params.boatmmsi));

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
    const ObjectDate = {year: YMDDate[0], month: YMDDate[1] , day: YMDDate[2]};
    return ObjectDate;
  }

  MatlabDateToJSTime(serial) {
    const time_info  = moment((serial - 719529) * 864e5 ).format('HH:mm:ss');

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

  getDecodedAccessToken(token: string): any {
    try {
        return jwt_decode(token);
    } catch (Error) {
        return null;
    }
  }

  getTransfersForVessel(vessel) {
    return this.newService
    .GetTransfersForVessel(vessel).pipe(
    map(
      (transfers) => {
        this.transferData = transfers;
      }),
     catchError(error => {
        console.log('error ' + error);
        throw error;
      }));
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

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
  }

  ngOnInit() {
      this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
          this.vessels = data;
          this.BuildPageWithCurrentInformation();
      });
  }

  // TODO: make complient with the newly added usertypes
  BuildPageWithCurrentInformation() {
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({mmsi: this.vesselObject.mmsi}).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.getTransfersForVessel(this.vesselObject).subscribe(_ => {
          // tslint:disable-next-line:no-shadowed-variable
          this.getDatesWithTransfers(this.vesselObject).subscribe(_ => {
            // tslint:disable-next-line:no-shadowed-variable
            this.getComments(this.vesselObject).subscribe(_ => {
              this.matchCommentsWithTransfers();
            });
          });
          if (this.transferData.length !== 0) {
            this.newService.GetDistinctFieldnames({'mmsi' : this.transferData[0].mmsi, 'date' : this.transferData[0].date}).subscribe(data => {
              // tslint:disable-next-line:no-shadowed-variable
              this.newService.GetSpecificPark({'park' : data}).subscribe(data => {this.Locdata = data, this.latitude = parseFloat(data[0].lat[Math.floor(data[0].lat.length / 2)]), this.longitude = parseFloat(data[0].lon[Math.floor(data[0].lon.length / 2)]); } );
            });
            this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(data => this.boatLocationData = data);
          }
        setTimeout(() => this.showContent = true, 1050);
        });
      } else {
        this.showContent = true;
        this.noPermissionForData = true;
      }
    });
  }

  matchCommentsWithTransfers() {
    for (let i = 0; i < this.transferData.length; i++) {
      this.transferData[i].showCommentChanged = false;
      this.transferData[i].commentChanged = this.changedCommentObj;
      this.transferData[i].formChanged = false;
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

}
