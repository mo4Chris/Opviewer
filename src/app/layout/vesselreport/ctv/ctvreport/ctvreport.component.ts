import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, SimpleChange } from '@angular/core';
import { CommonService } from '../../../../common.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import * as jwt_decode from 'jwt-decode';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

@Component({
    selector: 'app-ctvreport',
    templateUrl: './ctvreport.component.html',
    styleUrls: ['./ctvreport.component.scss']
})
export class CtvreportComponent implements OnInit {
    @Output() mapZoomLvl: EventEmitter<number> = new EventEmitter<number>();
    @Output() boatLocationData: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() Locdata: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() longitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() sailDates: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() routeFound: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() parkFound: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    changedCommentObj = { newComment: '', otherComment: '' };

    videoRequests;
    videoBudget;
    noTransits;
    general = {};
    XYvars = [];
    charts = [];
    vessels;
    noPermissionForData;
    vessel;
    dateData;

    public showAlert = false;
    alert = { type: '', message: '' };
    timeout;

    constructor(private newService: CommonService, private calculationService: CalculationService, private dateTimeService: DatetimeService) {

    }

    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    BuildPageWithCurrentInformation() {
        this.noPermissionForData = false;
        this.videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';
        this.mapZoomLvl.emit(10);

        this.getDatesShipHasSailed(this.vesselObject).subscribe(data => {
            this.sailDates.emit(data);
        });

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
                                    // this.vessel = this.vessels.find(x => x.mmsi === this.vesselObject.mmsi);
                                    this.matchCommentsWithTransfers();
                                    this.getGeneralStats();
                                });
                            });
                        });
                    });
                    if (this.transferData.length !== 0) {
                        this.newService.GetDistinctFieldnames({ 'mmsi': this.transferData[0].mmsi, 'date': this.transferData[0].date }).subscribe(data => {
                            this.newService.GetSpecificPark({ 'park': data }).subscribe(data => {
                                if (data.length > 0) {
                                    this.Locdata.emit(data),
                                        this.latitude.emit(parseFloat(data[0].lat[Math.floor(data[0].lat.length / 2)])),
                                        this.longitude.emit(parseFloat(data[0].lon[Math.floor(data[0].lon.length / 2)]));
                                    this.parkFound.emit(true);
                                } else {
                                    this.parkFound.emit(false);
                                }
                                this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(routeData => {
                                    if (routeData.length > 0) {
                                        const boatLocationData = routeData;
                                        this.boatLocationData.emit(boatLocationData);
                                        this.routeFound.emit(true);
                                        if (!this.parkFound) {
                                            this.latitude.emit(parseFloat(data[0].lat[Math.floor(routeData[0].lat.length / 2)])),
                                                this.longitude.emit(parseFloat(data[0].lon[Math.floor(routeData[0].lon.length / 2)]));
                                        }
                                    } else {
                                        this.routeFound.emit(false);
                                    }
                                });
                            });
                        });
                    }

                    // when chartinfo has been generated create slipgraphs. If previously slipgraphes have existed destroy them before creating new ones.
                    if (this.charts.length <= 0) {
                        setTimeout(() => this.createSlipgraphs(), 10);
                    } else {
                        if (typeof this.transferData[0] !== 'undefined' && typeof this.transferData[0].slipGraph !== 'undefined' && typeof this.transferData[0].slipGraph.slipX !== 'undefined' && this.transferData[0].slipGraph.slipX.length > 0) {
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
                this.showContent.emit(true);
            } else {
                this.showContent.emit(false);
                this.noPermissionForData = true;
            }
        });
        setTimeout(() => this.loaded.emit(true), 2000);
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

    getTransfersForVessel(vessel) {

        let isTransfering = false;
        const responseTimes = [];

        return this.newService.GetTransfersForVessel(this.vesselObject.mmsi, this.vesselObject.date).pipe(
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

                                    XYTempvars[i].push({ x: this.dateTimeService.MatlabDateToUnixEpoch(transfers[i].slipGraph.slipX[_i]), y: transfers[i].slipGraph.slipY[_i] });

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

                            if (responseTimes.length !== 0) {
                                for (let _i = 0, _j = -1; _i < responseTimes[i].length + 1; _i++ , _j++) {
                                    let pointColor;
                                    pointColor = ((_i % 2 === 0) ? (pointColor = 'rgba(255, 0, 0, 0.4)') : (pointColor = 'rgba(0, 150, 0, 0.4)'));
                                    const BorderColor = 'rgba(0, 0, 0, 0)';

                                    this.XYvars[i].push({ data: [], backgroundColor: pointColor, borderColor: BorderColor, pointHoverRadius: 0 });
                                    if (_i === 0) {
                                        this.XYvars[i][_i].data = XYTempvars[i].slice(0, responseTimes[i][_i]);
                                    } else if (_i === responseTimes[i].length) {
                                        this.XYvars[i][_i].data = XYTempvars[i].slice(responseTimes[i][_j]);
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


    createCharts(lineData) {
        for (let j = 0; j < lineData.length; j++) {
            const tempChart = new Chart('canvas' + j, lineData[j]);
            this.charts.push(tempChart);
        }
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

    getDatesShipHasSailed(date) {
        return this.newService.getDatesWithValues(date).pipe(map((dates) => {
            for (let _i = 0; _i < dates.length; _i++) {
                dates[_i] = this.dateTimeService.JSDateYMDToObjectDate(this.dateTimeService.MatlabDateToJSDateYMD(dates[_i]));
            }
            return dates;

        }),
            catchError(error => {
                console.log('error ' + error);
                throw error;
            }));
    }

    getMatlabDateToJSTime(serial) {
        return this.dateTimeService.MatlabDateToJSTime(serial);
    }

    roundNumber(number, decimal = 10, addString = '') {
        return this.calculationService.roundNumber(number, decimal = 10, addString = '');
    }

    getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
        return this.dateTimeService.MatlabDateToJSTimeDifference(serialEnd, serialBegin);
    }

    getComments(vessel) {
        return this.newService.getCommentsForVessel(vessel).pipe(
            map(changed => {
                this.commentsChanged = changed;
            }),
            catchError(error => {
                console.log('error ' + error);
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
                console.log('error ' + error);
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
                    this.transferData[i].commentChanged = this.commentsChanged[j];
                    this.transferData[i].comment = this.commentsChanged[j].newComment;
                    this.transferData[i].showCommentChanged = true;
                    this.commentsChanged.splice(j, 1);
                }
            }
        }
    }

    getGeneralStats() {
        this.newService.getGeneral(this.vesselObject).subscribe(general => {
            if (general.data.length > 0 && general.data[0].DPRstats) {
                this.noTransits = false;
                this.general = general.data[0].DPRstats;
            } else {
                this.noTransits = true;
                this.general = {};
            }
        });
    }

    matchVideoRequestWithTransfer(transfer) {
        let vid;
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
            if (
                vid.status === 'denied' ||
                vid.status === 'delivered' ||
                vid.status === 'pending collection'
            ) {
                vid.text = vid.status[0].toUpperCase() + vid.status.substr(1).toLowerCase();
                vid.status = vid.status.replace(' ', '_');
                vid.disabled = true;
            }
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else if (transfer.videoAvailable) {
            vid = { text: 'Not requested', disabled: false };
            return this.checkVideoBudget(transfer.videoDurationMinutes, vid);
        } else {
            vid = { text: 'Unavailable', disabled: true };
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
                        vid.status !== 'denied' &&
                        vid.status !== 'delivered' &&
                        vid.status !== 'pending collection'
                    ) {
                        vid.text = 'Not enough budget';
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
            if (transferData.video_requested.text === 'Not requested') {
                transferData.video_requested.text = 'Requested';
                this.videoBudget.currentBudget +=
                    transferData.videoDurationMinutes;
            } else {
                transferData.video_requested.text = 'Not requested';
                this.videoBudget.currentBudget -= transferData.videoDurationMinutes;
            }
            transferData.maxBudget = this.videoBudget.maxBudget;
            transferData.currentBudget = this.videoBudget.currentBudget;
            this.newService
                .saveVideoRequest(transferData)
                .pipe(
                    map(res => {
                        this.alert.type = 'success';
                        this.alert.message = res.data;
                        transferData.formChanged = false;
                    }),
                    catchError(error => {
                        this.alert.type = 'danger';
                        this.alert.message = error;
                        throw error;
                    })
                )
                .subscribe(_ => {
                    this.getVideoRequests(this.vesselObject).subscribe(_ => {
                        for (let i = 0; i < this.transferData.length; i++) {
                            this.transferData[i].video_requested = this.matchVideoRequestWithTransfer(
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
        if (transferData.comment !== 'Other') {
            transferData.commentChanged.otherComment = '';
        }
        transferData.commentDate = Date.now();
        transferData.userID = this.tokenInfo.userID;
        this.newService
            .saveTransfer(transferData)
            .pipe(
                map(res => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                    transferData.formChanged = false;
                }),
                catchError(error => {
                    this.alert.type = 'danger';
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
}
