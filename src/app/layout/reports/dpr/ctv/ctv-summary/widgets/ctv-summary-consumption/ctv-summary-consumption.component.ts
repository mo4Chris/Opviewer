// Third party dependencies
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-ctv-summary-consumption",
  templateUrl: "./ctv-summary-consumption.component.html",
  styleUrls: [
    "../../../ctvreport/ctvreport.component.scss",
    "../../ctv-summary.component.scss",
    "./ctv-summary-consumption.component.scss",
  ],
})
export class CtvSummaryConsumptionComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.consumptionWidgetForm.valueChanges.subscribe((_) => {
      this._syncConsumptionWidgetFormAndModel();
    });

    // TODO: Replace with actual input check
    setTimeout(() => {
      this._startingValuesHaveBeenSet = true;
      this._removeSkeletonOverlay();
    }, 1000);
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
      [Validators.min(0)]
    ),
    consumptionStartOfDayWater: new FormControl(
      this._consumptionWidget.water.startOfDay,
      [Validators.min(0)]
    ),
    consumptionStartOfDayShorePower: new FormControl(
      this._consumptionWidget.shorePower.startOfDay,
      [Validators.min(0)]
    ),
    consumptionUsedFuel: new FormControl(this._consumptionWidget.fuel.used, [
      Validators.min(0),
    ]),
    consumptionUsedWater: new FormControl(this._consumptionWidget.water.used, [
      Validators.min(0),
    ]),
    consumptionUsedShorePower: new FormControl(
      this._consumptionWidget.shorePower.used,
      [Validators.min(0)]
    ),
    consumptionBunkeredFuel: new FormControl(
      this._consumptionWidget.fuel.bunkered,
      [Validators.min(0)]
    ),
    consumptionBunkeredWater: new FormControl(
      this._consumptionWidget.water.bunkered,
      [Validators.min(0)]
    ),
    consumptionBunkeredShorePower: new FormControl(
      this._consumptionWidget.shorePower.bunkered,
      [Validators.min(0)]
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
