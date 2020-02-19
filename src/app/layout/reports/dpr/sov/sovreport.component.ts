import { Component, OnInit, Output, EventEmitter, Input, OnChanges,
  ChangeDetectionStrategy } from '@angular/core';
import * as Chart from 'chart.js';
import * as annotation from 'chartjs-plugin-annotation';
import { CommonService } from '@app/common.service';
import { SovModel } from './models/SovModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SovType } from './models/SovType';
import { CalculationService } from '@app/supportModules/calculation.service';
import { isArray } from 'util';
import { SettingsService } from '@app/supportModules/settings.service';
import { AlertService } from '@app/supportModules/alert.service';
import { TokenModel } from '@app/models/tokenModel';
import { V2vPaxTotalModel } from './sov-v2v-transfers/sov-v2v-transfers.component';
import { DprChildData } from '../reports-dpr.component';
import { forkJoin } from 'rxjs';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';

@Component({
  selector: 'app-sovreport',
  templateUrl: './sovreport.component.html',
  styleUrls: ['./sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovreportComponent implements OnInit, OnChanges {
  @Output() turbineLocationData: EventEmitter<any> = new EventEmitter<any>();
  @Output() platformLocationData: EventEmitter<any> = new EventEmitter<any>();
  @Output() sailDates: EventEmitter<any> = new EventEmitter<any>();
  @Output() sovChildData = new EventEmitter<DprChildData>();

  @Input() tokenInfo: TokenModel;
  @Input() vesselObject: VesselObjectModel;
  @Input() mapPixelWidth: number;
  @Input() printMode: boolean;

  sovModel: SovModel = new SovModel();
  dprInput: DprChildData;
  hseDprInput;
  dprApproval;
  hseDprApproval;
  // This forces reload on all subcomponent, but reduces performance.
  // In the future, we should move to a more workable version where sovModel is
  // replaced when all data is loaded, so reload of other components is automatic
  // rather than having to redraw all html elements
  showContent = false;
  hasDprData = false;

  activeTab = 'summary';

  vesselHasWavespectrum = false;
  waveSpectrumAvailable = false;
  hasGeneral = false;

  dateData = { general: undefined, transfer: undefined };

  // used for comparison in the HTML
  SovTypeEnum = SovType;

  gangwayActive = false;
  turbineLocations = new Array<any>();
  fieldName = '';

  // Charts
  backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];
  v2vPaxCargoTotals: V2vPaxTotalModel;

  constructor(
    private commonService: CommonService,
    private datetimeService: DatetimeService,
    private calculationService: CalculationService,
    private settings: SettingsService,
    public alert: AlertService,
    public permission: PermissionService,
  ) {
  }

  ngOnInit() {
    Chart.pluginService.register(annotation);
    this.setDefaultActiveTab();
  }
  ngOnChanges() {
    this.ResetTransfers();
    this.buildPageWhenRouteLoaded();
  }

  buildPageWhenRouteLoaded() {
    this.GetAvailableRouteDatesForVessel();
    forkJoin(
      this.commonService.getSov(this.vesselObject),
      this.commonService.getSovDprInput(this.vesselObject),
      this.commonService.getSovHseDprInput(this.vesselObject),
    ).subscribe(
      ([
        sov,
        dprInput,
        hseDprInput,
      ]) => {
        // Commercial or hse DPR data needs to be loaded even when general is not available
        this.dprInput = dprInput[0];
        this.hseDprInput = hseDprInput[0];
        const dprSigned = dprInput[0] ? dprInput[0].signedOff : {amount: 0};
        const hseSigned = hseDprInput[0] ? hseDprInput[0].signedOff : {amount: 0};
        this.dprApproval = ( dprSigned && dprSigned.amount) ? dprSigned.amount : 0;
        this.hseDprApproval = (hseSigned && hseSigned.amount) ? hseSigned.amount : 0;

        if (
          sov.length !== 0 &&
          sov[0].seCoverageSpanHours !== '_NaN_'
        ) {
          this.hasGeneral = true;
          this.sovModel.sovInfo = sov[0];
          if (sov[0].utcOffset) {
            this.datetimeService.vesselOffset = sov[0].utcOffset;
          }
          this.getWaveSpectrumAvailable();

          forkJoin([
            this.commonService.getPlatformTransfers(
              this.vesselObject.mmsi,
              this.vesselObject.date
            ),
            this.commonService.getTurbineTransfers(
              this.vesselObject.mmsi,
              this.vesselObject.date
            ),
            this.commonService.getVessel2vesselsForSov(
              this.vesselObject.mmsi,
              this.vesselObject.date
            ),
            this.commonService.getCycleTimesForSov(
              this.vesselObject.mmsi,
              this.vesselObject.date
            ),
            this.commonService.getSovDistinctFieldnames(
              this.vesselObject
            ),
            this.commonService.getPlatformLocations('')
          ]).subscribe(
            ([
              platformTransfers,
              turbineTransfers,
              vessel2vessels,
              cycleTimes,
              sovFieldNames,
              platformLocations
            ]) => {
              // All data is loaded beyond this point
              if (platformTransfers.length > 0) {
                this.sovModel.sovType = SovType.Platform;
              } else if (turbineTransfers.length > 0) {
                this.sovModel.sovType = SovType.Turbine;
              } else {
                this.sovModel.sovType = SovType.Unknown;
              }
              this.sovModel.platformTransfers = platformTransfers;
              this.sovModel.turbineTransfers = turbineTransfers;
              this.sovModel.cycleTimes = cycleTimes;
              this.sovModel.vessel2vessels = vessel2vessels;

              // Setting cycle stats according to user settings -> this should be moved
              this.sovModel.cycleTimes.forEach(cycle => {
                cycle['avgSpeed'] = this.switchUnit(
                  cycle.avgSpeedKts,
                  'knots',
                  this.settings.unit_speed
                );
                cycle['maxSpeed'] = this.switchUnit(
                  cycle.maxSpeedKts,
                  'knots',
                  this.settings.unit_speed
                );
                cycle['sailedDistance'] = this.switchUnit(
                  cycle.sailedDistanceNM,
                  'NM',
                  this.settings.unit_distance
                );
                cycle['turbineDistance'] = this.switchUnit(
                  cycle.turbineDistanceNM,
                  'NM',
                  this.settings.unit_distance
                );
              });
              // Loading wind farm name content
              if (this.sovModel.vessel2vessels.length > 0) {
                this.sovModel.vessel2vessels[0].CTVactivity.forEach(
                  v2v => {
                    if (isArray(v2v.turbineVisits)) {
                      v2v.turbineVisits.forEach(visit => {
                        if (
                          !sovFieldNames.some(
                            elt =>
                              elt ===
                              visit.fieldname
                          )
                        ) {
                          sovFieldNames.push(
                            visit.fieldname
                          );
                        }
                      });
                    }
                  }
                );
              }
              this.loadFieldFromFieldnames(sovFieldNames);

              // Loading in platform content
              this.parsePlatformlocations(platformLocations);

              // This should be intergrated in to the forkJoin
              this.buildPageWhenAllLoaded();
              this.showContent = true;
            }
          );
        } else {
          // Skip check if all data is loaded if there is none
          if (sov.length > 0) {
            this.sovModel.sovInfo = sov[0];
          }
          // We need to load in the relevant hse / dpr Input data.
          this.hasGeneral = false;
          this.buildPageWhenAllLoaded();
          this.showContent = true;
        }
      },
    );
  }

  notifyParent() {
    const boatlocationData = [this.sovModel.sovInfo];
    if (
      '' + this.sovModel.sovInfo.lat !== '_NaN_' &&
      '' + this.sovModel.sovInfo.lon !== '_NaN_'
    ) {
      const mapProperties = this.calculationService.GetPropertiesForMap(
        this.mapPixelWidth,
        this.sovModel.sovInfo.lat,
        this.sovModel.sovInfo.lon
      );
      this.sovChildData.emit({
        routeFound: true,
        boatLocationData: boatlocationData,
        zoomInfo: {
          latitude: mapProperties.avgLatitude,
          longitude: mapProperties.avgLongitude,
          mapZoomLvl: mapProperties.zoomLevel
        },
        platformLocationData: null
      });
    } else {
      this.sovChildData.emit({
        routeFound: false,
        boatLocationData: boatlocationData,
        zoomInfo: {
          latitude: null,
          longitude: null,
          mapZoomLvl: null
        },
        platformLocationData: null
      });
    }
  }

  emitHseApproval(input) {
    this.hseDprApproval = input;
  }

  emitDprApproval(input) {
    this.dprApproval = input;
  }

  getWaveSpectrumAvailable() {
    if (this.permission.sovWaveSpectrum) {
      this.commonService.getSovWaveSpectrumAvailable(this.vesselObject).subscribe((status) => {
        this.vesselHasWavespectrum = status.vesselHasData || false;
        this.waveSpectrumAvailable = status.dateHasData || false;
      });
    }
  }

  loadFieldFromFieldnames(data: string[]) {
    this.commonService.getSpecificPark({
      park: data
    }).subscribe(locdata => {
      if (locdata.length !== 0) {
        let transfers: Array<any>;
        let sovType = 'Unknown';
        if (this.sovModel.sovType === SovType.Platform) {
          transfers = this.sovModel.platformTransfers;
          sovType = 'Platform';
        } else if (this.sovModel.sovType === SovType.Turbine) {
          transfers = this.sovModel.turbineTransfers;
          sovType = 'Turbine';
        }
        const locationData = {
          turbineLocations: locdata,
          transfers: transfers,
          type: sovType,
          vesselType: 'SOV'
        };
        this.turbineLocations = locationData.turbineLocations;
        this.turbineLocationData.emit(locationData);
        if (this.turbineLocations[0].SiteName) {
          this.fieldName = this.turbineLocations[0].SiteName;
        }
      }
    });
  }

  buildPageWhenAllLoaded() {
    if (this.sovModel.vessel2vessels.length > 0) {
      this.hasDprData = true;
    } else if (this.sovModel.sovType === SovType.Platform) {
      this.hasDprData = this.sovModel.platformTransfers.length > 0;
    } else if (this.sovModel.sovType === SovType.Turbine) {
      this.hasDprData = this.sovModel.turbineTransfers.length > 0;
    } else {
      this.hasDprData = false;
    }
    try {
      this.CheckForNullValues();
    } catch (e) {
      console.error(e);
    }
    this.notifyParent();
  }

  parsePlatformlocations(platformLocations) {
    if (platformLocations.length !== 0) {
      const transfers = this.sovModel.platformTransfers;
      const locationData = {
        turbineLocations: platformLocations,
        transfers: transfers,
        type: 'Platforms',
        vesselType: 'SOV'
      };
      this.platformLocationData.emit(locationData);
    }
  }

  GetAvailableRouteDatesForVessel() {
    forkJoin(
      this.commonService.getDatesShipHasSailedForSov(this.vesselObject),
      this.commonService.getDatesWithTransfersForSOV(this.vesselObject),
    ).subscribe(([genData, transferDates]) => {
      this.dateData.general = genData;
      this.dateData.transfer = transferDates;
      this.pushSailingDates();
    });
  }

  updateV2vTotal(total) {
    this.v2vPaxCargoTotals = total;
  }

  pushSailingDates() {
    if (this.dateData.transfer && this.dateData.general) {
      const transferDates = [];
      const transitDates = [];
      const otherDates = [];
      let formattedDate;
      let hasTransfers: boolean;
      this.dateData.general.forEach(generalDataInstance => {
        formattedDate = this.datetimeService.JSDateYMDToObjectDate(
          this.datetimeService.MatlabDateToJSDateYMD(
            generalDataInstance.dayNum
          )
        );
        hasTransfers = this.dateData.transfer.reduce(
          (acc, val) => acc || val === generalDataInstance.dayNum,
          false
        );
        if (generalDataInstance.distancekm && hasTransfers) {
          transferDates.push(formattedDate);
        } else if (generalDataInstance.distancekm) {
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
    }
  }

  private switchUnit(
    value: number | string,
    oldUnit: string,
    newUnit: string
  ) {
    return this.calculationService.switchUnitAndMakeString(
      value,
      oldUnit,
      newUnit
    );
  }

  GetMatlabDurationToMinutes(serial) {
    return this.datetimeService.MatlabDurationToMinutes(serial);
  }

  // Properly change undefined values to N/a
  // For number resets to decimal, ONLY specify the ones needed, don't reset time objects
  CheckForNullValues() {
    let naCountGangway = 0;
    this.sovModel.sovInfo = this.calculationService.ReplaceEmptyColumnValues(
      this.sovModel.sovInfo
    );
    this.sovModel.sovInfo.distancekm = this.calculationService.GetDecimalValueForNumber(
      this.sovModel.sovInfo.distancekm
    );
    if (this.sovModel.sovType === SovType.Turbine) {
      this.sovModel.turbineTransfers.forEach(transfer => {
        transfer.gangwayUtilisation === undefined ||
          transfer.gangwayUtilisation === '_NaN_'
          ? naCountGangway++
          : (naCountGangway = naCountGangway);
        transfer = this.calculationService.ReplaceEmptyColumnValues(
          transfer
        );
        transfer.duration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.duration
          )
        );
        transfer.gangwayDeployedDuration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.gangwayDeployedDuration
          )
        );
        transfer.gangwayReadyDuration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.gangwayReadyDuration
          )
        );
        transfer.gangwayUtilisation = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.gangwayUtilisation
          )
        );
        transfer.peakWindGust = <any>(
          this.switchUnit(
            transfer.peakWindGust,
            'km/h',
            this.settings.unit_speed
          )
        );
        transfer.peakWindAvg = <any>(
          this.switchUnit(
            transfer.peakWindAvg,
            'km/h',
            this.settings.unit_speed
          )
        );
      });
      this.gangwayActive = naCountGangway !== this.sovModel.turbineTransfers.length;
    } else if (this.sovModel.sovType === SovType.Platform) {
      this.sovModel.platformTransfers.forEach(transfer => {
        transfer.gangwayUtilisation === undefined ||
          transfer.gangwayUtilisation === '_NaN_'
          ? naCountGangway++
          : (naCountGangway = naCountGangway);
        transfer = this.calculationService.ReplaceEmptyColumnValues(
          transfer
        );
        transfer.totalDuration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.totalDuration
          )
        );
        transfer.gangwayDeployedDuration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.gangwayDeployedDuration
          )
        );
        transfer.gangwayReadyDuration = <any>(
          this.calculationService.GetDecimalValueForNumber(
            transfer.gangwayReadyDuration
          )
        );
        transfer.peakWindGust = <any>(
          this.switchUnit(
            transfer.peakWindGust,
            'km/h',
            this.settings.unit_speed
          )
        );
        transfer.peakWindAvg = <any>(
          this.switchUnit(
            transfer.peakWindAvg,
            'km/h',
            this.settings.unit_speed
          )
        );
        transfer.Hs = this.GetDecimalValueForNumber(transfer.Hs, ' m');
        transfer.gangwayUtilisationLimiter = this.formatGangwayLimiter(
          transfer.gangwayUtilisationLimiter
        );
      });
      this.gangwayActive = naCountGangway !== this.sovModel.platformTransfers.length;
    } else {
      this.gangwayActive = false;
    }
    if (this.sovModel.transits.length > 0) {
      this.sovModel.transits.forEach(transit => {
        transit = this.calculationService.ReplaceEmptyColumnValues(
          transit
        );
      });
    }
    if (this.sovModel.vessel2vessels.length > 0) {
      this.sovModel.vessel2vessels.forEach(vessel2vessel => {
        vessel2vessel.CTVactivity = this.calculationService.ReplaceEmptyColumnValues(
          vessel2vessel.CTVactivity
        );
        vessel2vessel.transfers.forEach(transfer => {
          transfer = this.calculationService.ReplaceEmptyColumnValues(
            transfer
          );
          transfer.duration = <any>(
            this.calculationService.GetDecimalValueForNumber(
              transfer.duration
            )
          );
          transfer.peakWindGust = this.switchUnit(
            transfer.peakWindGust,
            'km/h',
            this.settings.unit_speed
          );
          transfer.peakWindAvg = this.switchUnit(
            transfer.peakWindAvg,
            'km/h',
            this.settings.unit_speed
          );
        });
      });
    }
  }

  setDefaultActiveTab(): void {
    switch (this.tokenInfo.userPermission) {
      case 'admin':
        this.activeTab = 'summary';
        break;
      case 'Logistics specialist':
        this.activeTab = 'summary';
        break;
      case 'Marine controller':
        this.activeTab = 'sov-dpr-input';
        break;
      case 'Vessel master':
        this.activeTab = 'sov-dpr-input';
        break;
      default:
        this.activeTab = 'summary';
    }
  }

  objectToInt(objectvalue): number {
    return this.calculationService.objectToInt(objectvalue);
  }

  GetMatlabDateToJSTime(serial) {
    return this.datetimeService.MatlabDateToJSTime(serial);
  }

  getMatlabDateToCustomJSTime(serial, format) {
    return this.datetimeService.MatlabDateToCustomJSTime(serial, format);
  }

  GetDecimalValueForNumber(value, endpoint = null) {
    return this.calculationService.GetDecimalValueForNumber(
      value,
      endpoint
    );
  }

  formatGangwayLimiter(raw_limiter: string) {
    switch (raw_limiter) {
      case 'tele_pos':
        return 'Telescopic position';
      case 'boom_ang':
        return 'Booming angle';
      default:
        return raw_limiter;
    }
  }

  private ResetTransfers() {
    this.sovModel = new SovModel();
    this.showContent = false;
    this.fieldName = '';
    this.hseDprApproval = 0;
    this.dprApproval = 0;
  }
}
