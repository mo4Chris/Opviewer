import { Component, OnInit, Output, EventEmitter, Input, OnChanges,
  ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import * as annotation from 'chartjs-plugin-annotation';
import { CommonService } from '@app/common.service';
import { SovModel } from './models/SovModel';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SovType } from './models/SovType';
import { CalculationService } from '@app/supportModules/calculation.service';
import { SettingsService } from '@app/supportModules/settings.service';
import { AlertService } from '@app/supportModules/alert.service';
import { TokenModel } from '@app/models/tokenModel';
import { V2vPaxTotalModel } from './sov-v2v-transfers/sov-v2v-transfers.component';
import { forkJoin } from 'rxjs';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { DaughtercraftInfoModel } from './sov-dc-transfers/sov-dc-transfers.component';
import { TurbineTransfer } from './models/Transfers/TurbineTransfer';
import { PlatformTransfer } from './models/Transfers/PlatformTransfer';
import { V2vTransfer } from './models/Transfers/vessel2vessel/V2vTransfer';

@Component({
  selector: 'app-sovreport',
  templateUrl: './sovreport.component.html',
  styleUrls: ['./sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovreportComponent implements OnInit, OnChanges {
  @Output() loaded = new EventEmitter<boolean>();
  @Output() sailDates = new EventEmitter<any>();

  @Input() tokenInfo: TokenModel;
  @Input() vesselObject: VesselObjectModel;
  @Input() printMode: number;


  sovModel: SovModel = new SovModel();
  dprInput;
  hseDprInput;
  dprApproval;
  hseDprApproval;
  rovOperations = [];
  // This forces reload on all subcomponent, but reduces performance.
  // In the future, we should move to a more workable version where sovModel is
  // replaced when all data is loaded, so reload of other components is automatic
  // rather than having to redraw all html elements
  showContent = false;
  hasDprData = false;
  hasDcEvents = false;
  dcInfo: DaughtercraftInfoModel;

  activeTab: SovDprNavLink = 'sov-summary';

  vesselHasWavespectrum = false;
  waveSpectrumAvailable = false;
  hasGeneral = false;
  hasMissedtransfers = false;

  vesselUtcOffset = 0;
  dateData = { general: undefined, transfer: undefined };

  // used for comparison in the HTML
  SovTypeEnum = SovType;

  gangwayActive = false;
  turbineLocations = new Array<any>();
  fieldName = '';

  // Charts
  backgroundcolors = ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'];
  v2vPaxCargoTotals: V2vPaxTotalModel;

  // Map data
  vesselTrace = {time: [], lon: [], lat: []};

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
  ngOnChanges(changes: SimpleChanges) {
    const keys = Object.keys(changes);
    if (keys.some(_key => _key !== 'printMode')) {
      // New data is only loaded if an input other than printMode is changed
      this.ResetTransfers();
      this.buildPageWhenRouteLoaded();
    }
  }

  buildPageWhenRouteLoaded() {
    this.GetAvailableRouteDatesForVessel();
    forkJoin([
      this.commonService.getSov(this.vesselObject),
      this.commonService.getSovDprInput(this.vesselObject),
      this.commonService.getSovHseDprInput(this.vesselObject),
      this.commonService.getSovInfo(this.vesselObject),
      this.commonService.getVessel2vesselsForSov(
        this.vesselObject.mmsi,
        this.vesselObject.date
      ),
      this.commonService.getSovRovOperations(
        this.vesselObject.mmsi,
        this.vesselObject.date
      ),
    ]).subscribe(
      ([
        sov,
        dprInput,
        hseDprInput,
        sovInfo,
        vessel2vessels,
        rovOpsModel,
      ]) => {
        // Commercial or hse DPR data needs to be loaded even when general is not available
        vessel2vessels.forEach(_v2v => {
          this.setPaxFromDefault(_v2v.transfers);
        });

        this.sovModel.vessel2vessels = vessel2vessels || [];
        this.rovOperations = rovOpsModel.rovOperations || [];
        this.dprInput = dprInput[0];
        this.hseDprInput = hseDprInput[0];
        const dprSigned = dprInput[0] ? dprInput[0].signedOff : {amount: 0};
        const hseSigned = hseDprInput[0] ? hseDprInput[0].signedOff : {amount: 0};

        this.dprApproval = ( dprSigned && dprSigned.amount) ? dprSigned.amount : 0;
        this.hseDprApproval = (hseSigned && hseSigned.amount) ? hseSigned.amount : 0;

        if (sovInfo[0] && typeof sovInfo[0]?.daughtercraft_nicename != 'object') {
          this.dcInfo = {
            mmsi: sovInfo[0]?.daughtercraft_mmsi,
            nicename: sovInfo[0]?.daughtercraft_nicename
          };
        } else if(sovInfo[0]) {
          this.dcInfo = {
            mmsi: 0,
            nicename: 'N/a'
          };
        }

        if (
          sov.length !== 0 &&
          sov[0].seCoverageSpanHours !== '_NaN_'
        ) {
          this.hasGeneral = true;
          this.sovModel.sovInfo = sov[0];
          if (sov[0].utcOffset) {
            // sov utc offset is in days
            this.vesselUtcOffset = 24 * sov[0].utcOffset || 0;
            this.datetimeService.vesselOffsetHours = this.vesselUtcOffset;
          } else {
            this.vesselUtcOffset = 0;
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
            this.commonService.getCycleTimesForSov(
              this.vesselObject.mmsi,
              this.vesselObject.date
            ),
            this.commonService.getSovDistinctFieldnames(
              this.vesselObject
            ),
          ]).subscribe(
            ([
              platformTransfers,
              turbineTransfers,
              cycleTimes,
              sovFieldNames,
            ]) => {
              // All data is loaded beyond this point
              this.setPaxFromDefault(platformTransfers);
              this.setPaxFromDefault(turbineTransfers);

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
              this.hasDcEvents = false;
              if (this.sovModel.vessel2vessels?.length > 0) {
                this.sovModel.vessel2vessels[0].CTVactivity.forEach( v2v => {
                  if (Array.isArray(v2v.turbineVisits)) {
                    v2v.turbineVisits.forEach(visit => {
                      const is_unique_field = !sovFieldNames.some(elt => elt === visit.fieldname)
                      if (is_unique_field ) {
                        sovFieldNames.push( visit.fieldname );
                      }
                    });
                  }
                });
                this.hasDcEvents = this.sovModel.vessel2vessels[0].transfers.some(_transfer => {
                  return _transfer.type === 'Daughter-craft departure' || _transfer.type === 'Daughter-craft return';
                });
              }
              this.loadFieldFromFieldnames(sovFieldNames);

              // This should be intergrated in to the forkJoin
              this.buildPageWhenAllLoaded();
              this.showContent = true;
              this.loaded.emit(true);
            }
          );
        } else {
          // Skip check if all data is loaded if there is none
          if (sov.length > 0) {
            this.sovModel.sovInfo = sov[0];
          }
          this.sovModel.vessel2vessels = vessel2vessels;
          // We need to load in the relevant hse / dpr Input data.
          this.hasGeneral = false;
          this.buildPageWhenAllLoaded();
          this.showContent = true;
          this.loaded.emit(true);
        }
      },
    );
  }

  setMapData() {
    this.vesselTrace = this.sovModel.sovInfo;
  }
  onMapReady(map) {
    // TBI
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
      if (locdata.length == 0) return;
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
      if (this.turbineLocations[0].SiteName) {
        this.fieldName = this.turbineLocations[0].SiteName;
      }
    });
  }

  buildPageWhenAllLoaded() {
    this.hasMissedtransfers = (this.dprInput.missedPaxCargo && this.dprInput.missedPaxCargo.length > 0)
      || (this.dprInput.helicopterPaxCargo && this.dprInput.helicopterPaxCargo.length > 0);
    if (this.sovModel.vessel2vessels.length > 0) {
      this.hasDprData = true;
    } else if (this.permission.sovCommercialWrite) {
      this.hasDprData = true;
    } else if (this.hasMissedtransfers) {
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
    this.setMapData();
  }

  GetAvailableRouteDatesForVessel() {
    forkJoin([
      this.commonService.getDatesShipHasSailedForSov(this.vesselObject),
      this.commonService.getDatesWithTransfersForSOV(this.vesselObject),
    ]).subscribe(([genData, transferDates]) => {
      this.dateData.general = genData;
      this.dateData.transfer = transferDates;
      this.pushSailingDates();
    });
  }

  updateV2vTotal(total: V2vPaxTotalModel) {
    this.v2vPaxCargoTotals = total;
  }

  pushSailingDates() {
    if (!(this.dateData.transfer && this.dateData.general)) return;
    const transferDates = [];
    const transitDates = [];
    const otherDates = [];
    let formattedDate;
    let hasTransfers: boolean;
    this.dateData.general.forEach(generalDataInstance => {
      formattedDate = this.datetimeService.ymdStringToYMD(
        this.datetimeService.matlabDatenumToYmdString(
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
    return this.datetimeService.matlabDurationToMinutes(serial);
  }

  // Properly change undefined values to N/a
  // For number resets to decimal, ONLY specify the ones needed, don't reset time objects
  CheckForNullValues() {
    let naCountGangway = 0;
    this.sovModel.sovInfo = this.calculationService.replaceEmptyFields(
      this.sovModel.sovInfo
    );
    this.sovModel.sovInfo.distancekm = this.calculationService.getDecimalValueForNumber(
      this.sovModel.sovInfo.distancekm
    );
    if (this.sovModel.sovType === SovType.Turbine) {
      this.sovModel.turbineTransfers.forEach(transfer => {
        transfer.gangwayUtilisation === undefined ||
          transfer.gangwayUtilisation === '_NaN_'
          ? naCountGangway++
          : (naCountGangway = naCountGangway);
        transfer = this.calculationService.replaceEmptyFields(
          transfer
        );
        transfer.duration = <any>(
          this.calculationService.getDecimalValueForNumber(
            transfer.duration
          )
        );
        transfer.gangwayDeployedDuration = <any>(
          this.calculationService.getDecimalValueForNumber(
            transfer.gangwayDeployedDuration
          )
        );
        transfer.gangwayReadyDuration = <any>(
          this.calculationService.getDecimalValueForNumber(
            transfer.gangwayReadyDuration
          )
        );
        transfer.gangwayUtilisation = <any>(
          this.calculationService.getDecimalValueForNumber(
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
        transfer.gangwayUtilisationLimiter = this.formatGangwayLimiter(
          transfer.gangwayUtilisationLimiter
        );
      });
      this.gangwayActive = naCountGangway !== this.sovModel.turbineTransfers.length;
    } else if (this.sovModel.sovType === SovType.Platform) {
      this.sovModel.platformTransfers.forEach(transfer => {
        transfer.gangwayUtilisation === undefined ||
          transfer.gangwayUtilisation === '_NaN_'
          ? naCountGangway++
          : (naCountGangway = naCountGangway);
        transfer = this.calculationService.replaceEmptyFields(
          transfer
        );

        transfer.totalDuration = <any>(
          this.calculationService.getDecimalValueForNumber(
            transfer.totalDuration
          )
        );
        transfer.gangwayDeployedDuration = <any>(
          this.calculationService.getDecimalValueForNumber(
            transfer.gangwayDeployedDuration
          )
        );
        transfer.gangwayReadyDuration = <any>(
          this.calculationService.getDecimalValueForNumber(
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
        transfer.Hmax = this.GetDecimalValueForNumber(transfer.Hmax, ' m');
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
        transit = this.calculationService.replaceEmptyFields(
          transit
        );
      });
    }
    if (this.sovModel.vessel2vessels.length > 0) {
      this.sovModel.vessel2vessels.forEach(vessel2vessel => {
        vessel2vessel.CTVactivity = this.calculationService.replaceEmptyFields(
          vessel2vessel.CTVactivity
        );
        vessel2vessel.transfers.forEach(transfer => {
          transfer = this.calculationService.replaceEmptyFields(
            transfer
          );
          transfer.duration = <any>(
            this.calculationService.getDecimalValueForNumber(
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
    // ToDo: this should really be a setting
    switch (this.tokenInfo.userPermission) {
      case 'admin':
        this.activeTab = 'sov-summary';
        break;
      case 'Logistics specialist':
        this.activeTab = 'sov-summary';
        break;
      case 'Marine controller':
        this.activeTab = 'sov-summary';
        break;
      case 'Vessel master':
        this.activeTab = 'sov-input-write';
        break;
      default:
        this.activeTab = 'sov-summary';
    }
  }

  GetMatlabDateToJSTime(serial) {
    return this.datetimeService.matlabDatenumToTimeString(serial);
  }

  getMatlabDateToCustomJSTime(serial, format) {
    return this.datetimeService.matlabDatenumToFormattedTimeString(serial, format);
  }

  GetDecimalValueForNumber(value, endpoint = null) {
    return this.calculationService.getDecimalValueForNumber(
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

  setPaxFromDefault(transfers: anyTransfer[]): void {
    transfers.forEach((_transfer: anyTransfer) => {
      if (_transfer.paxIn !== 'N/a' && typeof (_transfer.paxIn) === 'number') {
        _transfer.paxIn = _transfer.paxIn || 0;
      } else if (_transfer.default_paxIn  !== 'N/a' && typeof (_transfer.default_paxIn) === 'number') {
        _transfer.paxIn = _transfer.default_paxIn || 0;
      } else {
        _transfer.paxIn = 0;
      }

      if (_transfer.paxOut !== 'N/a' && typeof (_transfer.paxOut) === 'number') {
        _transfer.paxOut = _transfer.paxOut || 0;
      } else if (_transfer.default_paxOut  !== 'N/a' && typeof (_transfer.default_paxOut) === 'number') {
        _transfer.paxOut = _transfer.default_paxOut || 0;
      } else {
        _transfer.paxOut = 0;
      }
    });
  }

  private ResetTransfers() {
    this.sovModel = new SovModel();
    this.showContent = false;
    this.fieldName = '';
    this.hseDprApproval = 0;
    this.dprApproval = 0;
    this.dcInfo = null;
    this.v2vPaxCargoTotals = {
      paxIn: 0,
      paxOut: 0,
      cargoIn: 0,
      cargoOut: 0,
    };
  }
}

type anyTransfer = TurbineTransfer | PlatformTransfer | V2vTransfer;

type SovDprNavLink = 'sov-summary' | 'sov-input-read' | 'sov-input-write' | 'sov-commercial' | 'dpr-hse-read' | 'sov-wave-spectrum';
