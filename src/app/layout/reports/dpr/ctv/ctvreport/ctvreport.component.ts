import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { map, catchError } from 'rxjs/operators';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { WavedataModel } from '@app/models/wavedataModel';
import { WeatherOverviewChart } from '../../models/weatherChart';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { CTVGeneralStatsModel, CtvDprStatsModel } from '../../models/generalstats.model';
import { SettingsService } from '@app/supportModules/settings.service';
import { forkJoin, Observable } from 'rxjs';
import { AlertService } from '@app/supportModules/alert.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { MapStore, TurbinePark } from '@app/stores/map.store';
import { TokenModel } from '@app/models/tokenModel';

@Component({
  selector: 'app-ctvreport',
  templateUrl: './ctvreport.component.html',
  styleUrls: ['./ctvreport.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtvreportComponent implements OnInit, OnChanges {
  @Input() vesselObject: VesselObjectModel;
  @Input() tokenInfo: TokenModel;
  @Output() sailDates: EventEmitter<any> = new EventEmitter<any>();
  @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();

  public turbineTransfers = [];

  public videoRequestLoading = false;
  public noTransits: boolean;
  public videoRequests;
  public videoBudget;
  public general: CTVGeneralStatsModel;

  public noPermissionForData: boolean;
  public toolboxConducted = [];
  public hseOptions = [];
  public enginedata = {};
  public generalInputStats = {
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

  private googleMap: google.maps.Map;
  public wavedata: WavedataModel;
  public wavegraphMinimized = false;
  private weatherOverviewChart: WeatherOverviewChart;
  public visitedPark = 'N/a';

  public vesselTrace = null;
  public showAlert = false;
  public showMap = false;
  public isLoading = true;
  public hasData = false;
  public wavedataLoaded = false;
  public vesselUtcOffset: number;

  constructor(
    private newService: CommonService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private settings: SettingsService,
    private alert: AlertService,
    private ref: ChangeDetectorRef,
    private mapStore: MapStore,
  ) {
  }

  // Technical details
  private commentsChanged: Array<any>;
  private changedCommentObj = { newComment: '', otherComment: '' };
  private dateData = { mmsi: undefined, transfer: undefined, general: undefined };
  public multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    singleSelection: false
  };


  // Init
  ngOnInit() {
    Chart.pluginService.register(ChartAnnotation);
  }
  ngOnChanges() {
    this.hasData = false;
    this.isLoading = true;
    this.showMap = false;
    this.noPermissionForData = false;
    this.visitedPark = 'N/a';
    this.noTransits = true;
    this.general = null;
    if (this.weatherOverviewChart) {
      this.weatherOverviewChart.destroy();
    }
    if (!this.dateData || !this.dateData.general || this.dateData.mmsi !== this.vesselObject.mmsi) {
      this.getDatesShipHasSailed(this.vesselObject);
    }
    try {
      this.loadDprData();
    } catch (err) {
      this.loaded.emit(true);
      console.error(err);
    }
  }

  loadDprData() {
    // At this point are loaded: tokenInfo, vesselObject
    this.newService.validatePermissionToViewData({
      mmsi: this.vesselObject.mmsi
    }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        forkJoin([
          this.getTransfersForVessel(),
          this.getCommentsForVessel(this.vesselObject),
          this.getVideoRequests(this.vesselObject),
          this.newService.getVideoBudgetByMmsi(this.vesselObject),
          this.getEngineStats(),
          this.getGeneralStats(),
          this.newService.getDistinctFieldnames(this.vesselObject)
        ]).subscribe(([_transfers, _comments, _videoRequests, _videoBudget, _engine, _general, _distinctFields]) => {
          console.log(_transfers);
          this.videoBudget = _videoBudget[0] || { maxBudget: -1, currentBudget: -1 };
          this.matchCommentsWithTransfers(_transfers); // Requires video budget
          this.turbineTransfers = _transfers; // Needs to happen after match comments!
          this.enginedata = _engine;

          this.showMap = true;
          this.isLoading = false;
          this.loaded.emit(true);
          this.loadWaveData();
          this.ref.detectChanges();
        });
      } else {
        console.error('Failed to load data: no permission');
        this.noPermissionForData = true;
        this.isLoading = false;
        this.loaded.emit(true);
      }
    });
  }

  // Callbacks
  public minimizeWaveGraph() {
    this.wavegraphMinimized = this.wavegraphMinimized ? false : true;
  }
  public onMapReady(googleMap: google.maps.Map) {
    this.googleMap = googleMap;
    this.addWaveFeaturesToMap();
  }
  public onVideoRequest(transfer: any) {
    // Callback when a new video is requested
    if (transfer.videoAvailable && !this.videoRequestLoading) {
      this.videoRequestLoading = true;
      if (this.videoBudget.maxBudget < 0) {
        this.videoBudget.maxBudget = 100;
      }
      if (this.videoBudget.currentBudget < 0) {
        this.videoBudget.currentBudget = 0;
      }
      if (transfer.video_requested.text === 'Not requested') {
        transfer.video_requested.text = 'Requested';
        this.videoBudget.currentBudget +=
        transfer.videoDurationMinutes;
      } else {
        transfer.video_requested.text = 'Not requested';
        this.videoBudget.currentBudget -= transfer.videoDurationMinutes;
      }
      transfer.maxBudget = this.videoBudget.maxBudget;
      transfer.currentBudget = this.videoBudget.currentBudget;
      this.newService
        .saveVideoRequest(transfer)
        .pipe(
          map(res => {
            this.alert.sendAlert({ text: res.data, type: 'success' });
            transfer.formChanged = false;
          }),
          catchError(error => {
            this.alert.sendAlert({ text: error, type: 'danger' });
            throw error;
          })
        ).subscribe(_ => {
          this.getVideoRequests(this.vesselObject).subscribe(__ => {
            for (let i = 0; i < this.turbineTransfers.length; i++) {
              this.turbineTransfers[i].video_requested = this.matchVideoRequestWithTransfer(
                this.turbineTransfers[i]
              );
            }
            this.videoRequestLoading = false;
            this.ref.detectChanges();
          });
          this.newService
            .getVideoBudgetByMmsi(this.vesselObject)
            .subscribe(data => (this.videoBudget = data[0]));
        });
    }
  }
  public saveComment(transfer) {
    if (transfer.comment !== 'Other') {
      transfer.commentChanged.otherComment = '';
    }
    transfer.commentDate = Date.now();
    transfer.userID = this.tokenInfo.userID;
    this.newService
      .saveTransfer(transfer)
      .pipe(
        map(res => {
          this.alert.sendAlert({ text: res.data, type: 'success' });
          transfer.formChanged = false;
        }),
        catchError(error => {
          this.alert.sendAlert({ text: error, type: 'danger' });
          throw error;
        })
      ).subscribe();
  }

  // Loaders or data pipelines
  private loadWaveData() {
    this.wavedataLoaded = false;
    this.wavedata = null;
    this.mapStore.parks.then(parks => {
      let turbnames: string[] = [];
      if (Array.isArray(this.turbineTransfers)) {
        turbnames = this.turbineTransfers.map(e => e.fieldname);
      }
      const park_coord_name = turbnames.find(e => typeof(e) === 'string');
      const park = parks.find(_park => _park.filename === park_coord_name);
      this.visitedPark = park ? park.name : null;
      this.newService.getWavedataForDay({
        date: this.vesselObject.date,
        site: this.visitedPark,
      }).subscribe(waves => {
        this.wavedata = new WavedataModel(waves);
        if (waves) {
          this.wavedataLoaded = true;
          this.createWeatherOverviewChart();
          this.addWaveFeaturesToMap();
        }
      });
    });
  }
  private getEngineStats() {
    return this.newService.getEnginedata(this.vesselObject.mmsi, this.vesselObject.date).pipe(
      map(data => {
        if (data.length > 0) {
          data[0]['fuelOther'] = data[0].fuelUsedTotalM3 - data[0].fuelUsedDepartM3 - data[0].fuelUsedReturnM3 - data[0].fuelUsedTransferM3;
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
            fuelOther: 0,
          };
        }
      }));
  }
  private getVideoRequests(vessel: VesselObjectModel) {
    return this.newService.getVideoRequests(vessel).pipe(
      map(requests => {
        this.videoRequests = requests;
      }),
      catchError(error => {
        console.error(error);
        throw error;
      })
    );
  }

  // Data loading pipelines
  private getTransfersForVessel() {
    return this.newService.getTransfersForVessel(this.vesselObject.mmsi, this.vesselObject.date).pipe(
      map((transfers) => {
        console.log(transfers);
          this.visitedPark = transfers[0] ? transfers[0].fieldname : '';
          return transfers;
        }),
      catchError(error => {
        console.error(error);
        throw error;
      }));
  }
  private getCommentsForVessel(vessel: VesselObjectModel) {
    return this.newService.getCommentsForVessel(vessel).pipe(
      map(changed => {
        this.commentsChanged = changed;
      }),
      catchError(error => {
        console.error(error);
        throw error;
      })
    );
  }
  private getDatesShipHasSailed(date: VesselObjectModel) {
    const mmsi = this.vesselObject.mmsi;
    forkJoin([
      this.newService.getDatesWithValues(date),
      this.newService.getDatesWithValuesFromGeneralStats(date)
    ]).subscribe(([transfers, genData]) => {
      this.dateData.mmsi = mmsi;
      this.dateData.transfer = transfers;
      this.dateData.general = genData.data;
      this.pushSailingDates();
    });
  }
  private getGeneralStats(): Observable<any[]> {
    // We reset these value - they are overwritten if the relevant data is present
    this.generalInputStats.mmsi = this.vesselObject.mmsi;
    this.generalInputStats.date = this.vesselObject.date;
    this.resetInputStats();
    return this.newService.getGeneral(this.vesselObject).pipe(map(general => {
      if (general && general.data && general.data.length > 0) {
        const _general: CTVGeneralStatsModel = general.data[0];
        this.vesselTrace = {
          time: _general.time,
          lon: _general.lon,
          lat: _general.lat
        };
        this.vesselUtcOffset = 24 * _general.utcOffset || 0;
        this.dateTimeService.vesselOffsetHours = this.vesselUtcOffset;
        if (_general.DPRstats && typeof (_general.DPRstats) === 'object') {
          this.noTransits = false;
          const dpr = <any>_general.DPRstats;
          dpr.AvgSpeedOutbound = this.switchUnit(dpr.AvgSpeedOutbound, 'knots', this.settings.unit_speed);
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
          this.generalInputStats.incidents = _general.inputStats.incidents;
          this.generalInputStats.toolboxConducted = this.removeNansFromArray(_general.inputStats.toolboxConducted) || [];
          this.generalInputStats.drillsConducted = this.removeNansFromArray(_general.inputStats.drillsConducted) || [];
          this.generalInputStats.passengers = _general.inputStats.passengers;
          this.generalInputStats.customInput = _general.inputStats.customInput;
        }
        this.hasData = true;
      } else {
        this.showMap = false;
        this.hasData = false;
      }
      return null;
    }));
  }

  // Other
  private async pushSailingDates() {
    if (this.dateData.transfer && this.dateData.general) {
      const transferDates = [];
      const transitDates = [];
      const otherDates = [];
      let formattedDate: {year: number, month: number, day: number};
      let hasTransfers: boolean;
      this.dateData.general.forEach(elt => {
        formattedDate = this.dateTimeService.ymdStringToYMD(this.dateTimeService.matlabDatenumToYmdString(elt.date));
        hasTransfers = this.dateData.transfer.reduce((acc, val) => acc || +val === elt.date, false);
        if (elt.distancekm && hasTransfers) {
          transferDates.push(formattedDate);
        } else if (elt.distancekm) {
          transitDates.push(formattedDate);
        } else {
          otherDates.push(formattedDate);
        }
      });
      const sailInfo = {
        transfer: transferDates,
        transit: transitDates,
        other: otherDates
      };
      this.sailDates.emit(sailInfo);
    } else {
      console.error('Failed to retrieve sailing dates!');
      this.sailDates.emit({
        transfer: [],
        transit: [],
        other: [],
      });
    }
  }
  private matchCommentsWithTransfers(_transfers) {
    for (let i = 0; i < _transfers.length; i++) {
      _transfers[i].oldComment = _transfers[i].comment;
      _transfers[i].showCommentChanged = false;
      _transfers[i].commentChanged = _transfers[i].commentChanged || this.changedCommentObj;
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
  private addWaveFeaturesToMap() {
    if (this.googleMap && this.wavedataLoaded) {
      this.wavedata.meta.drawOnMap(this.googleMap);
    }
  }
  private createWeatherOverviewChart() {
    const wavedata = this.wavedata.wavedata;
    if (wavedata) {
      const timeStamps = wavedata.timeStamp.map(
        matlabTime => this.dateTimeService.matlabDatenumToMoment(matlabTime).toISOString(false)
      );
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
      const transferDatas = [];
      // Adding the grey transfer boxes
      const addTransfer = (start, stop) => {
        if (typeof start == 'number' && start > 0) {
          start = this.dateTimeService.matlabDatenumToMoment(start);
          stop = this.dateTimeService.matlabDatenumToMoment(stop);
          transferDatas.push({ x: start, y: 1 });
          transferDatas.push({ x: stop, y: 1 });
          transferDatas.push({ x: stop, y: NaN });
        }
      };
      this.turbineTransfers.forEach(visit => {
        addTransfer(visit.startTime, visit.stopTime);
      });
      dsets.push({
        label: 'Vessel transfers',
        data: transferDatas,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 0,
        yAxisID: 'hidden',
        lineTension: 0,
      });
      this.ref.detectChanges();
      const id = document.getElementById('weatherOverview');
      this.weatherOverviewChart = new WeatherOverviewChart({
        dsets: dsets,
        timeStamps: timeStamps,
        wavedataSourceName: wavedataSourceName,
        utcOffset: 0,
      }, this.calculationService, this.settings, id);
    }
  }
  private resetInputStats() {
    this.generalInputStats.mmsi = this.vesselObject.mmsi;
    this.generalInputStats.date = this.vesselObject.date;
    this.generalInputStats.fuelConsumption = 0;
    this.generalInputStats.landedGarbage = 0;
    this.generalInputStats.landedOil = 0;
    this.generalInputStats.toolboxConducted = [];
    this.generalInputStats.observations = false;
    this.generalInputStats.incidents = false;
    this.generalInputStats.drillsConducted = [];
    this.generalInputStats.passengers = false;
    this.generalInputStats.customInput = '-';
  }
  private matchVideoRequestWithTransfer(transfer): VideoRequestModel {
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

  removeNansFromArray(data: number | string | Array<number | string>) {
    if (Array.isArray(data)) {
      return data.filter(elt => elt && elt !== null);
    } else if (data) {
      return [data];
    } else {
      return [];
    }
  }
  private switchUnit(value: number | string, oldUnit: string, newUnit: string) {
    return this.calculationService.switchUnitAndMakeString(value, oldUnit, newUnit);
  }
  public getMatlabDateToJSTime(serial) {
    return this.dateTimeService.matlabDatenumToTimeString(serial);
  }
  public roundNumber(number, decimal = 10, addString = '') {
    return this.calculationService.roundNumber(number, decimal = decimal, addString = addString);
  }
  public getMatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    return this.dateTimeService.getMatlabDatenumDifferenceString(serialEnd, serialBegin);
  }
}


interface VideoRequestModel {
  text: string;
  disabled: boolean;
  status?: string;
  active?: boolean;
}
