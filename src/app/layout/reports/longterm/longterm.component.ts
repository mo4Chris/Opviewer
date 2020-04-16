import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@app/common.service';
import { routerTransition } from '@app/router.animations';


import * as moment from 'moment-timezone';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@app/shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { LongtermSOVComponent } from './sov/longtermSOV.component';
import { VesselModel } from '@app/models/vesselModel';
import { SettingsService } from '@app/supportModules/settings.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { RouterService } from '@app/supportModules/router.service';

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
    calendar: NgbCalendar,
    private routerService: RouterService,
    private userService: UserService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private settings: SettingsService,
    private permission: PermissionService
  ) {
    this.fromDate = calendar.getPrev(calendar.getPrev(calendar.getToday(), 'd', 1), 'm', 1);
    this.toDate = calendar.getPrev(calendar.getToday(), 'd', 1);
  }

  maxDate = this.getMaxDate();
  vesselObject: LongtermVesselObjectModel = {
    mmsi: [this.getMMSIFromParameter()],
    dateMin: this.getMatlabDateLastMonth(),
    dateNormalMin: this.getJSDateLastMonthYMD(),
    dateMax: this.getMatlabDateYesterday(),
    dateNormalMax: this.getJSDateYesterdayYMD()
  };

  multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false,
  };
  fieldSelectSettings = {
    allowSearchFilter: true,
    singleSelection: true,
    closeDropDownOnSelection: true,
    textFields: 'text',
    idField: '_id',
  };

  vesselType: string;
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  modalReference: NgbModalRef;
  datePickerValue = this.maxDate;
  Vessels: VesselModel[] = [];
  showContent: boolean;
  loaded = { Vessels: false, vesselType: false };
  fieldsWithWavedata: { _id: string, site: string, name: string, text?: string }[] = [];
  selectedField = '';

  noPermissionForData = false;
  dropdownValues = [{ mmsi: this.getMMSIFromParameter(), nicename: this.getVesselNameFromParameter() }];
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));

  @ViewChild(LongtermCTVComponent)
  private ctvChild: LongtermCTVComponent;

  @ViewChild(LongtermSOVComponent)
  private sovChild: LongtermSOVComponent;

  // onInit
  ngOnInit() {
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (userIsActive === true) {
        Chart.pluginService.register(ChartAnnotation);
        this.newService.getFieldsWithWaveSourcesByCompany().subscribe(fields => {
          this.fieldsWithWavedata = fields;
          this.fieldsWithWavedata.forEach(elt => {
            elt.text = elt.site + ' - ' + elt.name;
          });
        });
        this.noPermissionForData = false;
        if (this.permission.admin) {
          this.newService.getVessel().subscribe(data => {
            this.Vessels = data;
            this.loaded.Vessels = true;
          }, null, () => this.testIfAllInit());
        } else {
          this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
            this.Vessels = data;
            this.loaded.Vessels = true;
          }, null, () => this.testIfAllInit());
        }
        if (this.vesselObject.mmsi.length > 0) {
          this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi[0] }).subscribe(
            validatedValue => {
              if (validatedValue.length === 1) {
                this.vesselType = validatedValue[0].operationsClass;
              } else {
                this.showContent = true;
                this.noPermissionForData = true;
              }
              this.loaded.vesselType = true;
            }, null, () => this.testIfAllInit());
        }
      } else {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('token');
        this.routerService.routeToLogin();
      }
    });
  }

  testIfAllInit() {
    if (this.loaded.Vessels && this.loaded.vesselType) {
      this.Vessels = this.Vessels.filter(elt => elt.operationsClass === this.vesselType);
      this.buildPageWithCurrentInformation();
    }
  }

  onSelectVessel(event: { mmsi: number, nicename: string }[]) {
    this.vesselObject.mmsi = event.map(x => x.mmsi);
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
    this.vesselObject.dateMin = dateMinAsMatlab;
    this.vesselObject.dateMax = dateMaxAsMatlab;
    this.vesselObject.dateNormalMin = this.MatlabDateToJSDateYMD(dateMinAsMatlab);
    this.vesselObject.dateNormalMax = this.MatlabDateToJSDateYMD(dateMaxAsMatlab);
    const mmsiArray = [];
    if (this.dropdownValues && this.dropdownValues.length > 0 && <any> this.dropdownValues[0].mmsi !== []) {
      for (let _j = 0; _j < this.dropdownValues.length; _j++) {
        mmsiArray.push(this.dropdownValues[_j].mmsi);
      }
    }
    this.vesselObject.mmsi = mmsiArray;
    this.buildPageWithCurrentInformation();
    setTimeout(() => {
      this.updateWavedataForChild();
    }, 1000);
  }

  buildPageWithCurrentInformation() {
    this.datePickerValue = this.fromDate;
    setTimeout(() => {
      if (this.vesselType === 'CTV') {
        // Build CTV module
        this.ctvChild.buildPageWithCurrentInformation();
      } else if (this.vesselType === 'SOV' || this.vesselType === 'OSV') {
        // Build SOV module
        this.sovChild.buildPageWithCurrentInformation();
      } else {
        console.error('Invalid DPR - no CTV or SOV child rendered!');
      }
    });
  }

  childLoaded() { // Runs when CTV or SOV child is done loading data
    if (this.vesselType === 'CTV') {
      // Build CTV module
    } else if (this.vesselType === 'SOV' || this.vesselType === 'OSV') {
      // Build SOV module
    }
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
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  navigateToVesselreport(vesselObject: { mmsi: number, matlabDate: number }) {
    this.routerService.routeToDPR({ mmsi: vesselObject.mmsi, date: vesselObject.matlabDate });
  }

  isHovered = (date: NgbDate) => this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  isInside = (date: NgbDate) => date.after(this.fromDate) && date.before(this.toDate);
  isRange = (date: NgbDate) => date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);

  selectField(event: { _id: string, text: string, isDisabled: boolean }) {
    this.selectedField = event._id;
    this.updateWavedataForChild();
  }

  deselectField(event: string) {
    this.selectedField = '';
    this.updateWavedataForChild();
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
      // Cant copy maxdate here since otherwise maxDate would start changing when moving back months
      this.toDate.year = this.maxDate.year;
      this.toDate.month = this.maxDate.month;
      this.toDate.day = this.maxDate.day;
    }
    this.searchTransfersByNewSpecificDate();
  }

  updateWavedataForChild() {
    if (this.vesselType === 'CTV') {
      // Build CTV module
      this.ctvChild.updateActiveField(this.selectedField);
    } else if (this.vesselType === 'SOV' || this.vesselType === 'OSV') {
      // Build SOV module
      // this.sovChild.buildPageWithCurrentInformation();
    }
  }

  // Utility
  getMaxDate(): NgbDate {
    const yesterday = moment().add(-1, 'days');
    return new NgbDate(yesterday.year(), yesterday.month() + 1, yesterday.date());
  }
  monthForwardEnabled(): boolean {
    return !this.maxDate.after(this.toDate);
  }
  getMatlabDateYesterday() {
    return this.dateTimeService.getMatlabDateYesterday();
  }
  getMatlabDateLastMonth() {
    return this.dateTimeService.getMatlabDateLastMonth();
  }
  getJSDateYesterdayYMD() {
    return this.dateTimeService.getJSDateYesterdayYMD();
  }
  getJSDateLastMonthYMD() {
    return this.dateTimeService.getJSDateLastMonthYMD();
  }
  MatlabDateToJSDateYMD(serial) {
    return this.dateTimeService.MatlabDateToJSDateYMD(serial);
  }
  unixEpochtoMatlabDate(epochDate) {
    return this.dateTimeService.unixEpochtoMatlabDate(epochDate);
  }
  getMMSIFromParameter() {
    let mmsi: number;
    this.route.params.subscribe(params => {
      mmsi = parseFloat(params.mmsi);
    });

    return mmsi;
  }
  getVesselNameFromParameter() {
    let vesselName;
    this.route.params.subscribe(params => vesselName = params.vesselName);
    return vesselName;
  }
  MatlabDateToUnixEpochViaDate(serial) {
    return this.dateTimeService.MatlabDateToUnixEpochViaDate(serial);
  }
}

export interface LongtermVesselObjectModel {
  mmsi: number[];
  dateMin: number;
  dateMax: number;
  dateNormalMin: string;
  dateNormalMax: string;
}
