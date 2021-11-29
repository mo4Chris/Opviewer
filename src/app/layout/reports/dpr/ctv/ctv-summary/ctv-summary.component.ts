// Third party dependencies
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  Output,
} from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { of, Subscription } from "rxjs";
import { map, catchError, finalize } from "rxjs/operators";
import { Moment } from "moment";

// Services
import { AlertService } from "@app/supportModules/alert.service";
import { CommonService } from "@app/common.service";
import { DatetimeService } from "@app/supportModules/datetime.service";
import { CalculationService } from "@app/supportModules/calculation.service";
import { PermissionService } from "@app/shared/permissions/permission.service";
import { SettingsService } from "@app/supportModules/settings.service";

// Models
import { CTVGeneralStatsModel } from "../../models/generalstats.model";
import { TokenModel } from "@app/models/tokenModel";
import { CTVDprInputModel } from "../ctvreport/ctvreport.component";
import { CtvConsumptionWidgetModel } from "./widgets/ctv-summary-consumption/ctv-summary-consumption.component";

// Types
import { TimesQuarterHour } from "@app/supportModules/datetime.service";

@Component({
  selector: "app-ctv-summary",
  templateUrl: "./ctv-summary.component.html",
  styleUrls: [
    "./ctv-summary.component.scss",
    "../ctvreport/ctvreport.component.scss",
  ],
})
export class CtvSummaryComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private alert: AlertService,
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService,
    public permission: PermissionService,
    public settings: SettingsService
  ) {}

  @Input() public data: CTVDprInputModel;
  @Output() public consumptionData: CtvConsumptionWidgetModel;

  private _prevData: CTVDprInputModel;

  public get dataReady() {
    return this._dataReady;
  }

  private _dataReady = false;

  public get showSkeletonOverlay() {
    return this._showSkeletonOverlay;
  }

  private _showSkeletonOverlay = true;

  private _hoursOnHireGroupFormSubscription: Subscription;

  ngOnInit(): void {
    this._hoursOnHireGroupFormSubscription =
      this.hoursOnHireGroupForm.valueChanges.subscribe((_) => {
        this._syncHoursOnHireGroupFormAndModels();
      });
  }

  ngOnChanges(): void {
    if (this.engine && this.general && this.general.sailedDistance) {
      this.tripEfficiency = this.calcService.getFuelEcon(
        this.engine.fuelUsedTotalM3,
        this.general.sailedDistance,
        this.settings.unit_distance
      );
    }
    this.setValueForFuelConsumed();

    if (this._prevData) {
      if (
        this._prevData.date !== this.data.date ||
        this._prevData.mmsi !== this.data.mmsi
      ) {
        this._showSkeletonOverlay = true;
        this._dataReady = false;
      }
    }

    if (this._dataReady) {
      this._removeSkeletonOverlay();
    } else {
      if (this.data) {
        this._setupData(this.data);
      }
    }
  }

  ngOnDestroy(): void {
    this._hoursOnHireGroupFormSubscription.unsubscribe();
  }

  @Input() general: CTVGeneralStatsModel;
  @Input() generalInputStats: CtvGeneralInputStatsModel;
  @Input() engine: CtvEngineModel;
  @Input() visitedPark: string;
  @Input() tokenInfo: TokenModel; // ToDo remove in favour of permission service

  toolboxOptions = [
    "Bunkering OPS",
    "2 man lifting",
    "Battery maintenance",
    "Bird survey",
    "Working on engines",
    "using dock craine",
    "lifting between vessel and TP",
    "Power washing",
    "Daily slinging and craning",
    "Fueling substation",
    "gearbox oil change",
    "servicing small generator",
    "Replacing bow fender straps",
    "Main engine oil and filter changed",
    "Generator service",
    "Craining ops",
    "Bunkering at fuel barge",
    "New crew",
  ];

  drillOptions = [
    "Man over board",
    "Abandon ship",
    "Fire",
    "Oil Spill",
    "Other drills",
  ];

  private _setupData(data: CTVDprInputModel) {
    this.consumptionData = data.consumption;

    this.HSESOCCards = data.HSE.SOCCards;
    this.HSEToolboxTalks = data.HSE.toolboxTalks;
    this.HSEDrills = data.HSE.drills;

    this.accessDayType = data.accessDayType;

    this._hoursOnHire = data.amountOfHoursOnHire;
    this.hoursOnHireGroupForm.controls.hoursOnHireForm.setValue(
      data.amountOfHoursOnHire
    );
    this._engineHours = data.engineHours;
    this.hoursOnHireGroupForm.controls.engineHoursForm.setValue(
      data.engineHours
    );

    this.weatherDowntimeWidget = data.weatherDowntime;

    this._prevData = data;
    this._dataReady = true;
  }

  private _removeSkeletonOverlay() {
    setTimeout(() => {
      this._showSkeletonOverlay = false;
    }, 300);
  }

  // Access day type

  public get accessDayTypeOptions() {
    return this._accessDayTypeOptions;
  }

  private _accessDayTypeOptions: selectOption<CtvAccessDayType>[] = [
    { label: "Full access", value: CtvAccessDayType.FullAccess },
    { label: "Half access", value: CtvAccessDayType.HalfAccess },
    { label: "Weather day", value: CtvAccessDayType.WeatherDay },
    { label: "Not required", value: CtvAccessDayType.NotRequired },
    { label: "Maintenance", value: CtvAccessDayType.Maintenance },
    { label: "Off contract", value: CtvAccessDayType.OffContract },
  ];

  public accessDayType: CtvAccessDayType = CtvAccessDayType.Unselected;

  // Hours on hire group

  private _defaultNumberValidators = [
    Validators.min(0),
    Validators.pattern(/([0-9]*[.])?[0-9]+/),
  ];

  private _hoursOnHire: number = 0;

  private _engineHours: number = 0;

  public hoursOnHireGroupForm = new FormGroup({
    hoursOnHireForm: new FormControl(
      this._hoursOnHire,
      this._defaultNumberValidators
    ),
    engineHoursForm: new FormControl(
      this._engineHours,
      this._defaultNumberValidators
    ),
  });

  private _syncHoursOnHireGroupFormAndModels() {
    const { hoursOnHireForm, engineHoursForm } =
      this.hoursOnHireGroupForm.value;

    this._hoursOnHire = hoursOnHireForm;
    this._engineHours = engineHoursForm;
  }

  // Weather downtime

  public get weatherDownTimeDecidedByOptions() {
    return this._weatherDownTimeDecidedByOptions;
  }

  private _weatherDownTimeDecidedByOptions: selectOption<CtvWeatherDowntimeDecidingParties>[] =
    [
      {
        label: "Charterer",
        value: CtvWeatherDowntimeDecidingParties.Charterer,
      },
      {
        label: "Vessel master",
        value: CtvWeatherDowntimeDecidingParties.VesselMaster,
      },
      {
        label: "Joint decision",
        value: CtvWeatherDowntimeDecidingParties.JointDecision,
      },
    ];

  public get weatherDowntimeTimeOptions() {
    return this._weatherDowntimeTimeOptions;
  }

  private _weatherDowntimeTimeOptions =
    this.dateService.createTimesQuarterHour();

  public weatherDowntimeWidget: CtvWeatherDowntimeRowOptionsModel[] = [];

  public handleWeatherDowntimeAddLineClicked() {
    this.weatherDowntimeWidget.push({
      decidedBy: CtvWeatherDowntimeDecidingParties.Charterer,
      from: "00:00",
      to: "00:00",
    });
  }

  public handleWeatherDowntimeDeleteLastClicked() {
    this.weatherDowntimeWidget.pop();
  }

  // Saving access day type + hours + weather downtime

  public get checkAccessHoursWeather() {
    return this._checkAccessHoursWeather();
  }

  private _checkAccessHoursWeather() {
    return (
      this.accessDayType !== "" && this.hoursOnHireGroupForm.status === "VALID"
    );
  }

  private _isSavingAccessHoursWeather = false;

  public get isSavingAccessHoursWeather() {
    return this._isSavingAccessHoursWeather;
  }

  private _lastSaveAccessHoursWeather: Moment | undefined;

  public get lastSaveAccessHoursWeather() {
    return this._lastSaveAccessHoursWeather;
  }

  private _saveErrorAccessHoursWeather: Moment | false;

  public get saveErrorAccessHoursWeather() {
    return this._saveErrorAccessHoursWeather;
  }

  public saveAccessHoursWeather() {
    if (!this.checkAccessHoursWeather) {
      return;
    }
    this._isSavingAccessHoursWeather = true;

    let lastValue;
    this.newService
      .updateCtvDprAccessHoursWeather(this.data.mmsi, this.data.date, {
        accessDayType: this.accessDayType,
        amountOfHoursOnHire: this._hoursOnHire,
        engineHours: this._engineHours,
        weatherDowntime: this.weatherDowntimeWidget,
      })
      .pipe(
        catchError((err) => of(err)),
        finalize(() => {
          this._isSavingAccessHoursWeather = false;
          if (lastValue instanceof HttpErrorResponse) {
            this._saveErrorAccessHoursWeather = this.dateService.now();
            return;
          }
          this._saveErrorAccessHoursWeather = false;
          this._lastSaveAccessHoursWeather = this.dateService.now();
        })
      )
      .subscribe((v) => (lastValue = v));
  }

  // HSE

  public HSECountTotalAmountOf(input: CtvHSERowOptionModel[]): number {
    const onlyNumbers = input.map(({ amount }) => amount);
    const reducable = [0, ...onlyNumbers];
    const totalAmount = reducable.reduce((prev, curr) => {
      return prev + curr;
    });
    return totalAmount;
  }

  private _HSEEmptyRowOption(): CtvHSERowOptionModel {
    return {
      inputReason: "",
      amount: 1,
    };
  }

  public HSESOCCards: CtvHSERowOptionModel[] = [];
  public HSESOCRemoveLastCardButtonEnabled = false;

  public handleSOCAddCardClicked() {
    this.HSESOCFormCheck();
    this.HSESOCCards.push(this._HSEEmptyRowOption());
  }

  public handleSOCRemoveLastCardClicked() {
    this.HSESOCCards.pop();
    this.HSESOCFormCheck();
  }

  public handleSOCRemoveCardWithIndex(index: number) {
    this.HSESOCCards.splice(index, 1);
    this.HSESOCFormCheck();
  }

  public HSESOCFormStatus = {
    emptyInputReason: false,
    badAmount: false,
  };

  public HSESOCFormCheck() {
    const the = (condition) => this.HSESOCCards.filter(condition).length > 0;

    if (the((card) => card.amount <= 0)) {
      this.HSESOCFormStatus.badAmount = true;
    } else {
      this.HSESOCFormStatus.badAmount = false;
    }

    if (the((card) => card.inputReason.length === 0)) {
      this.HSESOCFormStatus.emptyInputReason = true;
    } else {
      this.HSESOCFormStatus.emptyInputReason = false;
    }
  }

  public HSEToolboxTalks: CtvHSERowOptionModel[] = [];
  public HSEToolboxTalksRemoveLastButtonEnabled = false;

  public handleToolboxTalksAddClicked() {
    this.HSEToolboxTalksFormCheck();
    this.HSEToolboxTalks.push(this._HSEEmptyRowOption());
  }

  public handleToolboxTalksRemoveLastClicked() {
    this.HSEToolboxTalks.pop();
    this.HSEToolboxTalksFormCheck();
  }

  public handleToolboxTalksRemoveWithIndex(index: number) {
    this.HSEToolboxTalks.splice(index, 1);
    this.HSEToolboxTalksFormCheck();
  }

  public HSEToolboxTalksFormStatus = {
    emptyInputReason: false,
    badAmount: false,
  };

  public HSEToolboxTalksFormCheck() {
    const the = (condition) =>
      this.HSEToolboxTalks.filter(condition).length > 0;

    if (the((talk) => talk.amount <= 0)) {
      this.HSEToolboxTalksFormStatus.badAmount = true;
    } else {
      this.HSEToolboxTalksFormStatus.badAmount = false;
    }

    if (the((talk) => talk.inputReason.length === 0)) {
      this.HSEToolboxTalksFormStatus.emptyInputReason = true;
    } else {
      this.HSEToolboxTalksFormStatus.emptyInputReason = false;
    }
  }

  public HSEDrills: CtvHSEDrillOptionModel[] = [];
  public HSEDrillsRemoveLastButtonEnabled = false;

  public handleDrillsAddClicked() {
    this.HSEDrillsFormCheck();
    this.HSEDrills.push({
      ...this._HSEEmptyRowOption(),
      involvedPassengers: false,
    });
  }

  public handleDrillsRemoveLastClicked() {
    this.HSEDrills.pop();
    this.HSEDrillsFormCheck();
  }

  public handleDrillsRemoveWithIndex(index: number) {
    this.HSEDrills.splice(index, 1);
    this.HSEDrillsFormCheck();
  }

  public HSEDrillsFormStatus = {
    emptyInputReason: false,
    badAmount: false,
  };

  public HSEDrillsFormCheck() {
    const the = (condition) => this.HSEDrills.filter(condition).length > 0;

    if (the((drill) => drill.amount <= 0)) {
      this.HSEDrillsFormStatus.badAmount = true;
    } else {
      this.HSEDrillsFormStatus.badAmount = false;
    }

    if (the((drill) => drill.inputReason.length === 0)) {
      this.HSEDrillsFormStatus.emptyInputReason = true;
    } else {
      this.HSEDrillsFormStatus.emptyInputReason = false;
    }
  }

  // Fuel

  public fuelConsumedValue = "0 liter";
  public tripEfficiency = "N/a";

  // TODO: The subscription in the method below needs to be unsubscribed at onDestroy.

  saveGeneralStats() {
    // ToDo We need some way to trigger this function
    this.newService
      .saveCTVGeneralStats(this.generalInputStats)
      .pipe(
        map((res) => {
          this.alert.sendAlert({ text: res.data, type: "success" });
        }),
        catchError((error) => {
          this.alert.sendAlert({ text: error, type: "danger" });
          throw error;
        })
      )
      .subscribe();
  }

  // Computed-like methods for template

  setValueForFuelConsumed() {
    if (
      this.generalInputStats?.fuelConsumption &&
      this.generalInputStats.fuelConsumption > 0
    ) {
      this.fuelConsumedValue = this.roundNumber(
        this.generalInputStats.fuelConsumption,
        10,
        " liter"
      );
    } else if (this.engine?.fuelUsedTotalM3) {
      const val_rnd = this.roundNumber(this.engine.fuelUsedTotalM3, 10);
      this.fuelConsumedValue = this.calcService.switchUnitAndMakeString(
        val_rnd,
        "m3",
        "liter"
      );
    } else {
      this.fuelConsumedValue = this.calcService.switchUnitAndMakeString(
        0,
        "m3",
        "liter"
      );
    }
  }

  matlabDatenumToTimeString(serial) {
    return this.dateService.matlabDatenumToTimeString(serial);
  }

  roundNumber(number: number, decimal = 10, addString = "") {
    return this.calcService.roundNumber(
      number,
      (decimal = decimal),
      (addString = addString)
    );
  }

  switchUnitAndMakeString(
    value: string | number,
    oldUnit: string,
    newUnit: string
  ) {
    return this.calcService.switchUnitAndMakeString(value, oldUnit, newUnit);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  public formatDate(date: Moment): string {
    return date.format("Do MMM YYYY, HH:mm:ss");
  }
}

