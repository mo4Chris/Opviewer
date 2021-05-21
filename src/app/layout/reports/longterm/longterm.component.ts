import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { routerTransition } from '@app/router.animations';
import * as moment from 'moment-timezone';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@app/shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { VesselModel } from '@app/models/vesselModel';
import { SettingsService } from '@app/supportModules/settings.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { RouterService } from '@app/supportModules/router.service';
// tslint:disable-next-line:import-blacklist
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-reports-longterm',
  templateUrl: './longterm.component.html',
  styleUrls: ['./longterm.component.scss'],
  animations: [routerTransition()],
})

export class LongtermComponent implements OnInit {
  constructor(
    private newService: CommonService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    private routerService: RouterService,
    private userService: UserService,
    private dateTimeService: DatetimeService,
    private settings: SettingsService,
    private alertService: AlertService,
    private permission: PermissionService,
  ) {}

  public vesselObject: LongtermVesselObjectModel = {
    mmsi: [this.getMMSIFromParameter()],
    vesselName: [this.getVesselNameFromParameter()],
    dateMin: this.getMatlabDateLastMonth(),
    dateNormalMin: this.getJSDateLastMonthYMD(),
    dateMax: this.getMatlabDateYesterday(),
    dateNormalMax: this.getJSDateYesterdayYMD()
  };
  public multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false,
  };
  public fieldSelectSettings = {
    idField: '_id',
    allowSearchFilter: true,
    singleSelection: true,
    closeDropDownOnSelection: true,
    textFields: 'text',
  };

  public fromDate = this.getLastMonthObject();
  public toDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 1);
  private _fromDate = copyNgbDate(this.fromDate);
  private _toDate = copyNgbDate(this.toDate);
  private maxDate = this.getMaxDate();
  vesselType: string;
  hoveredDate: NgbDate;
  modalReference: NgbModalRef;
  datePickerValue = this.maxDate;
  Vessels: VesselModel[] = [];
  fieldsWithWavedata = new Array<{ _id: string, site: string, name: string, text?: string }>()
  selectedField = '';

  noPermissionForData = false;
  dropdownValues = [{ mmsi: this.getMMSIFromParameter(), nicename: this.getVesselNameFromParameter() }];
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));

  public get hasValidWaveData() {
    return this.fieldsWithWavedata?.length>0 && this.vesselType=='CTV';
  }

  // onInit
  ngOnInit() {
    if (!this.permission.longterm) {
      this.alertService.sendAlert({
        text: 'User not autorized to view longterm module!',
        type: 'danger'
      })
      this.routerService.routeToDashboard();
      return
    }
    this.route.params.subscribe(params => {
      if (Object.keys(params).length === 0 || params.mmsi === undefined || params.vesselName === undefined) {
        this.routerService.route(['reports']);
      }
    });

    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (userIsActive != true) {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('token');
        return this.routerService.routeToLogin();
      }

      this.noPermissionForData = false;
      Chart.pluginService.register(ChartAnnotation);
      forkJoin([
        this.newService.getFieldsWithWaveSourcesByCompany(),
        this.newService.getVessel(),
        this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi[0] })
      ]).subscribe(([fields, vessels, validatedValue]) => {
        console.log('[fields, vessels, validatedValue]', [fields, vessels, validatedValue])
        if (validatedValue.length != 1) return this.noPermissionForData = true;
        this.vesselType = validatedValue[0]?.operationsClass;
        this.fieldsWithWavedata = fields;
        this.fieldsWithWavedata.forEach(elt => {
          elt.text = elt.site + ' - ' + elt.name;
        });
        this.Vessels = vessels.filter(elt => elt.operationsClass === this.vesselType);
        this.buildPageWithCurrentInformation();
      });
    });
  }

  onSelectVessel(selection?: Array<{mmsi: number, nicename: string, isDisabled: any}>) {
    if (selection) {
      this.vesselObject = {... this.vesselObject, ... {
        mmsi: selection.map(x => x.mmsi),
        vesselName: selection.map(x => x.nicename),
      }};
    } else {
      this.vesselObject = {... this.vesselObject, ... {
        mmsi: this.dropdownValues.map(x => x.mmsi),
        vesselName: this.dropdownValues.map(x => x.nicename),
      }};
    }
    this.buildPageWithCurrentInformation();
  }

  searchTransfersByNewSpecificDate() { // Sets new date and selected vessel values
    const minValueAsMomentDate = moment.utc(this.fromDate.day + '-' + this.fromDate.month + '-' + this.fromDate.year, 'DD-MM-YYYY');
    const maxpickerValueAsMomentDate = moment.utc(this.toDate.day + '-' + this.toDate.month + '-' + this.toDate.year, 'DD-MM-YYYY');
    minValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    minValueAsMomentDate.format();
    maxpickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    maxpickerValueAsMomentDate.format();
    const momentMinDateAsIso = moment(minValueAsMomentDate).unix();
    const dateMinAsMatlab = this.unixEpochtoMatlabDate(momentMinDateAsIso);
    const momentMaxDateAsIso = moment(maxpickerValueAsMomentDate).unix();
    const dateMaxAsMatlab = this.unixEpochtoMatlabDate(momentMaxDateAsIso);
    const mmsiArray = [];
    if (this.dropdownValues && this.dropdownValues.length > 0 && <any> this.dropdownValues[0].mmsi !== []) {
      for (let _j = 0; _j < this.dropdownValues.length; _j++) {
        mmsiArray.push(this.dropdownValues[_j].mmsi);
      }
    }
    this.vesselObject = { ... this.vesselObject, ... {
      mmsi: mmsiArray,
      dateMin:  dateMinAsMatlab,
      dateMax: dateMaxAsMatlab,
      dateNormalMin: this.MatlabDateToJSDateYMD(dateMinAsMatlab),
      dateNormalMax: this.MatlabDateToJSDateYMD(dateMaxAsMatlab)
    }};
    this.buildPageWithCurrentInformation();
  }

  buildPageWithCurrentInformation() {
    this.datePickerValue = this.fromDate;
  }

  // Vessel selection modal
  openVesselModal(content) {
  }
  // Date selection modal
  openModal(content) {
    this.modalReference = this.modalService.open(content);
  }
  closeModal() {
    this.modalReference.close();
  }
  onDateSelection(date: NgbDate) {
    // Triggered when pressing a button in the LTM module - not necessarily on confirm
    if (!this.fromDate && !this.toDate) {
      this._fromDate = date;
    } else if (this._fromDate && !this._toDate && date.after(this._fromDate)) {
      this._toDate = date;
    } else {
      this._toDate = null;
      this._fromDate = date;
    }
  }
  onDateCancel() {
    this._fromDate = copyNgbDate(this.fromDate);
    this._toDate = copyNgbDate(this.toDate);
  }
  onDateConfirm() {
    this.closeModal();
    this.fromDate = copyNgbDate(this._fromDate);
    this.toDate = copyNgbDate(this._toDate);
    this.searchTransfersByNewSpecificDate();
  }
  public isHovered = (date: NgbDate) => this._fromDate && !this._toDate && this.hoveredDate && date.after(this._fromDate) && date.before(this.hoveredDate);
  public isInside = (date: NgbDate) => date.after(this._fromDate) && date.before(this._toDate);
  public isRange = (date: NgbDate) => date.equals(this._fromDate) || date.equals(this._toDate) || this.isInside(date) || this.isHovered(date);
  public onPrint() {
    this._doPrint();
  }


  navigateToVesselreport(vesselObject: { mmsi: number, matlabDate: number }) {
    this.routerService.routeToDPR({ mmsi: vesselObject.mmsi, date: vesselObject.matlabDate });
  }
  selectField(event: { _id: string, text: string, isDisabled: boolean }) {
    this.selectedField = event._id;
    this.updateWavedataForChild();
  }
  deselectField(event: string) {
    this.selectedField = '';
    this.updateWavedataForChild();
  }

  selectLastMonth() {
    this.fromDate = this.getLastMonthObject();
    this.toDate = this.calendar.getPrev(this.calendar.getNext(this.fromDate, 'm'), 'd');
    this.searchTransfersByNewSpecificDate();
  }
  selectLastQuarter() {
    this.fromDate = this.getLastQuarterObject();
    this.toDate = this.calendar.getPrev(this.calendar.getNext(this.fromDate, 'm', 3), 'd');
    this.searchTransfersByNewSpecificDate();
  }
  switchMonthBackwards() {
    if (this.fromDate.day === 1) {
      if (this.fromDate.month === 1) {
        this.fromDate.month = 12;
        this.fromDate.year -= 1;
      } else {
        this.fromDate.month -= 1;
      }
    } else {
      this.fromDate.day = 1;
    }
    if (this.fromDate.month === 12) {
      this.toDate.year = this.fromDate.year += 1;
      this.toDate.month = 1;
    } else {
      this.toDate.year = this.fromDate.year;
      this.toDate.month = this.fromDate.month + 1;
    }
    this.toDate.day = 1;
    this.searchTransfersByNewSpecificDate();
  }
  switchMonthForward() {
    const nextMonth = new NgbDate(this.fromDate.year, this.fromDate.month, 1);
    if (this.fromDate.month === 12) {
      nextMonth.day = 1;
      nextMonth.month = 1;
      nextMonth.year += 1;
    } else {
      nextMonth.day = 1;
      nextMonth.month += 1;
    }
    if (nextMonth.before(this.maxDate)) {
      this.fromDate = nextMonth;
    } else {
      return;
    }
    if (this.fromDate.month === 12) {
      this.toDate.year = this.fromDate.year + 1;
      this.toDate.month = 1;
    } else {
      this.toDate.year = this.fromDate.year;
      this.toDate.month = this.fromDate.month + 1;
    }
    this.toDate.day = 1;
    if (this.toDate.after(this.maxDate)) {
      this.toDate = copyNgbDate(this.maxDate);
    }
    this.searchTransfersByNewSpecificDate();
  }

  updateWavedataForChild() {
    // if (this.vesselType === 'CTV') {
    //   // Build CTV module
    //   this.ctvChild.updateActiveField(this.selectedField);
    // } else if (this.vesselType === 'SOV' || this.vesselType === 'OSV') {
    //   // Build SOV module
    //   // this.sovChild.buildPageWithCurrentInformation();
    // }
  }

  // Utility
  getMaxDate(): NgbDate {
    const yesterday = moment().add(-1, 'days');
    return new NgbDate(yesterday.year(), yesterday.month() + 1, yesterday.date());
  }
  monthForwardEnabled(): boolean {
    return !this.maxDate.after(this.toDate);
  }
  getLastMonthObject() {
    return this.calendar.getPrev(this.calendar.getPrev(this.calendar.getToday(), 'd', 1), 'm', 1);
  }
  getLastQuarterObject() {
    const curr = this.calendar.getToday();
    if (curr.month > 9 ) {
      return new NgbDate(curr.year, 7, 1);
    } else if (curr.month > 6 ) {
      return new NgbDate(curr.year, 4, 1);
    } else if (curr.month > 3 ) {
      return new NgbDate(curr.year, 1, 1);
    } {
      return new NgbDate(curr.year - 1, 10, 1);
    }
  }
  getMatlabDateYesterday() {
    return this.dateTimeService.getMatlabDateYesterday();
  }
  getMatlabDateLastMonth() {
    return this.dateTimeService.getMatlabDatenumLastMonth();
  }
  getJSDateYesterdayYMD() {
    return this.dateTimeService.getYmdStringYesterday();
  }
  getJSDateLastMonthYMD() {
    return this.dateTimeService.getYmdStringLastMonth();
  }
  MatlabDateToJSDateYMD(serial: number) {
    return this.dateTimeService.matlabDatenumToYmdString(serial);
  }
  unixEpochtoMatlabDate(epochDate) {
    return this.dateTimeService.unixEpochtoMatlabDatenum(epochDate);
  }
  MatlabDateToUnixEpochViaDate(serial) {
    return this.dateTimeService.matlabDatenumToDate(serial);
  }
  getMMSIFromParameter() {
    let mmsi: number;
    this.route.params.subscribe(params => {
      mmsi = parseFloat(params.mmsi);
    });
    return mmsi;
  }
  getVesselNameFromParameter() {
    let vesselName: string;
    this.route.params.subscribe(params => vesselName = params.vesselName);
    return vesselName;
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
}

export interface LongtermVesselObjectModel {
  mmsi: number[];
  vesselName: string[];
  dateMin: number;
  dateMax: number;
  dateNormalMin: string;
  dateNormalMax: string;
}

function copyNgbDate(date: NgbDate) {
  return new NgbDate(date.year, date.month, date.day);
}
