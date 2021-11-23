// Third party dependencies
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-ctv-summary-consumption",
  templateUrl: "./ctv-summary-consumption.component.html",
  styleUrls: [
    "../../../ctvreport/ctvreport.component.scss",
    "../../ctv-summary.component.scss",
    "./ctv-summary-consumption.component.scss",
  ],
})
export class CtvSummaryConsumptionComponent implements OnInit, OnDestroy {
  constructor() {}

  private _consumptionWidgetFormSubscription: Subscription;

  ngOnInit(): void {
    this._consumptionWidgetFormSubscription =
      this.consumptionWidgetForm.valueChanges.subscribe((_) => {
        this._syncConsumptionWidgetFormAndModel();
      });

    // TODO: Replace with actual input check
    setTimeout(() => {
      this._startingValuesHaveBeenSet = true;
      this._removeSkeletonOverlay();
    }, 1000);
  }

  ngOnDestroy(): void {
    this._consumptionWidgetFormSubscription.unsubscribe();
  }

  public get showSkeletonOverlay() {
    return this._showSkeletonOverlay;
  }

  public get startingValuesHaveBeenSet() {
    return this._startingValuesHaveBeenSet;
  }

  public get consumptionWidget() {
    return this._consumptionWidget;
  }

  private _showSkeletonOverlay = true;

  private _removeSkeletonOverlay() {
    setTimeout(() => {
      this._showSkeletonOverlay = false;
    }, 300);
  }

  private _startingValuesHaveBeenSet = false;

  private _consumptionWidget: CtvConsumptionWidgetModel = {
    fuel: {
      startOfDay: 0,
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
    water: {
      startOfDay: 0,
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
    shorePower: {
      startOfDay: 0,
      used: 0,
      remainingOnBoard: 0,
      bunkered: 0,
    },
  };

  private _defaultValidators = [
    Validators.min(0),
    Validators.pattern(/([0-9]*[.])?[0-9]+/),
  ];

  public consumptionWidgetForm = new FormGroup({
    consumptionStartOfDayFuel: new FormControl(
      this._consumptionWidget.fuel.startOfDay,
      this._defaultValidators
    ),
    consumptionStartOfDayWater: new FormControl(
      this._consumptionWidget.water.startOfDay,
      this._defaultValidators
    ),
    consumptionStartOfDayShorePower: new FormControl(
      this._consumptionWidget.shorePower.startOfDay,
      this._defaultValidators
    ),
    consumptionUsedFuel: new FormControl(
      this._consumptionWidget.fuel.used,
      this._defaultValidators
    ),
    consumptionUsedWater: new FormControl(
      this._consumptionWidget.water.used,
      this._defaultValidators
    ),
    consumptionUsedShorePower: new FormControl(
      this._consumptionWidget.shorePower.used,
      this._defaultValidators
    ),
    consumptionBunkeredFuel: new FormControl(
      this._consumptionWidget.fuel.bunkered,
      this._defaultValidators
    ),
    consumptionBunkeredWater: new FormControl(
      this._consumptionWidget.water.bunkered,
      this._defaultValidators
    ),
    consumptionBunkeredShorePower: new FormControl(
      this._consumptionWidget.shorePower.bunkered,
      this._defaultValidators
    ),
  });

  private _syncConsumptionWidgetFormAndModel(): void {
    const {
      consumptionStartOfDayFuel,
      consumptionStartOfDayWater,
      consumptionStartOfDayShorePower,
      consumptionUsedFuel,
      consumptionUsedWater,
      consumptionUsedShorePower,
      consumptionBunkeredFuel,
      consumptionBunkeredWater,
      consumptionBunkeredShorePower,
    } = this.consumptionWidgetForm.value;
    this._consumptionWidget = {
      fuel: {
        startOfDay: consumptionStartOfDayFuel,
        used: consumptionUsedFuel,
        bunkered: consumptionBunkeredFuel,
        remainingOnBoard:
          consumptionStartOfDayFuel -
          consumptionUsedFuel +
          consumptionBunkeredFuel,
      },
      water: {
        startOfDay: consumptionStartOfDayWater,
        used: consumptionUsedWater,
        bunkered: consumptionBunkeredWater,
        remainingOnBoard:
          consumptionStartOfDayWater -
          consumptionUsedWater +
          consumptionBunkeredWater,
      },
      shorePower: {
        startOfDay: consumptionStartOfDayShorePower,
        used: consumptionUsedShorePower,
        bunkered: consumptionBunkeredShorePower,
        remainingOnBoard:
          consumptionStartOfDayShorePower -
          consumptionUsedShorePower +
          consumptionBunkeredShorePower,
      },
    };
  }
}

interface CtvConsumptionWidgetModel {
  fuel: CtvConsumptionUnitOptionsModel;
  water: CtvConsumptionUnitOptionsModel;
  shorePower: CtvConsumptionUnitOptionsModel;
}

interface CtvConsumptionUnitOptionsModel {
  startOfDay: number;
  used: number;
  remainingOnBoard: number;
  bunkered: number;
}
