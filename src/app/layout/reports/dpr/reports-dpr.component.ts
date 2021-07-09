import { Component, OnInit, ElementRef, NgZone, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { CommonService } from '@app/common.service';

import * as moment from 'moment-timezone';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { CalculationService } from '@app/supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { UserService } from '@app/shared/services/user.service';

import { EventService } from '@app/supportModules/event.service';
import { VesselModel } from '@app/models/vesselModel';
import { TokenModel } from '@app/models/tokenModel';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { Hotkeys } from '@app/supportModules/hotkey.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-reports-dpr',
  templateUrl: './reports-dpr.component.html',
  styleUrls: ['./reports-dpr.component.scss'],
  animations: [routerTransition()],
})
export class ReportsDprComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public routeService: RouterService,
    private newService: CommonService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private userService: UserService,
    private eventService: EventService,
    public permission: PermissionService,
    private hotkeys: Hotkeys,
    private ref: ChangeDetectorRef,
    ) {
  }

  startDate = this.getInitialDateObject();
  maxDate = this.initMaxDate();
  outsideDays = 'collapsed';
  vesselObject: VesselObjectModel = {
    date: this.getInitialDate(),
    mmsi: this.getMMSIFromParameter(),
    dateNormal: '',
    vesselType: null,
    vesselName: '',
  };

  datePickerValue = this.startDate;
  sailDates: SailDates;
  vessels: VesselModel[];

  tokenInfo: TokenModel = TokenModel.load(this.userService);
  public noPermissionForData = false;
  public loaded = false;

  zoominfo = {
    mapZoomLvl: null,
    latitude: null,
    longitude: null,
  };
  printMode = 0;

  private get isMaxDate() {
    const day_matched = this.datePickerValue.day === this.maxDate.day;
    const month_matched = this.datePickerValue.month === this.maxDate.month
    const year_matched = this.datePickerValue.year === this.maxDate.year
    return year_matched && month_matched && day_matched;
  }

  // Initial load
  ngOnInit() {
    this.hotkeys.addShortcut({keys: 'control.p'}).subscribe(_ => {
      this.printPage(1);
    });
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(async userIsActive => {
      if (!userIsActive) return this.userService.logout();

      this.newService.getVessel().subscribe(_vessels => {
        this.vessels = _vessels;
        this.buildPageWithCurrentInformation();
      });
    });
  }

  // For each change
  onChange(): void {
    this.loaded = false;
    this.eventService.closeLatestAgmInfoWindow();
    const dateAsMatlab = this.getDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.matlabDatenumToYmdString(dateAsMatlab);

    this.buildPageWithCurrentInformation();
  }

  // Callbacks
  public isLoaded(loaded: boolean): void {
    this.loaded = loaded;
  }

  // TODO: make complient with the newly added usertypes
  buildPageWithCurrentInformation() {
    const htmlButton = <HTMLInputElement> document.getElementById('nextDayButton');
    htmlButton.disabled = this.isMaxDate;

    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({
      mmsi: this.vesselObject.mmsi
    }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        // We overwrite the vesselObject to trigger the reload of subcomponents
        this.vesselObject = {
          date: this.vesselObject.date,
          dateNormal: this.dateTimeService.matlabDatenumToYmdString(this.vesselObject.date),
          vesselType: validatedValue[0].operationsClass,
          mmsi: validatedValue[0].mmsi,
          vesselName: validatedValue[0].nicename,
        };
      } else {
        this.noPermissionForData = true;
      }
    });
  }

  printPage(printtype: number) {
    if (this.vesselObject.vesselType === 'OSV' || this.vesselObject.vesselType === 'SOV') {
      this.printMode = printtype;
      setTimeout(() => {
        this._doPrint(true);
      }, 2000);
    } else {
      this._doPrint();
    }
  }

  private _doPrint(resetPrint?: boolean) {
    const component = this;
    const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
    for (let _i = 0; _i < containers.length; _i++) {
      const container = <HTMLDivElement> containers[_i];
      container.style.width = '210mm';
    }
    setTimeout(function() {
      window.print();
      if (resetPrint) {
        component.printMode = 0;
        component.ref.detectChanges();
      }
    });
  }

  ///////////////////////////////////////////////////
  hasSailedTransfer(date: NgbDateStruct) {
    if (!this.sailDates?.transfer) return false;
    return this.dateTimeService.dateHasSailed(date, this.sailDates.transfer);
  }
  hasSailedTransit(date: NgbDateStruct) {
    if (!this.sailDates?.transfer) return false;
    return this.dateTimeService.dateHasSailed(date, this.sailDates.transit);
  }
  hasSailedOther(date: NgbDateStruct) {
    if (!this.sailDates?.transfer) return false;
    return this.dateTimeService.dateHasSailed(date, this.sailDates.other);
  }
  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.matlabDatenumToDmyString(serial);
  }
  getMMSIFromParameter() {
    let mmsi: number;
    this.route.params.subscribe(params => mmsi = parseFloat(params.mmsi));
    return mmsi; // This is so not ok...
  }
  getDateFromParameter() {
    let matlabDate: number;
    this.route.params.subscribe(params => matlabDate = parseFloat(params.date));
    return matlabDate;
  }
  getInitialDate() {
    const matlabDate = this.getDateFromParameter();
    if (isNaN(matlabDate)) return this.dateTimeService.getMatlabDateYesterday();
    return matlabDate;
  }
  getDateAsMatlab(): any {
    return this.dateTimeService.ngbDateToMatlabDatenum(this.datePickerValue);
  }
  getInitialDateObject() {
    return this.dateTimeService.matlabDatenumToYMD(this.getInitialDate());
  }
  initMaxDate() {
    const curr = moment().add(-1, 'days');
    return {
      year: curr.year(),
      month: curr.month() + 1,
      day: curr.date()
    };
  }
  getInitialDateNormal() {
    const paramDate = this.getDateFromParameter();
    if (isNaN(paramDate)) return this.dateTimeService.getYmdStringYesterday();
    return this.getMatlabDateToCustomJSTime(paramDate, 'YYYY-MM-DD');
  }
  changeDay(changedDayCount: number) {
    // For moment, junari is month 0
    const oldDate = this.dateTimeService.moment(this.datePickerValue.year, this.datePickerValue.month - 1, this.datePickerValue.day);
    const newDate = oldDate.add(changedDayCount, 'day');
    this.datePickerValue = this.dateTimeService.momentToYMD(newDate);
    this.onChange();
  }
  public setDatesHasSailed(sailDates: SailDates): void {
    this.sailDates = sailDates;
  }
  getMatlabDateToCustomJSTime(serial: number, format: string) {
    return this.dateTimeService.matlabDatenumToFormattedTimeString(serial, format);
  }
  GetDecimalValueForNumber(value: any, endpoint: string): string {
    return this.calculationService.getDecimalValueForNumber(value, endpoint);
  }

}

interface SailDates {
  transfer: object[],
  transit: object[],
  other: object[]
}
