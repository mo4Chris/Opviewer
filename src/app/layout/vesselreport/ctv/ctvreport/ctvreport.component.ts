import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, SimpleChange } from '@angular/core';
import { CommonService } from '../../../../common.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
    @Output() turbineLocationData: EventEmitter<any> = new EventEmitter<any>();
    @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() longitude: EventEmitter<any> = new EventEmitter<any>();
    @Output() sailDates: EventEmitter<any[]> = new EventEmitter<any[]>();
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() routeFound: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() parkFound: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() vesselObject;
    @Input() tokenInfo;
    @Input() mapPixelWidth;

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
    modalReference: NgbModalRef;
    multiSelectSettings = {
        idField: 'mmsi',
        textField: 'nicename',
        allowSearchFilter: true,
        singleSelection: false
    };
    toolboxOptions = ['Bunkering OPS', '2 man lifting', 'Battery maintenance', 'Bird survey', 'Working on engines', 'using dock craine', 'lifting between vessel and TP',
    'Power washing', 'Daily slinging and craning', 'Fueling substation', 'gearbox oil change', 'servicing small generator', 'Replacing bow fender straps',
   'Main engine oil and filter changed', 'Generator service', 'Craining ops', 'Bunkering at fuel barge', 'New crew'];
    toolboxConducted = [];
    hseOptions = [];

    generalInputStats = {date: '', mmsi: '', fuelConsumption: 0, landedOil: 0, landedGarbage: 0, hseReports: '', toolboxConducted: [], customInput: ''};



    public showAlert = false;
    alert = { type: '', message: '' };
    timeout;

    constructor(private newService: CommonService, private calculationService: CalculationService, private modalService: NgbModal, private dateTimeService: DatetimeService) {

    }


    openModal(content) {
        this.modalReference = this.modalService.open(content, { size: 'lg' });
    }

    closeModal() {
        this.modalReference.close();
    }

    ngOnInit() {
        Chart.pluginService.register(ChartAnnotation);
    }

    buildPageWithCurrentInformation() {
        // At this point are loaded: tokenInfo, vesselObject
        this.noPermissionForData = false;
        this.videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';

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
                        this.newService.getDistinctFieldnames({ 'mmsi': this.transferData[0].mmsi, 'date': this.transferData[0].date }).subscribe(data => {
                            this.newService.getSpecificPark({ 'park': data }).subscribe(locData => {
                                if (locData.length > 0) {

                                    const locationData = { 'turbineLocations': locData, 'transfers': this.transferData, 'type': '', 'vesselType': 'CTV' };

                                    this.turbineLocationData.emit(locationData),
                                        this.parkFound.emit(true);
                                } else {
                                    this.parkFound.emit(false);
                                }
                                this.newService.getCrewRouteForBoat(this.vesselObject).subscribe(routeData => {
                                    if (routeData.length > 0) {
                                        let latitudes = [];
                                        let longitudes = [];

                                        for (let i = 0; i < routeData.length; i++) {
                                            latitudes = latitudes.concat(routeData[i].lat);
                                            longitudes = longitudes.concat(routeData[i].lon);
                                        }

                                        const mapProperties = this.calculationService.GetPropertiesForMap(this.mapPixelWidth, latitudes, longitudes);
                                        const boatLocationData = routeData;
                                        this.boatLocationData.emit(boatLocationData);
                                        this.latitude.emit(mapProperties.avgLatitude);
                                        this.longitude.emit(mapProperties.avgLongitude);
                                        this.mapZoomLvl.emit(mapProperties.zoomLevel);
                                        this.routeFound.emit(true);
                                    } else {
                                        this.newService.getTransitsRouteForBoat(this.vesselObject).subscribe(transitrouteData => {
                                            let latitudes = [];
                                            let longitudes = [];
                                            if (transitrouteData.length > 0) {
                                                for (let i = 0; i < transitrouteData.length; i++) {
                                                    latitudes = latitudes.concat(transitrouteData[i].lat);
                                                    longitudes = longitudes.concat(transitrouteData[i].lon);
                                                }

                                                const mapProperties = this.calculationService.GetPropertiesForMap(this.mapPixelWidth, latitudes, longitudes);
                                                const boatLocationData = transitrouteData;
                                                this.boatLocationData.emit(boatLocationData);
                                                this.latitude.emit(mapProperties.avgLatitude);
                                                this.longitude.emit(mapProperties.avgLongitude);
                                                this.mapZoomLvl.emit(mapProperties.zoomLevel);
                                                this.routeFound.emit(true);

                                            } else {
                                                this.routeFound.emit(false);
                                                this.mapZoomLvl.emit(10);
                                            }
                                        });

                                    }
                                });
                            });
                        });
                    }
                    // when chartinfo has been generated create slipgraphs. If previously slipgraphes have existed destroy them before creating new ones.
                    if (this.charts.length <= 0) {
                        setTimeout(() => this.createSlipgraphs(), 10);
                    } else {
                        let deleteCharts = false;
                        for (let i = 0; i < this.transferData.length; i++) {
                            if (typeof this.transferData[i] !== 'undefined' && typeof this.transferData[i].slipGraph !== 'undefined' && typeof this.transferData[i].slipGraph.slipX !== 'undefined' && this.transferData[i].slipGraph.slipX.length > 0) {
                                deleteCharts = true;
                                break;
                            }
                        }
                        if (deleteCharts) {
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
                }, null, () => {
                    this.showContent.emit(true);
                    this.loaded.emit(true);
                });
            } else {
                this.showContent.emit(false);
                this.noPermissionForData = true;
                this.loaded.emit(true);
            }
        });
    }

    createSlipgraphs() {
        this.charts = [];
        let createCharts = false;
        for (let i = 0; i < this.transferData.length; i++) {
            if (this.transferData[i].slipGraph !== undefined && this.transferData[i].slipGraph.slipX.length > 0) {
                createCharts = true;
                break;
            }
        }
        if (this.transferData.length > 0 && createCharts) {
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

        return this.newService.getTransfersForVessel(this.vesselObject.mmsi, this.vesselObject.date).pipe(
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
            if (lineData[j].data.datasets[0].data.length > 0) {
                const tempChart = new Chart('canvas' + j, lineData[j]);
                this.charts.push(tempChart);
            }
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
        return this.calculationService.roundNumber(number, decimal = decimal, addString = addString);
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
            this.transferData[i].oldComment = this.transferData[i].comment;
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
            if (general.data.length > 0 && general.data[0].inputStats) {
                this.generalInputStats.mmsi =  this.vesselObject.mmsi;
                this.generalInputStats.date =  this.vesselObject.date;
                this.generalInputStats.fuelConsumption =  general.data[0].inputStats.fuelConsumption;
                this.generalInputStats.hseReports = general.data[0].inputStats.hseReports;
                this.generalInputStats.landedGarbage = general.data[0].inputStats.landedGarbage;
                this.generalInputStats.landedOil = general.data[0].inputStats.landedOil;
                this.generalInputStats.toolboxConducted = general.data[0].inputStats.toolboxConducted;
                this.generalInputStats.customInput = general.data[0].inputStats.customInput;
            } else {
                this.generalInputStats.mmsi =  this.vesselObject.mmsi;
                this.generalInputStats.date =  this.vesselObject.date;
                this.generalInputStats.fuelConsumption =  0;
                this.generalInputStats.hseReports = 'N/a';
                this.generalInputStats.landedGarbage = 0;
                this.generalInputStats.landedOil = 0;
                this.generalInputStats.toolboxConducted = [null];
                this.generalInputStats.customInput = 'N/a';
            }

        });
    }

    saveGeneralStats() {
        this.newService.saveCTVGeneralStats(this.generalInputStats).pipe(
            map(res => {
                this.alert.type = 'success';
                this.alert.message = res.data;
            }),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })).subscribe(data => {
                this.showAlert = true;
                this.timeout = setTimeout(() => {
                    this.showAlert = false;
                }, 7000);
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
                vid.status !== ''
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
