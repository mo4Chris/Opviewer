import { Component, OnInit, Input } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { CalculationService } from '../../supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '../../supportModules/datetime.service';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})
export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private calculationService : CalculationService, private dateTimeService : DatetimeService) {

  }

  maxDate = {year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date()};
  outsideDays = 'collapsed';
  vesselObject = {'date': this.dateTimeService.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.dateTimeService.getJSDateYesterdayYMD(), 'vesselType': ''};

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

  tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
  public showContent = false;
  public showAlert = false;
  public noPermissionForData = false;
  
  overviewZoomlvl;
  detailZoomlvl;

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
  videoRequestPermission = this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist';
  videoRequestLoading = false;

  onChange(event): void {
    this.searchTransfersByNewSpecificDate();
  }

  getOverviewZoomLvl(childZoomLvl: number): void{
    this.overviewZoomlvl = childZoomLvl;
  }

  getDetailZoomLvl(childZoomLvl: number): void{
    this.detailZoomlvl = childZoomLvl;
  }

  hasSailed(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.dateData);
  }

  getMatlabDateToJSTime(serial) {
    return this.dateTimeService.MatlabDateToJSTime(serial);
  }
  
  getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    return this.dateTimeService.MatlabDateToJSTimeDifference(serialEnd, serialBegin);
  }

  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.MatlabDateToJSDate(serial);
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe( params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
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
            dates[_i] = this.dateTimeService.JSDateYMDToObjectDate(this.dateTimeService.MatlabDateToJSDateYMD(dates[_i]));
        }
          this.dateData = dates;
        }),
        catchError(error => {
          console.log('error ' + error);
          throw error;
        }));
  }

  objectToInt(objectvalue) {
    return this.calculationService.objectToInt(objectvalue);
  }

    ngOnInit() {
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
    this.newService.validatePermissionToViewData({mmsi: this.vesselObject.mmsi}).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselObject.vesselType = validatedValue[0].operationsClass;
        this.getTransfersForVessel(this.vesselObject).subscribe(_ => {
          this.getDatesWithTransfers(this.vesselObject).subscribe(_ => {
            this.getComments(this.vesselObject).subscribe(_ => {
              this.getVideoRequests(this.vesselObject).subscribe(_ => {
                this.newService.getVideoBudgetByMmsi({ mmsi: this.vesselObject.mmsi }).subscribe(data => {
                    if (data[0]) {
                        this.videoBudget = data[0];
                    } else {
                        this.videoBudget = { maxBudget: -1, currentBudget: -1 };
                    }
                  this.vessel = this.vessels.find(x => x.mmsi == this.vesselObject.mmsi);
                  this.matchCommentsWithTransfers();
                });
              });
            });
          });
          if (this.transferData.length !== 0) {
            this.newService.GetDistinctFieldnames({'mmsi' : this.transferData[0].mmsi, 'date' : this.transferData[0].date}).subscribe(data => {
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
        if (!this.videoRequests) {
            vid = { text: "Not requested", disabled: false };
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        }
        vid = this.videoRequests.find(x => x.videoPath === transfer.videoPath);
        if (vid) {
            vid.disabled = false;
            vid.text = "Not requested";
            if (vid.active) {
                vid.text = "Requested";
            }
            if (vid.status === "denied" || vid.status === "delivered" || vid.status === "pending collection") {
                vid.text = vid.status[0].toUpperCase() + vid.status.substr(1).toLowerCase();
                vid.status = vid.status.replace(' ', '_');
                vid.disabled = true;
            }
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else
        if (transfer.videoAvailable) {
            vid = { text: "Not requested", disabled: false };
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else {
            vid = { text: "Unavailable", disabled: true };
            return vid;
        }
    }

    checkVideoBudget(duration, vid) {
        if (!vid.active) {  
            if (this.videoBudget.maxBudget >= 0 && this.videoBudget.currentBudget>=0) {
                if (this.videoBudget.maxBudget <= this.videoBudget.currentBudget + duration) {
                    vid.disabled = true;
                    if (vid.status !== "denied" && vid.status !== "delivered" && vid.status !== "pending collection") {
                        vid.text = "Not enough budget";
                    }
                }
            }
        }
        return vid;
    }

  searchTransfersByNewSpecificDate() {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({hour: 0, minute: 0, second: 0, millisecond: 0});
    datepickerValueAsMomentDate.format();

    const momentDateAsIso = moment(datepickerValueAsMomentDate).unix();

    const dateAsMatlab = this.dateTimeService.unixEpochtoMatlabDate(momentDateAsIso);

    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

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

    setRequest(transferData) {
        if (transferData.videoAvailable && !this.videoRequestLoading) {
            this.videoRequestLoading = true;
            if (this.videoBudget.maxBudget < 0) {
                this.videoBudget.maxBudget = 100;
            }
            if (this.videoBudget.currentBudget < 0) {
                this.videoBudget.currentBudget = 0;
            }
            if (transferData.video_requested.text == "Not requested") {
                transferData.video_requested.text = "Requested";
                this.videoBudget.currentBudget += transferData.videoDurationMinutes;
            } else {
                transferData.video_requested.text = "Not requested";
                this.videoBudget.currentBudget -= transferData.videoDurationMinutes;
            }
            transferData.maxBudget = this.videoBudget.maxBudget;
            transferData.currentBudget = this.videoBudget.currentBudget;
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
                    this.videoRequestLoading = false;
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

}
