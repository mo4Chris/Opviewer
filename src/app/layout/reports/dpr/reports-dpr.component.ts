/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { CommonService } from '@app/common.service';
import { isArray } from 'util';

import * as moment from 'moment';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { CalculationService } from '@app/supportModules/calculation.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { UserService } from '@app/shared/services/user.service';

import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport.component';
import { TurbineLocation } from './models/TurbineLocation';
import { Observable, of, from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { EventService } from '@app/supportModules/event.service';
import { VesselTurbines } from './models/VesselTurbines';
import { VesselPlatforms } from './models/VesselTurbines';
import { GmapService } from '@app/supportModules/gmap.service';
import { VesselModel } from '@app/models/vesselModel';
import { TokenModel } from '@app/models/tokenModel';
import { TurbineLocsFromMongo } from './sov/models/vessel2vesselActivity';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { Hotkeys } from '@app/supportModules/hotkey.service';

@Component({
  selector: 'app-reports-dpr',
  templateUrl: './reports-dpr.component.html',
  styleUrls: ['./reports-dpr.component.scss'],
  animations: [routerTransition()],
})
export class ReportsDprComponent implements OnInit {
  constructor(
    public router: Router,
    private newService: CommonService,
    private route: ActivatedRoute,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private userService: UserService,
    private eventService: EventService,
    private mapService: GmapService,
    private permission: PermissionService,
    private hotkeys: Hotkeys,
    ) {

  }

  mapStyle = GmapService.defaultMapStyle;
  startDate = this.getInitialDateObject();
  maxDate = { year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  outsideDays = 'collapsed';
  vesselObject = {
    date: this.getInitialDate(),
    mmsi: this.getMMSIFromParameter(),
    dateNormal: '',
    vesselType: '',
  };
  vesselname = '';

  parkNamesData;
  boatLocationData = [];
  datePickerValue = this.startDate;
  sailDates: {transfer: object[], transit: object[], other: object[]};
  vessels: VesselModel[];
  general = {};

  tokenInfo: TokenModel = TokenModel.load(this.userService);
  public showContent = false;
  public showAlert = false;
  public noPermissionForData = false;

  zoominfo = {
    mapZoomLvl: null,
    latitude: null,
    longitude: null,
  };
  googleMap: google.maps.Map;
  printMode = 0;

  streetViewControl = false;
  changedCommentObj = { newComment: '', otherComment: '' };
  alert = { type: '', message: '' };
  showMap = false;
  parkFound = false;
  routeFound = false;
  transferVisitedAtLeastOneTurbine = false;
  noTransits = true;
  videoRequestPermission = this.permission.ctvVideoRequest;
  loaded = false;
  turbinesLoaded = true; // getTurbineLocationData is not always triggered
  platformsLoaded = true;
  googleMapLoaded = false;
  mapPixelWidth = 0;

  vesselTurbines: VesselTurbines = new VesselTurbines();
  platformLocations: VesselPlatforms = new VesselPlatforms();

  @ViewChild(CtvreportComponent)
  private ctvChild: CtvreportComponent;


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
        this.router.navigate(['login']);
      }
    });
  }

  // For each change
  onChange(): void {
    this.eventService.closeLatestAgmInfoWindow();
    this.resetRoutes();
    this.mapService.reset();
    const dateAsMatlab = this.getDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

    this.buildPageWithCurrentInformation();
  }
  onChildLoaded(childData: DprChildData) {
    this.routeFound = childData.routeFound;
    this.loaded = true;
    this.showContent = true;
    if (this.routeFound) {
      this.showMap = !Object.keys(childData.zoomInfo).some(key => isNaN(childData.zoomInfo[key]));
      this.boatLocationData = childData.boatLocationData;
      this.zoominfo = childData.zoomInfo;
    }
  }

  // TODO: make complient with the newly added usertypes
  buildPageWithCurrentInformation() {
    const htmlButton = <HTMLInputElement> document.getElementById('nextDayButton');
    if (this.datePickerValue.day === this.maxDate.day && this.datePickerValue.month === this.maxDate.month && this.datePickerValue.year === this.maxDate.year) {
      htmlButton.disabled = true;
    } else {
      htmlButton.disabled = false;
    }
    this.resetRoutes();
    this.mapService.reset();
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselname = validatedValue[0].nicename;
        // We overwrite the vesselObject to trigger the reload of subcomponents
        this.vesselObject = {
          date: this.vesselObject.date,
          dateNormal: this.vesselObject.dateNormal,
          vesselType: validatedValue[0].operationsClass,
          mmsi: validatedValue[0].mmsi,
        };
        const map = document.getElementById('routeMap');
        if (map != null) {
          this.mapPixelWidth = map.offsetWidth;
        }
      } else {
        this.noPermissionForData = true;
      }
    }, null, () => {
      setTimeout(() => {
        if (this.vesselObject.vesselType === 'CTV' && this.ctvChild !== undefined) {
          this.ctvChild.buildPageWithCurrentInformation();
        // } else if ((this.vesselObject.vesselType === 'SOV' || this.vesselObject.vesselType === 'OSV') && this.sovChild !== undefined) {
          // this.sovChild.buildPageWithCurrentInformation();
        }
      });
    });
  }
  buildPageWhenLoaded() {
    const allDataLoaded = this.turbinesLoaded && this.googleMapLoaded &&
      this.platformsLoaded && this.routeFound && this.loaded;
    if (allDataLoaded) {
      this.buildGoogleMap();
    }
  }


  getTurbineLocationData(turbineLocationData: TurbLocDataModel): void {
    this.turbinesLoaded = false;
    const locationData = turbineLocationData.turbineLocations;
    const transfers = turbineLocationData.transfers;
    const type = turbineLocationData.type;
    const vesselType = turbineLocationData.vesselType;
    const turbines: any[] = new Array<any>();

    if (isArray(locationData) && isArray(locationData) && locationData.length > 0 && transfers.length > 0) {
      locationData.forEach(turbineLocation => {
        for (let index = 0; index < turbineLocation.lat.length; index++) {
          let turbineIsVisited = false;
          for (let transferIndex = 0; transferIndex < transfers.length; transferIndex++) {
            let transferName = '';
            if (vesselType === 'SOV' && type !== 'Turbine') {
              // Platform has different property name
              transferName = transfers[transferIndex].locationname;
            } else {
              transferName = transfers[transferIndex].location;
            }

            if (turbineLocation.name[index] === transferName && turbineLocation.filename === transfers[transferIndex].fieldname) {
              turbines.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], transferName, transfers[transferIndex]));
              turbineIsVisited = true;
              this.transferVisitedAtLeastOneTurbine = true;
              continue;
            }
          }
          // Reached the end, platform has not been visited
          if (!turbineIsVisited) {
            turbines.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], ''));
          }
        }
        this.vesselTurbines.parkBoundaryLatitudes.push(...turbineLocation.outlineLatCoordinates);
        this.vesselTurbines.parkBoundaryLongitudes.push(...turbineLocation.outlineLonCoordinates);
        });
    }

    const source = from(turbines);
    const groupedTurbines = source.pipe(
    groupBy(turbine => turbine.latitude),
    mergeMap(group => group.pipe(toArray()))
    );
    groupedTurbines.subscribe(val => this.vesselTurbines.turbineLocations.push(val), null, () => {
      this.turbinesLoaded = true;
      this.buildPageWhenLoaded();
    });
  }
  getPlatformLocationData(platformLocationData: any): void {
    this.platformsLoaded = false;
    const locationData = platformLocationData.turbineLocations;
    const transfers = platformLocationData.transfers;
    const type = platformLocationData.type;
    const vesselType = platformLocationData.vesselType;
    const platforms: any[] = new Array<any>();

    if (locationData.length > 0 && transfers.length > 0) {
      locationData.forEach(platformLocation => {
        for (let index = 0; index < platformLocation.lat.length; index++) {
          let platformIsVisited = false;
          for (let transferIndex = 0; transferIndex < transfers.length; transferIndex++) {
            let transferName = '';
            if (vesselType === 'SOV' && type !== 'Turbine') {
              // Platform has different property name
              transferName = transfers[transferIndex].locationname;
            } else {
              transferName = transfers[transferIndex].location;
            }
            if (platformLocation.name[0][index] === transferName) {
              platforms.push(new TurbineLocation(platformLocation.lat[index][0], platformLocation.lon[index][0], transferName, transfers[transferIndex]));
              platformIsVisited = true;
              this.transferVisitedAtLeastOneTurbine = true;
              continue;
            }
          }
          // Reached the end, turbine has not been visited
          if (!platformIsVisited) {
            platforms.push(new TurbineLocation(platformLocation.lat[index][0], platformLocation.lon[index][0], isArray(platformLocation.name[0]) ? platformLocation.name[0][index] : platformLocation.name[index]));
          }
        }
      });
    }
    const source = from(platforms);
    const groupedTurbines = source.pipe(
      groupBy(_platforms => _platforms.latitude),
      mergeMap(group => group.pipe(toArray()))
    );
    groupedTurbines.subscribe(val => this.platformLocations.turbineLocations.push(val), null, () => {
        this.platformsLoaded = true;
        this.buildPageWhenLoaded();
      });
  }

  resetRoutes() {
    this.vesselTurbines = new VesselTurbines();
    this.platformLocations = new VesselPlatforms();
    this.boatLocationData = [];
    this.zoominfo.longitude = 0;
    this.zoominfo.latitude = 0;
    this.showMap = false;
    this.routeFound = false;
    this.parkFound = false;
    this.transferVisitedAtLeastOneTurbine = false;
    this.loaded = false;
    this.googleMapLoaded = false;
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
    }, 50);
  }

  // Handle events and get variables from child components//////////
  setMapReady(googleMap: google.maps.Map) {
    this.googleMap = googleMap;
    if (this.ctvChild) {
      this.ctvChild.onMapLoaded(googleMap);
    } else {

    }
    this.googleMapLoaded = true;
    this.buildPageWhenLoaded();
  }
  buildGoogleMap() {
    this.mapService.addVesselRouteToGoogleMap(this.googleMap, this.boatLocationData);
    this.mapService.addTurbinesToMapForVessel(this.googleMap, this.vesselTurbines, this.platformLocations);
  }
  getMapZoomLvl(mapZoomLvl: number): void {
    this.zoominfo.mapZoomLvl = mapZoomLvl;
  }
  getLongitude(longitude: any): void {
    this.zoominfo.longitude = longitude;
  }
  getLatitude(latitude: any): void {
    this.zoominfo.latitude = latitude;
  }
  getBoatLocationData(boatLocationData: any[]): void {
    this.boatLocationData = boatLocationData;
    this.showMap = true;
  }
  getShowContent(showContent: boolean): void {
    this.showContent = showContent;
  }
  getRouteFound(routeFound: boolean): void {
    this.routeFound = routeFound;
    if (routeFound) {
      this.buildPageWhenLoaded();
    }
  }
  getParkFound(parkFound: boolean): void {
    this.parkFound = parkFound;
  }
  isLoaded(loaded: boolean): void {
    this.loaded = loaded;
    if (loaded) {
      this.buildPageWhenLoaded();
    }
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

interface TurbLocDataModel {
  transfers: any[];
  turbineLocations: TurbineLocsFromMongo[];
  type: string;
  vesselType: string;
}


export interface DprChildData {
  boatLocationData: any[];
  zoomInfo: MapZoomInfo;
  // turbineLocationData: any;
  platformLocationData: any;

  routeFound: boolean;
}

interface MapZoomInfo {
  latitude: number;
  longitude: number;
  mapZoomLvl: number;
}
