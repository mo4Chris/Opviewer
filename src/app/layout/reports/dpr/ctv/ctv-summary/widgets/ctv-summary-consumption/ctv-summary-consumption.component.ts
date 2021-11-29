// Third party dependencies
import { Component, Input, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { of, Subscription } from "rxjs";
import { catchError, finalize, last } from "rxjs/operators";
import { Moment } from "moment";

// Services
import { DatetimeService } from "@app/supportModules/datetime.service";
import { CommonService } from "@app/common.service";

@Component({
  selector: "app-ctv-summary-consumption",
  templateUrl: "./ctv-summary-consumption.component.html",
  styleUrls: [
    "../../../ctvreport/ctvreport.component.scss",
    "../../ctv-summary.component.scss",
    "./ctv-summary-consumption.component.scss",
  ],
})
export class CtvSummaryConsumptionComponent
  implements OnInit, OnDestroy, OnChanges
{
  constructor(
    private _datetimeService: DatetimeService,
    private _commonService: CommonService
  ) {}

  @Input() public data: CtvConsumptionWidgetModel;
  @Input() public mmsi: number;
  @Input() public date: number;

  private _prevMmsi: number;
  private _prevDate: number;

  public get dataReady() {
    return this._dataReady;
  }

  private _dataReady = false;

  private _consumptionWidgetFormSubscription: Subscription;

  public get touchedForm() {
    return this._touchedForm;
  }

  private _touchedForm = false;

  ngOnInit(): void {
    this._consumptionWidgetFormSubscription =
      this.consumptionWidgetForm.valueChanges.subscribe((_) => {
        this._touchedForm = true;
        this._syncConsumptionWidgetFormAndModel();
      });
  }

  ngOnDestroy(): void {
    this._consumptionWidgetFormSubscription.unsubscribe();
  }

  ngOnChanges(): void {
    if (this._prevDate && this._prevMmsi) {
      if (this._prevDate !== this.date || this._prevMmsi !== this.mmsi) {
        this._showSkeletonOverlay = true;
        this._dataReady = false;
      }
    }

    if (this._dataReady) {
      this._removeSkeletonOverlay();
      this._check();
    } else {
      if (this.data) {
        this._setupData(this.data);
      }
    }
  }

  private _setupData(data: CtvConsumptionWidgetModel) {
    this.consumptionWidgetForm.controls.consumptionStartOfDayFuel.setValue(
      Number(data.fuel.startOfDay)
    );
    this.consumptionWidgetForm.controls.consumptionStartOfDayWater.setValue(
      Number(data.water.startOfDay)
    );
    this.consumptionWidgetForm.controls.consumptionStartOfDayShorePower.setValue(
      Number(data.shorePower.startOfDay)
    );
    this.consumptionWidgetForm.controls.consumptionUsedFuel.setValue(
      Number(data.fuel.used)
    );
    this.consumptionWidgetForm.controls.consumptionUsedWater.setValue(
      Number(data.water.used)
    );
    this.consumptionWidgetForm.controls.consumptionUsedShorePower.setValue(
      Number(data.shorePower.used)
    );
    this.consumptionWidgetForm.controls.consumptionBunkeredFuel.setValue(
      Number(data.fuel.bunkered)
    );
    this.consumptionWidgetForm.controls.consumptionBunkeredWater.setValue(
      Number(data.water.bunkered)
    );
    this.consumptionWidgetForm.controls.consumptionBunkeredShorePower.setValue(
      Number(data.shorePower.bunkered)
    );

    this._syncConsumptionWidgetFormAndModel();

    this._dataReady = true;
    this._removeSkeletonOverlay();
  }

  public get check() {
    return this._check();
  }

  private _check() {
    const { status } = this.consumptionWidgetForm;
    const { fuel, water, shorePower } = this.consumptionWidget;

    return (
      status === "VALID" &&
      fuel.remainingOnBoard >= 0 &&
      water.remainingOnBoard >= 0 &&
      shorePower.remainingOnBoard >= 0
    );
  }

  public get showSkeletonOverlay() {
    return this._showSkeletonOverlay;
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

  private _isSaving = false;

  public get isSaving() {
    return this._isSaving;
  }

  private _lastSave: Moment | undefined;

  public get lastSave() {
    return this._lastSave;
  }

  private _saveError: Moment | false;

  public get saveError() {
    return this._saveError;
  }

  public formatDate(date: Moment): string {
    return date.format("Do MMM YYYY, HH:mm:ss");
  }

  public save() {
    if (!this.check) {
      return;
    }
    this._isSaving = true;

    let lastValue;
    this._commonService
      .updateCtvDprInputConsumption(
        this.mmsi,
        this.date,
        this.consumptionWidget
      )
      .pipe(
        catchError((err) => of(err)),
        finalize(() => {
          this._isSaving = false;
          if (lastValue instanceof HttpErrorResponse) {
            this._saveError = this._datetimeService.now();
            return;
          }
          this._saveError = false;
          this._lastSave = this._datetimeService.now();
        })
      )
      .subscribe((v) => (lastValue = v));
  }

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

export interface CtvConsumptionWidgetModel {
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
