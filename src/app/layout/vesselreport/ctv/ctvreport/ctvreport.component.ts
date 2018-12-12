import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, SimpleChange } from "@angular/core";
import { CommonService } from "../../../../common.service";
import { map, catchError } from "rxjs/operators";
import { DatetimeService } from "../../../../supportModules/datetime.service";
import * as jwt_decode from 'jwt-decode';

@Component({
    selector: "app-ctvreport",
    templateUrl: "./ctvreport.component.html",
    styleUrls: ["./ctvreport.component.scss"]
})
export class CtvreportComponent implements OnInit {
    @Output() overviewZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() detailZoomLvl: EventEmitter<number> = new EventEmitter<number>();

    @Output() boatLocationData: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() Locdata: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() longitude: EventEmitter<any> = new EventEmitter<any>();

    @Input() vesselObject; 
    @Input() tokenInfo;

    videoRequestPermission;
    videoRequestLoading = false;

    transferData;
    commentOptions = ['Transfer OK', 'Unassigned', 'Tied off',
    'Incident', 'Embarkation', 'Vessel2Vessel',
    'Too much wind for craning', 'Trial docking',
    'Transfer of PAX not possible', 'Other'];
    commentsChanged;
    changedCommentObj = { newComment: "", otherComment: "" };

    videoRequests;
    videoBudget;
    
    dateData;

    public showAlert = false;
    alert = { type: "", message: "" };
    timeout;

    constructor(private newService: CommonService, private dateTimeService: DatetimeService) {

    }

    ngOnInit() {
        this.videoRequestPermission = this.tokenInfo.userPermission == "admin" || this.tokenInfo.userPermission == "Logistics specialist"; 
        this.overviewZoomLvl.emit(10);
        this.detailZoomLvl.emit(11);

        this.BuildPageWithCurrentInformation();
    }

    BuildPageWithCurrentInformation() {
      this.getTransfersForVessel(this.vesselObject).subscribe(_ => {
          this.getComments(this.vesselObject).subscribe(_ => {
            this.newService.GetDistinctFieldnames({'mmsi' : this.vesselObject.mmsi, 'date' : this.vesselObject.date}).subscribe(data => {
                this.newService.GetSpecificPark({'park' : data}).subscribe(data => {
                if(data.length !== 0) {
                    var Locdata = data;
                    var latitude = parseFloat(data[0].lat[Math.floor(data[0].lat.length / 2)]);
                    var longitude = parseFloat(data[0].lon[Math.floor(data[0].lon.length / 2)]);
                    
                    this.Locdata.emit(Locdata);
                    this.latitude.emit(latitude);
                    this.longitude.emit(longitude);
                    }          
                });
                this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(data => {
                    var boatLocationData = data;

                    this.boatLocationData.emit(boatLocationData);
                });   
            });
            this.getVideoRequests(this.vesselObject).subscribe(_ => {
              this.newService.getVideoBudgetByMmsi({ mmsi: this.vesselObject.mmsi }).subscribe(data => {
                  if (data[0]) {
                      this.videoBudget = data[0];
                  } else {
                      this.videoBudget = { maxBudget: -1, currentBudget: -1 };
                  }
                this.matchCommentsWithTransfers();
              });
            });
          });
      });
    }

    getMatlabDateToJSTime(serial) {
        return this.dateTimeService.MatlabDateToJSTime(serial);
    }

    getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
        return this.dateTimeService.MatlabDateToJSTimeDifference(serialEnd, serialBegin);
    }

    getTransfersForVessel(vessel) {
        return this.newService.GetTransfersForVessel(vessel).pipe(
            map(transfers => {
                this.transferData = transfers;
            }),
            catchError(error => {
                console.log("error " + error);
                throw error;
            })
        );
    }

    getComments(vessel) {
        return this.newService.getCommentsForVessel(vessel).pipe(
            map(changed => {
                this.commentsChanged = changed;
            }),
            catchError(error => {
                console.log("error " + error);
                throw error;
            })
        );
    }

    getVideoRequests(vessel) {
        return this.newService.getVideoRequests(vessel).pipe(
            map(requests => {
                this.videoRequests = requests;
            }),
            catchError(error => {
                console.log("error " + error);
                throw error;
            })
        );
    }

    matchCommentsWithTransfers() {
        for (let i = 0; i < this.transferData.length; i++) {
            this.transferData[i].showCommentChanged = false;
            this.transferData[i].commentChanged = this.changedCommentObj;
            this.transferData[i].formChanged = false;
            this.transferData[
                i
            ].video_requested = this.matchVideoRequestWithTransfer(
                this.transferData[i]
            );
            for (let j = 0; j < this.commentsChanged.length; j++) {
                if (
                    this.transferData[i]._id ===
                    this.commentsChanged[j].idTransfer
                ) {
                    this.transferData[i].commentChanged = this.commentsChanged[
                        j
                    ];
                    this.transferData[i].comment = this.commentsChanged[
                        j
                    ].newComment;
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
            if (
                vid.status === "denied" ||
                vid.status === "delivered" ||
                vid.status === "pending collection"
            ) {
                vid.text =
                    vid.status[0].toUpperCase() +
                    vid.status.substr(1).toLowerCase();
                vid.status = vid.status.replace(" ", "_");
                vid.disabled = true;
            }
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else if (transfer.videoAvailable) {
            vid = { text: "Not requested", disabled: false };
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else {
            vid = { text: "Unavailable", disabled: true };
            return vid;
        }
    }

    checkVideoBudget(duration, vid) {
        if (!vid.active) {
            if (
                this.videoBudget.maxBudget >= 0 &&
                this.videoBudget.currentBudget >= 0
            ) {
                if (
                    this.videoBudget.maxBudget <=
                    this.videoBudget.currentBudget + duration
                ) {
                    vid.disabled = true;
                    if (
                        vid.status !== "denied" &&
                        vid.status !== "delivered" &&
                        vid.status !== "pending collection"
                    ) {
                        vid.text = "Not enough budget";
                    }
                }
            }
        }
        return vid;
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
                this.videoBudget.currentBudget +=
                    transferData.videoDurationMinutes;
            } else {
                transferData.video_requested.text = "Not requested";
                this.videoBudget.currentBudget -=
                    transferData.videoDurationMinutes;
            }
            transferData.maxBudget = this.videoBudget.maxBudget;
            transferData.currentBudget = this.videoBudget.currentBudget;
            this.newService
                .saveVideoRequest(transferData)
                .pipe(
                    map(res => {
                        this.alert.type = "success";
                        this.alert.message = res.data;
                        transferData.formChanged = false;
                    }),
                    catchError(error => {
                        this.alert.type = "danger";
                        this.alert.message = error;
                        throw error;
                    })
                )
                .subscribe(_ => {
                    this.getVideoRequests(this.vesselObject).subscribe(_ => {
                        for (let i = 0; i < this.transferData.length; i++) {
                            this.transferData[
                                i
                            ].video_requested = this.matchVideoRequestWithTransfer(
                                this.transferData[i]
                            );
                        }
                        this.videoRequestLoading = false;
                    });
                    this.newService
                        .getVideoBudgetByMmsi({ mmsi: this.vesselObject.mmsi })
                        .subscribe(data => (this.videoBudget = data[0]));
                    clearTimeout(this.timeout);
                    this.showAlert = true;
                    this.timeout = setTimeout(() => {
                        this.showAlert = false;
                    }, 7000);
                });
        }
    }

    saveComment(transferData) {
      if (transferData.comment !== "Other") {
          transferData.commentChanged.otherComment = "";
      }
      transferData.commentDate = Date.now();
      transferData.userID = this.tokenInfo.userID;
      this.newService
          .saveTransfer(transferData)
          .pipe(
              map(res => {
                  this.alert.type = "success";
                  this.alert.message = res.data;
                  transferData.formChanged = false;
              }),
              catchError(error => {
                  this.alert.type = "danger";
                  this.alert.message = error;
                  throw error;
              })
          )
          .subscribe(_ => {
              clearTimeout(this.timeout);
              this.showAlert = true;
              this.timeout = setTimeout(() => {
                  this.showAlert = false;
              }, 7000);
          });
  }

  getDecodedAccessToken(token: string): any {
    try {
        return jwt_decode(token);
    } catch (Error) {
        return null;
    }
  }
}