interface CtvEngineModel {
  fuelUsedTotalM3: number;
  fuelUsedDepartM3: number;
  fuelUsedReturnM3: number;
  fuelUsedTransferM3: number;
  fuelPerHour: number;
  fuelOther: number;
  co2TotalKg: number;
}

interface CtvGeneralInputStatsModel {
  date: number;
  mmsi: number;
  fuelConsumption: number;
  landedOil: number;
  landedGarbage: number;
  toolboxConducted: any[];
  drillsConducted: any[];
  observations: any;
  incidents: any;
  passengers: any;
  customInput: string;
}

export enum CtvAccessDayType {
  FullAccess = "FULL_ACCESS",
  HalfAccess = "HALF_ACCESS",
  WeatherDay = "WEATHER_DAY",
  NotRequired = "NOT_REQUIRED",
  Maintenance = "MAINTENANCE",
  OffContract = "OFF_CONTRACT",
  Unselected = "",
}

export interface CtvWeatherDowntimeRowOptionsModel {
  decidedBy: CtvWeatherDowntimeDecidingParties;
  from: TimesQuarterHour;
  to: TimesQuarterHour;
}

enum CtvWeatherDowntimeDecidingParties {
  Charterer = "CHARTERER",
  VesselMaster = "VESSEL_MASTER",
  JointDecision = "JOINT_DECISION",
  Unselected = "",
}

export interface CtvHSERowOptionModel {
  inputReason: string;
  amount: number;
}

export interface CtvHSEDrillOptionModel extends CtvHSERowOptionModel {
  involvedPassengers: boolean;
}

type selectOption<A> = { label: string; value: A };
