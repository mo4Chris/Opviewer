import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
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
    private permission: PermissionService,
    private hotkeys: Hotkeys,
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
  sailDates: {transfer: object[], transit: object[], other: object[]};
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

  // Initial load
  ngOnInit() {
    this.hotkeys.addShortcut({keys: 'control.p'}).subscribe(_ => {
      this.printPage(1);
    });
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (userIsActive === true) {
        if (this.permission.admin) {
          this.newService.getVessel().subscribe(_vessels => {
            this.vessels = _vessels;
            this.buildPageWithCurrentInformation();
          });
        } else {
          this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
            this.vessels = data;
            this.buildPageWithCurrentInformation();
          });
        }
      } else {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('token');
        this.routeService.routeToLogin();
      }
    });
  }

  // For each change
  onChange(): void {
    this.loaded = false;
    this.eventService.closeLatestAgmInfoWindow();
    const dateAsMatlab = this.getDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

    this.buildPageWithCurrentInformation();
  }

  // Callbacks
  public isLoaded(loaded: boolean): void {
    this.loaded = loaded;
  }

  // TODO: make complient with the newly added usertypes
  buildPageWithCurrentInformation() {
    const htmlButton = <HTMLInputElement> document.getElementById('nextDayButton');
    if (this.datePickerValue.day === this.maxDate.day && this.datePickerValue.month === this.maxDate.month && this.datePickerValue.year === this.maxDate.year) {
      htmlButton.disabled = true;
    } else {
      htmlButton.disabled = false;
    }
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({
      mmsi: this.vesselObject.mmsi
    }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        // We overwrite the vesselObject to trigger the reload of subcomponents
        this.vesselObject = {
          date: this.vesselObject.date,
          dateNormal: this.dateTimeService.MatlabDateToJSDateYMD(this.vesselObject.date),
          vesselType: validatedValue[0].operationsClass,
          mmsi: validatedValue[0].mmsi,
          vesselName: validatedValue[0].nicename,
        };
      } else {
        this.noPermissionForData = true;
      }
    });
  }

  printPage(printtype) {
    if (this.vesselObject.vesselType === 'OSV' || this.vesselObject.vesselType === 'SOV') {
      this.printMode = printtype;
      setTimeout(() => {
        this._doPrint(() => {this.printMode = 0; });
      }, 2000);
    } else {
      this._doPrint();
    }
  }

  private _doPrint(cb?: () => void) {
    const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
    for (let _i = 0; _i < containers.length; _i++) {
      const container = <HTMLDivElement> containers[_i];
      container.style.width = '225mm';
    }
    setTimeout(function() {
      window.print();
      if (cb) {
        cb();
      }
    });
  }

  ///////////////////////////////////////////////////
  hasSailedTransfer(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.sailDates.transfer);
  }
  hasSailedTransit(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.sailDates.transit);
  }
  hasSailedOther(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.sailDates.other);
  }
  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.MatlabDateToJSDate(serial);
  }
  getMMSIFromParameter() {
    let mmsi: number;
    this.route.params.subscribe(params => mmsi = parseFloat(params.mmsi));
    return mmsi;
  }
  getDateFromParameter() {
    let matlabDate: number;
    this.route.params.subscribe(params => matlabDate = parseFloat(params.date));
    return matlabDate;
  }
  getInitialDate() {
    const matlabDate = this.getDateFromParameter();
    if (isNaN(matlabDate)) {
      return this.dateTimeService.getMatlabDateYesterday();
    } else {
      return matlabDate;
    }
  }
  getDateAsMatlab(): any {
    const datepickerValueAsMomentDate = moment.utc(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    datepickerValueAsMomentDate.format();
    const momentDateAsIso = moment.utc(datepickerValueAsMomentDate).unix();
    return this.dateTimeService.unixEpochtoMatlabDate(momentDateAsIso);
  }
  getInitialDateObject() {
    return this.dateTimeService.MatlabDateToObject(this.getInitialDate());
  }
  initMaxDate() {
    let curr = moment().add(-1, 'days');
    return {
      year: curr.year(),
      month: curr.month() + 1,
      day: curr.date()
    }
  }
  getInitialDateNormal() {
    const paramDate = this.getDateFromParameter();
    if (isNaN(paramDate)) {
      return this.dateTimeService.getJSDateYesterdayYMD();
    } else {
      return this.getMatlabDateToCustomJSTime(paramDate, 'YYYY-MM-DD');
    }
  }
  changeDay(changedDayCount: number) {
    const oldDate = this.dateTimeService.convertObjectToMoment(this.datePickerValue.year, this.datePickerValue.month, this.datePickerValue.day);
    const newDate = oldDate.add(changedDayCount, 'day');
    this.datePickerValue = this.dateTimeService.convertMomentToObject(newDate);
    this.onChange();
  }
  getDatesHasSailed(sailDates: {transfer: object[], transit: object[], other: object[]}): void {
    this.sailDates = sailDates;
  }

  objectToInt(objectvalue) {
    return this.calculationService.objectToInt(objectvalue);
  }
  getMatlabDateToCustomJSTime(serial, format) {
    return this.dateTimeService.MatlabDateToCustomJSTime(serial, format);
  }
  GetDecimalValueForNumber(value: any, endpoint: string): string {
    return this.calculationService.GetDecimalValueForNumber(value, endpoint);
  }
}