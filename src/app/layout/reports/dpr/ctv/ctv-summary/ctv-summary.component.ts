// Third party dependencies
import { Component, Input, OnChanges } from "@angular/core";
import { map, catchError } from "rxjs/operators";

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
export class CtvSummaryComponent implements OnChanges {
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

  private _consumptionWidget: CtvConsumptionWidgetModel = {
    fuel: {
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
    water: {
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
    shorePower: {
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
  };

  private _accessDayTypeOptions: selectOption<CtvAccessDayType>[] = [
    { label: "Full access", value: CtvAccessDayType.FullAccess },
    { label: "Half access", value: CtvAccessDayType.HalfAccess },
    { label: "Weather day", value: CtvAccessDayType.WeatherDay },
    { label: "Not required", value: CtvAccessDayType.NotRequired },
    { label: "Maintenance", value: CtvAccessDayType.Maintenance },
    { label: "Off contract", value: CtvAccessDayType.OffContract },
  ];

  private _accessDayType: CtvAccessDayType = CtvAccessDayType.Unselected;

  private _hoursOnHire: number = 0;

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

  private _weatherDowntimeTimeOptions =
    this.dateService.createTimesQuarterHour();

  private _weatherDowntimeWidget: CtvWeatherDowntimeRowOptionsModel[] = [];

  private _handleWeatherDowntimeAddLineClicked() {
    this._weatherDowntimeWidget.push({
      decidedBy: CtvWeatherDowntimeDecidingParties.Charterer,
      from: "00:00",
      to: "00:00",
    });
  }

  private _handleWeatherDowntimeDeleteLastClicked() {
    this._weatherDowntimeWidget.pop();
  }

  private _HSECountTotalAmountOf(input: CtvHSERowOptionModel[]): number {
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

  private _HSESOCCards: CtvHSERowOptionModel[] = [];
  private _HSESOCRemoveLastCardButtonEnabled = false;

  private _handleSOCAddCardClicked() {
    this._HSESOCCards.push(this._HSEEmptyRowOption());
  }

  private _handleSOCRemoveLastCardClicked() {
    this._HSESOCCards.pop();
  }

  private _handleSOCRemoveCardWithIndex(index: number) {
    this._HSESOCCards.splice(index, 1);
  }

  private _HSEToolboxTalks: CtvHSERowOptionModel[] = [];
  private _HSEToolboxTalksRemoveLastButtonEnabled = false;

  private _handleToolboxTalksAddClicked() {
    this._HSEToolboxTalks.push(this._HSEEmptyRowOption());
  }

  private _handleToolboxTalksRemoveLastClicked() {
    this._HSEToolboxTalks.pop();
  }

  private _handleToolboxTalksRemoveWithIndex(index: number) {
    this._HSEToolboxTalks.splice(index, 1);
  }

  private _HSEDrills: CtvHSEDrillOptionModel[] = [];
  private _HSEDrillsRemoveLastButtonEnabled = false;

  private _handleDrillsAddClicked() {
    this._HSEDrills.push({
      ...this._HSEEmptyRowOption(),
      involvedPassengers: false,
    });
  }

  private _handleDrillsRemoveLastClicked() {
    this._HSEDrills.pop();
  }

  private _handleDrillsRemoveWithIndex(index: number) {
    this._HSEDrills.splice(index, 1);
  }

  public fuelConsumedValue = "0 liter";
  public tripEfficiency = "N/a";

  constructor(
    private alert: AlertService,
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService,
    public permission: PermissionService,
    public settings: SettingsService
  ) {}

  ngOnChanges() {
    if (this.engine && this.general && this.general.sailedDistance) {
      this.tripEfficiency = this.calcService.getFuelEcon(
        this.engine.fuelUsedTotalM3,
        this.general.sailedDistance,
        this.settings.unit_distance
      );
    }
    this.setValueForFuelConsumed();
  }

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

interface CtvConsumptionWidgetModel {
  fuel: CtvConsumptionUnitOptionsModel;
  water: CtvConsumptionUnitOptionsModel;
  shorePower: CtvConsumptionUnitOptionsModel;
}

interface CtvConsumptionUnitOptionsModel {
  used: number;
  remainingOnBoard: number;
  bunkered: number;
}

enum CtvAccessDayType {
  FullAccess = "FULL_ACCESS",
  HalfAccess = "HALF_ACCESS",
  WeatherDay = "WEATHER_DAY",
  NotRequired = "NOT_REQUIRED",
  Maintenance = "MAINTENANCE",
  OffContract = "OFF_CONTRACT",
  Unselected = "UNSELECTED",
}

interface CtvWeatherDowntimeRowOptionsModel {
  decidedBy: CtvWeatherDowntimeDecidingParties;
  from: TimesQuarterHour;
  to: TimesQuarterHour;
}

enum CtvWeatherDowntimeDecidingParties {
  Charterer = "CHARTERER",
  VesselMaster = "VESSEL_MASTER",
  JointDecision = "JOINT_DECISION",
  Unselected = "UNSELECTED",
}

interface CtvHSERowOptionModel {
  inputReason: string;
  amount: number;
}

interface CtvHSEDrillOptionModel extends CtvHSERowOptionModel {
  involvedPassengers: boolean;
}

type selectOption<A> = { label: string; value: A };
