import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../../supportModules/calculation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { WavedataModel } from '../../../../../models/wavedataModel';
import { WeatherOverviewChart } from '../../models/weatherChart';
import { VesselObjectModel } from '../../../../../supportModules/mocked.common.service';
import { TurbineTransfer } from '../../sov/models/Transfers/TurbineTransfer';
import { CTVGeneralStatsModel, CtvDprStatsModel } from '../../models/generalstats.model';
import { SettingsService } from '../../../../../supportModules/settings.service';
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-ctvreport',
  templateUrl: './ctvreport.component.html',
  styleUrls: ['./ctvreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvreportComponent implements OnInit {
  @Output() mapZoomLvl: EventEmitter<number> = new EventEmitter<number>();
  @Output() boatLocationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() turbineLocationData: EventEmitter<any> = new EventEmitter<any>();
  @Output() latitude: EventEmitter<any> = new EventEmitter<any>();
  @Output() longitude: EventEmitter<any> = new EventEmitter<any>();
  @Output() sailDates: EventEmitter<any> = new EventEmitter<any>();
  @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() routeFound: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() parkFound: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() vesselObject: VesselObjectModel;
  @Input() tokenInfo;
  @Input() mapPixelWidth: number;
  @Input() mapPromise: Promise<google.maps.Map>;

  videoRequestPermission;
  videoRequestLoading = false;

  transferData;
  commentsChanged;
  changedCommentObj = { newComment: '', otherComment: '' };

  videoRequests;
  videoBudget;
  noTransits;
  general: CTVGeneralStatsModel;

  vessels;
  noPermissionForData: boolean;
  vessel;
  times = [];
  allHours = [];
  all5Minutes = [];
  dateData = { transfer: undefined, general: undefined };
  modalReference: NgbModalRef;
  multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    singleSelection: false
  };
  toolboxConducted = [];
  hseOptions = [];
  enginedata = {};


  generalInputStats = {
    date: NaN,
    mmsi: NaN,
    fuelConsumption: 0,
    landedOil: 0,
    landedGarbage: 0,
    toolboxConducted: [null],
    drillsConducted: [null],
    observations: false,
    incidents: false,
    passengers: false,
    customInput: '',
  };

  googleMap: google.maps.Map;
  wavedata: WavedataModel;
  wavedataLoaded = false;
  wavegraphMinimized = false;
  weatherOverviewChart: WeatherOverviewChart;
  visitedPark = '';

  public showAlert = false;
  public vesselUtcOffset: number;

  constructor(
    private newService: CommonService,
    private calculationService: CalculationService,
    private modalService: NgbModal,
    private dateTimeService: DatetimeService,
    private settings: SettingsService,
    private alert: AlertService,
  ) {
  }


  openModal(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg' });
  }

  closeModal() {
    this.modalReference.close();
  }

  ngOnInit() {
    this.createTimes();
    this.createSeperateTimes();
    Chart.pluginService.register(ChartAnnotation);
  }

  buildPageWithCurrentInformation() {
    // At this point are loaded: tokenInfo, vesselObject
    this.visitedPark = '';
    if (this.weatherOverviewChart) {
      this.weatherOverviewChart.destroy();
    }

    this.getDatesShipHasSailed(this.vesselObject);
    this.noPermissionForData = false;
    this.videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';

    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        forkJoin(
          this.getTransfersForVessel(),
          this.getComments(this.vesselObject),
          this.getVideoRequests(this.vesselObject),
          this.newService.getVideoBudgetByMmsi(this.vesselObject),
          this.getEngineStats(),
        ).subscribe(([_transfers, _comments, _videoRequests, _videoBudget, _engine]) => {
          this.videoBudget = _videoBudget[0] || { maxBudget: -1, currentBudget: -1 };
          this.matchCommentsWithTransfers(_transfers); // Requires video budget
          this.transferData = _transfers; // Needs to happen after match comments!
          this.enginedata = _engine;
          this.getGeneralStats();
          if (this.transferData.length > 0) {
            this.newService.getDistinctFieldnames({
              mmsi: this.transferData[0].mmsi,
              date: this.transferData[0].date
            }).subscribe(data => {
              this.newService.getSpecificPark({
                park: data
              }).subscribe(locData => {
                if (locData.length > 0) {
                  const locationData = {
                    turbineLocations: locData,
                    transfers: this.transferData,
                    type: '',
                    vesselType: 'CTV'
                  };
                  this.turbineLocationData.emit(locationData);
                  this.parkFound.emit(true);
                } else {
                  this.parkFound.emit(false);
                }
              });
            });
          }
        }, null, () => {
          this.showContent.emit(true);
          this.loaded.emit(true);
          this.loadWaveData();
        });
      } else {
        this.showContent.emit(false);
        this.noPermissionForData = true;
        this.loaded.emit(true);
      }
    });
  }

  minimizeWaveGraph() {
    this.wavegraphMinimized = this.wavegraphMinimized ? false : true;
  }


  loadWaveData() {
    this.wavedataLoaded = false;
    this.wavedata = null;
    this.turbineLocationData.subscribe(turbData => {
      this.visitedPark = turbData.turbineLocations[0] ? turbData.turbineLocations[0].SiteName : null;
      this.newService.getWavedataForDay({
        date: this.vesselObject.date,
        site: this.visitedPark,
      }).subscribe(waves => {
        this.wavedata = waves;
        if (waves) {
          this.wavedataLoaded = true;
          this.createWeatherOverviewChart(turbData);
          this.addWaveFeaturesToMap();
        }
      });
    });
  }

  onMapLoaded(googleMap: google.maps.Map) {
    this.googleMap = googleMap;
    this.addWaveFeaturesToMap();
  }

  addWaveFeaturesToMap() {
    if (this.googleMap && this.wavedataLoaded) {
      this.wavedata.meta.drawOnMap(this.googleMap);
    }
  }

  createWeatherOverviewChart(turbData) {
    const wavedata = this.wavedata.wavedata;
    if (wavedata) {
      const timeStamps = wavedata.timeStamp.map(matlabTime => this.dateTimeService.MatlabDateToUnixEpoch(matlabTime));
      const validLabels = this.wavedata.availableWaveParameters();
      // Parsing the main datasets
      const dsets: any[] = [];
      validLabels.forEach((label, __i) => {
        dsets.push({
          label: label,
          data: wavedata[label].map((elt: number, _i) => {
            return { x: timeStamps[_i], y: elt };
          }),
          pointHoverRadius: 5,
          pointHitRadius: 30,
          pointRadius: 0,
          borderWidth: 2,
          unit: undefined,
          fill: false,
          yAxisID: (label === 'windDir') ? 'waveDir' : label
        });
      });
      const wavedataSourceName = 'Source: ' + this.wavedata.meta.name;
      const transferData = [];
      // Adding the grey transfer boxes
      const addTransfer = (start, stop) => {
        start = this.dateTimeService.MatlabDateToUnixEpoch(start);
        stop = this.dateTimeService.MatlabDateToUnixEpoch(stop);
        transferData.push({ x: start, y: 1 });
        transferData.push({ x: stop, y: 1 });
        transferData.push({ x: NaN, y: NaN });
      };
      turbData.transfers.forEach(visit => {
        addTransfer(visit.startTime, visit.stopTime);
      });
      dsets.push({
        label: 'Vessel transfers',
        data: transferData,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 0,
        yAxisID: 'hidden',
        lineTension: 0,
      });
      setTimeout(() => {
        this.weatherOverviewChart = new WeatherOverviewChart({
          dsets: dsets,
          timeStamps: timeStamps,
          wavedataSourceName: wavedataSourceName
        }, this.calculationService, this.settings);
      }, 100);
    }
  }

  getTransfersForVessel() {
    return this.newService.getTransfersForVessel(this.vesselObject.mmsi, this.vesselObject.date).pipe(
      map(
        (transfers) => {
          this.visitedPark = transfers[0] ? transfers[0].fieldname : '';
          return transfers;
        }),
      catchError(error => {
        console.log('error ' + error);
        throw error;
      }));
  }

  createTimes() {
    this.times = this.dateTimeService.createTimesQuarterHour();
  }

  createSeperateTimes() {
    this.allHours = this.dateTimeService.createHoursTimes();
    this.all5Minutes = this.dateTimeService.createFiveMinutesTimes();
  }

  getDatesWithTransfers(date) {
    return this.newService
      .getDatesWithValues(date).pipe(
        map(
          (dates) => {
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

  getDatesShipHasSailed_legacy(date) {
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

  getDatesShipHasSailed(date: VesselObjectModel) {
    forkJoin(
      this.newService.getDatesWithValues(date),
      this.newService.getDatesWithValuesFromGeneralStats(date)
    ).subscribe(([transfers, data]) => {
      this.dateData.transfer = transfers;
      this.dateData.general = data.data;
      this.pushSailingDates();
    });
  }

  pushSailingDates() {
    if (this.dateData.transfer && this.dateData.general) {
      const transferDates = [];
      const transitDates = [];
      const otherDates = [];
      let formattedDate;
      let hasTransfers: boolean;
      this.dateData.general.forEach(elt => {
        formattedDate = this.dateTimeService.JSDateYMDToObjectDate(this.dateTimeService.MatlabDateToJSDateYMD(elt.date));
        hasTransfers = this.dateData.transfer.reduce((acc, val) => acc || +val === elt.date, false);
        if (elt.distancekm && hasTransfers) {
          transferDates.push(formattedDate);
        } else if (elt.distancekm) {
          transitDates.push(formattedDate);
        } else {
          otherDates.push(formattedDate);
        }
      });
      const sailInfo = { transfer: transferDates, transit: transitDates, other: otherDates };
      this.sailDates.emit(sailInfo);
    }
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

  getComments(vessel: VesselObjectModel) {
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

  getEngineStats() {
    return this.newService.getEnginedata(this.vesselObject.mmsi, this.vesselObject.date ).pipe(
      map(data => {
        if (data.length > 0) {
          return data[0];
        } else {
          return {
            c02TotalKg: 0,
            fuelPerHour: 0,
            fuelPerHourDepart: 0,
            fuelPerHourReturn: 0,
            fuelPerHourTotal: 0,
            fuelPerHourTransfer: 0,
            fuelUsedDepartM3: 0,
            fuelUsedReturnM3: 0,
            fuelUsedTotalM3: 0,
            fuelUsedTransferM3: 0,
          };
        }
    }));
  }

  getVideoRequests(vessel: VesselObjectModel) {
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

  matchCommentsWithTransfers(_transfers) {
    for (let i = 0; i < _transfers.length; i++) {
      _transfers[i].oldComment = _transfers[i].comment;
      _transfers[i].showCommentChanged = false;
      _transfers[i].commentChanged = this.changedCommentObj;
      _transfers[i].formChanged = false;
      _transfers[i].video_requested = this.matchVideoRequestWithTransfer(_transfers[i]);
      for (let j = 0; j < this.commentsChanged.length; j++) {
        if (
          _transfers[i]._id ===
          this.commentsChanged[j].idTransfer
        ) {
          _transfers[i].commentChanged = this.commentsChanged[j];
          _transfers[i].comment = this.commentsChanged[j].newComment;
          _transfers[i].showCommentChanged = true;
          this.commentsChanged.splice(j, 1);
        }
      }
    }
  }

  getGeneralStats() {
    // We reset these value - they are overwritten if the relevant data is present
    this.generalInputStats.mmsi = this.vesselObject.mmsi;
    this.generalInputStats.date = this.vesselObject.date;
    this.resetInputStats();
    this.noTransits = true;
    this.general = null;

    this.newService.getGeneral(this.vesselObject).subscribe(general => {
      if (general && general.data && general.data.length > 0) {
        const _general: CTVGeneralStatsModel = general.data[0];
        if (_general.utcOffset) {
          // General stats utc offset is in days
          this.vesselUtcOffset = _general.utcOffset;
          this.dateTimeService.vesselOffsetHours = this.vesselUtcOffset;
        }
        if (_general.DPRstats && typeof (_general.DPRstats) === 'object') {
          this.noTransits = false;
          const dpr = <any>_general.DPRstats;
          dpr.AvgSpeedOutbound = this.switchUnit(dpr.AvgSpeedInbound, 'knots', this.settings.unit_speed);
          dpr.AvgSpeedInbound = this.switchUnit(dpr.AvgSpeedInbound, 'knots', this.settings.unit_speed);
          dpr.AvgSpeedOutboundUnrestricted = this.switchUnit(dpr.AvgSpeedOutboundUnrestricted, 'knots', this.settings.unit_speed);
          dpr.AvgSpeedInboundUnrestricted = this.switchUnit(dpr.AvgSpeedInboundUnrestricted, 'knots', this.settings.unit_speed);
          dpr.sailedDistance = this.switchUnit(dpr.sailedDistance, 'NM', this.settings.unit_distance);
          this.general = dpr;
        }
        if (_general.inputStats) {
          this.generalInputStats.fuelConsumption = _general.inputStats.fuelConsumption;
          this.generalInputStats.observations = _general.inputStats.observations;
          this.generalInputStats.landedGarbage = _general.inputStats.landedGarbage;
          this.generalInputStats.landedOil = _general.inputStats.landedOil;
          this.generalInputStats.toolboxConducted = _general.inputStats.toolboxConducted;
          this.generalInputStats.incidents = _general.inputStats.incidents;
          this.generalInputStats.drillsConducted = _general.inputStats.drillsConducted || [];
          this.generalInputStats.passengers = _general.inputStats.passengers;
          this.generalInputStats.customInput = _general.inputStats.customInput;
        }
        if (_general.lon) {
          const longitudes = this.calculationService.parseMatlabArray(_general.lon);
          if (longitudes.length > 0) {
            const latitudes = this.calculationService.parseMatlabArray(_general.lat);
            const mapProperties = this.calculationService.GetPropertiesForMap(this.mapPixelWidth, latitudes, longitudes);
            const route = [{ lat: latitudes, lon: longitudes }];
            this.boatLocationData.emit(route);
            this.latitude.emit(mapProperties.avgLatitude);
            this.longitude.emit(mapProperties.avgLongitude);
            this.mapZoomLvl.emit(mapProperties.zoomLevel);
            this.routeFound.emit(true);
          } else {
            this.routeFound.emit(false);
            this.mapZoomLvl.emit(10);
          }
        } else {
          this.routeFound.emit(false);
          this.mapZoomLvl.emit(10);
        }
      } else {
        this.routeFound.emit(false);
        this.mapZoomLvl.emit(10);
      }
    });
  }

  private switchUnit(value: number | string, oldUnit: string, newUnit: string) {
    return this.calculationService.switchUnitAndMakeString(value, oldUnit, newUnit);
  }

  resetInputStats() {
    this.generalInputStats.mmsi = this.vesselObject.mmsi;
    this.generalInputStats.date = this.vesselObject.date;
    this.generalInputStats.fuelConsumption = 0;
    this.generalInputStats.landedGarbage = 0;
    this.generalInputStats.landedOil = 0;
    this.generalInputStats.toolboxConducted = [null];
    this.generalInputStats.observations = false;
    this.generalInputStats.incidents = false;
    this.generalInputStats.drillsConducted = [null];
    this.generalInputStats.passengers = false;
    this.generalInputStats.customInput = '-';
  }

  matchVideoRequestWithTransfer(transfer): VideoRequestModel {
    let vid: VideoRequestModel;
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

  checkVideoBudget(duration: number, vid: VideoRequestModel) {
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
            this.alert.sendAlert({text: res.data, type: 'success'});
            transferData.formChanged = false;
          }),
          catchError(error => {
            this.alert.sendAlert({text: error, type: 'danger'});
            throw error;
          })
        ).subscribe(_ => {
          this.getVideoRequests(this.vesselObject).subscribe(__ => {
            for (let i = 0; i < this.transferData.length; i++) {
              this.transferData[i].video_requested = this.matchVideoRequestWithTransfer(
                this.transferData[i]
              );
            }
            this.videoRequestLoading = false;
          });
          this.newService
            .getVideoBudgetByMmsi(this.vesselObject)
            .subscribe(data => (this.videoBudget = data[0]));
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
          this.alert.sendAlert({text: res.data, type: 'success'});
          transferData.formChanged = false;
        }),
        catchError(error => {
            this.alert.sendAlert({text: error, type: 'danger'});
          throw error;
        })
      ).subscribe();
  }
}

interface VideoRequestModel {
  text: string;
  disabled: boolean;
  status?: string;
  active?: boolean;
}
