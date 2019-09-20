import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../common.service';
import { routerTransition } from '../../router.animations';


import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../supportModules/datetime.service';
import { CalculationService } from '../../supportModules/calculation.service';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { LongtermSOVComponent } from './sov/longtermSOV.component';

@Component({
  selector: 'app-longterm',
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
    public router: Router,
    private userService: UserService,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService
    ) {
    this.fromDate = calendar.getPrev(calendar.getPrev(calendar.getToday(), 'd', 1), 'm', 1);
    this.toDate = calendar.getPrev(calendar.getToday(), 'd', 1);
  }

  maxDate = { year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  vesselObject = { 'dateMin': this.getMatlabDateLastMonth(), 'mmsi': [this.getMMSIFromParameter()], 'dateNormalMin': this.getJSDateLastMonthYMD(), 'dateMax': this.getMatlabDateYesterday(), 'dateNormalMax': this.getJSDateYesterdayYMD() };

  multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false,
  };

  vesselType: string;
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  modalReference: NgbModalRef;
  datePickerValue = this.maxDate;
  Vessels: {Site: string, client: any[], mmsi: number, nicename: string, onHire: number,
    operationsClass: string, speednotifylimit: any, vesselname: string}[];
  showContent: boolean;
  loaded = {Vessels: false, vesselType: false};

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
        this.noPermissionForData = false;
        if (this.tokenInfo.userPermission === 'admin') {
          this.newService.getVessel().subscribe(data => {
            this.Vessels = data;
            this.loaded.Vessels = true;
          }, null, () => this.testIfAllInit());
        } else {
          this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe( data => {
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
          this.router.navigate(['login']);
        }
      });
  }

  testIfAllInit () {
    try {
      if (this.loaded.Vessels && this.loaded.vesselType) {
        this.Vessels = this.Vessels.filter(elt => elt.operationsClass === this.vesselType);
        this.buildPageWithCurrentInformation();
      }
    } catch (err) {
      console.log('Failed to build page with current information');
      console.log(this);
      console.error(err);
    }
  }

  testIfAllLoaded() {
    // Is this still used?
    console.log('This is still called')
  }

  onSelectVessel(event: {mmsi: number, nicename: string}[]) {
    this.vesselObject.mmsi = event.map(x => x.mmsi);
    this.buildPageWithCurrentInformation();
  }

  searchTransfersByNewSpecificDate() { // Sets new date and selected vessel values
    const minValueAsMomentDate = moment(this.fromDate.day + '-' + this.fromDate.month + '-' + this.fromDate.year, 'DD-MM-YYYY');
    const maxpickerValueAsMomentDate = moment(this.toDate.day + '-' + this.toDate.month + '-' + this.toDate.year, 'DD-MM-YYYY');
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
    if (this.dropdownValues && this.dropdownValues.length > 0 && this.dropdownValues[0].mmsi !== []) {
      for (let _j = 0; _j < this.dropdownValues.length; _j++) {
        mmsiArray.push(this.dropdownValues[_j].mmsi);
      }
    }
    this.vesselObject.mmsi = mmsiArray;
    this.buildPageWithCurrentInformation();
  }

  buildPageWithCurrentInformation() {
    setTimeout(() => { // Let CTV child object load
      if (this.vesselType === 'CTV') {
        // Build CTV module
        this.ctvChild.buildPageWithCurrentInformation();
      } else if (this.vesselType === 'SOV' || this.vesselType === 'OSV') {
        // Build SOV module
        this.sovChild.buildPageWithCurrentInformation();
      }
    }, 100);
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

  navigateToVesselreport(vesselObject: {mmsi: number, matlabDate: number}) {
    this.router.navigate(['vesselreport', {boatmmsi: vesselObject.mmsi, date: vesselObject.matlabDate}]);
  }

  isHovered = (date: NgbDate) => this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  isInside = (date: NgbDate) => date.after(this.fromDate) && date.before(this.toDate);
  isRange = (date: NgbDate) => date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);


  // Utility
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
    let mmsi;
    this.route.params.subscribe(params => {
      mmsi = parseFloat(params.boatmmsi);
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
