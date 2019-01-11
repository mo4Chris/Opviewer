import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculationService } from '../../supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '../../supportModules/datetime.service';
import { UserService } from '../../shared/services/user.service';

import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport/sovreport.component';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})

export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private calculationService: CalculationService, private dateTimeService: DatetimeService, private userService: UserService) {

  }

  maxDate = { year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  outsideDays = 'collapsed';
  vesselObject = { 'date': this.dateTimeService.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.dateTimeService.getJSDateYesterdayYMD(), 'vesselType': '' };

  parkNamesData;
  Locdata = [];
  boatLocationData = [];
  datePickerValue = this.maxDate;
  sailDates = [];
  vessels;
  general = {};

  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public showContent = false;
  public showAlert = false;
  public noPermissionForData = false;
  mapZoomLvl;
  latitude;
  longitude;
  mapTypeId = 'roadmap';
  streetViewControl = false;
  changedCommentObj = { 'newComment': '', 'otherComment': '' };
  alert = { type: '', message: '' };
  showMap = false;
  parkFound = false;
  routeFound = false;
  noTransits = true;
  videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';
  loaded = false;

  @ViewChild(CtvreportComponent)
  private ctvChild: CtvreportComponent;

  @ViewChild(SovreportComponent)
  private sovChild: SovreportComponent;

  /////// Get variables from child components//////////
  getMapZoomLvl(mapZoomLvl: number): void {
    this.mapZoomLvl = mapZoomLvl
  }

  getLocdata(locData: any[]): void {
    this.Locdata = locData;
  }

  getLongitude(longitude: any): void {
    this.longitude = longitude;
  }

  getLatitude(latitude: any): void {
    this.latitude = latitude;
  }

  getBoatLocationData(boatLocationData: any[]): void {
    this.boatLocationData = boatLocationData;
    this.showMap = true;
  }

  getDatesHasSailed(sailDates: any[]): void {
    this.sailDates = sailDates;
  }

  getShowContent(showContent: boolean): void {
    this.showContent = showContent;
  }

  isLoaded(loaded: boolean): void {
    this.loaded = loaded;
  }
  ///////////////////////////////////////////////////

  hasSailed(date: NgbDateStruct) {
    return this.dateTimeService.dateHasSailed(date, this.sailDates);
  }

  getMatlabDateToJSDate(serial) {
    return this.dateTimeService.MatlabDateToJSDate(serial);
  }

  getMMSIFromParameter() {
    let mmsi;
    this.route.params.subscribe(params => mmsi = parseFloat(params.boatmmsi));

    return mmsi;
  }

  objectToInt(objectvalue) {
    return this.calculationService.objectToInt(objectvalue);
  }

  ngOnInit() {
    if (this.tokenInfo.userPermission === 'admin') {
      this.newService.GetVessel().subscribe(data => this.vessels = data);
    } else {
      this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
        this.vessels = data;
      });
    }
    this.BuildPageWithCurrentInformation();
  }

  // TODO: make complient with the newly added usertypes
  BuildPageWithCurrentInformation() {
    this.resetRoutes();
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselObject.vesselType = validatedValue[0].operationsClass;
        setTimeout(() => {
          if (this.vesselObject.vesselType === 'CTV' && this.ctvChild !== undefined) {
            this.ctvChild.BuildPageWithCurrentInformation();
          } else if ((this.vesselObject.vesselType === 'SOV' || this.vesselObject.vesselType === 'OSV') && this.sovChild !== undefined) {
            this.sovChild.BuildPageWithCurrentInformation();
          }
        }, 1000);
      } else {
        this.noPermissionForData = true;
      }
    });
  }

  onChange(): void {
    this.resetRoutes();
    const dateAsMatlab = this.GetDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

    this.BuildPageWithCurrentInformation();
  }

  GetDateAsMatlab(): any {
    const datepickerValueAsMomentDate = moment(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    datepickerValueAsMomentDate.format();

    const momentDateAsIso = moment(datepickerValueAsMomentDate).unix();

    return this.dateTimeService.unixEpochtoMatlabDate(momentDateAsIso);
  }

  resetRoutes() {
    this.Locdata = [];
    this.boatLocationData = [];
    this.longitude = 0;
    this.latitude = 0;
    this.showMap = false;
    this.routeFound = false;
    this.parkFound = false;
    this.loaded = false;
  }

  getGeneralStats() {
    this.newService.getGeneral(this.vesselObject).subscribe(general => {
      if (general.data.length > 0 && general.data[0].DPRstats) {
        this.noTransits = false;
        this.general = general.data[0].DPRstats;
      } else {
        this.noTransits = true;
        this.general = {};
      }
    });
  }
}
