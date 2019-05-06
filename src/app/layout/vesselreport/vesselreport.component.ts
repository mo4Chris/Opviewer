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
import { TurbineLocation } from './models/TurbineLocation';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { EventService } from '../../supportModules/event.service';
import { VesselTurbines } from './models/VesselTurbines';
import { VesselPlatforms } from './models/VesselTurbines';

@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()]
})

export class VesselreportComponent implements OnInit {

  constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private calculationService: CalculationService, private dateTimeService: DatetimeService, private userService: UserService, private eventService: EventService) {

  }

  maxDate = { year: moment().add(-1, 'days').year(), month: (moment().add(-1, 'days').month() + 1), day: moment().add(-1, 'days').date() };
  outsideDays = 'collapsed';
  vesselObject = { 'date': this.dateTimeService.getMatlabDateYesterday(), 'mmsi': this.getMMSIFromParameter(), 'dateNormal': this.dateTimeService.getJSDateYesterdayYMD(), 'vesselType': '' };

  parkNamesData;
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
  transferVisitedAtLeastOneTurbine = false;
  noTransits = true;
  videoRequestPermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';
  loaded = false;
  turbinesLoaded = true; //getTurbineLocationData is not always triggered
  platformsLoaded = true;
  mapPixelWidth = 0;

  vesselTurbines: VesselTurbines = new VesselTurbines();
  platformLocations: VesselPlatforms = new VesselPlatforms();

  iconMarker = {
    url: '../../assets/images/turbineIcon.png',
    scaledSize: {
      width: 5,
      height: 5
    }
  }

  visitedIconMarker = {
    url: '../../assets/images/visitedTurbineIcon.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  }

  platformMarker = {
    url: '../../assets/images/oil-platform.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  }
  visitedPlatformMarker = {
    url: '../../assets/images/visitedPlatform.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  }

  @ViewChild(CtvreportComponent)
  private ctvChild: CtvreportComponent;

  @ViewChild(SovreportComponent)
  private sovChild: SovreportComponent;

  getTurbineLocationData(turbineLocationData: any): void {
    this.turbinesLoaded = false;
    let locationData = turbineLocationData.turbineLocations;
    let transfers = turbineLocationData.transfers;
    let type = turbineLocationData.type;
    let vesselType = turbineLocationData.vesselType;
    let turbines: any[] = new Array<any>();

    if(locationData.length > 0 && transfers.length > 0) {
      locationData.forEach(turbineLocation => {
        for(let index = 0; index < turbineLocation.lat.length; index++) {
          let turbineIsVisited = false;
          for(let transferIndex = 0; transferIndex < transfers.length; transferIndex++) {
            let transferName = "";
            if(vesselType == 'SOV' && type != 'Turbine') {
              //Platform has different property name
              transferName = transfers[transferIndex].locationname;
            }
            else {
              transferName = transfers[transferIndex].location;
            }

            if(turbineLocation.name[index] == transferName) {
              turbines.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], transferName, transfers[transferIndex]));
              turbineIsVisited = true;
              this.transferVisitedAtLeastOneTurbine = true;
              continue;    
            }
          }
          //Reached the end, platform has not been visited
          if(!turbineIsVisited) {
            turbines.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], ""));
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
    groupedTurbines.subscribe(val => this.vesselTurbines.turbineLocations.push(val));

    setTimeout(() => {
    this.turbinesLoaded = true;
    }, 1500);
  }

  getPlatformLocationData(platformLocationData: any): void {
    this.platformsLoaded = false;
    let locationData = platformLocationData.turbineLocations;
    let transfers = platformLocationData.transfers;
    let type = platformLocationData.type;
    let vesselType = platformLocationData.vesselType;
    let platforms: any[] = new Array<any>();

    if (locationData.length > 0 && transfers.length > 0) {
      locationData.forEach(turbineLocation => {
        for (let index = 0; index < turbineLocation.lat.length; index++) {
          let platformIsVisited = false;
          for (let transferIndex = 0; transferIndex < transfers.length; transferIndex++) {
            let transferName = "";
            if (vesselType == 'SOV' && type != 'Turbine') {
              //Platform has different property name
              transferName = transfers[transferIndex].locationname;
            }
            else {
              transferName = transfers[transferIndex].location;
            }
            if (turbineLocation.name[index] == transferName) {

              platforms.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], transferName, transfers[transferIndex]));
              platformIsVisited = true;
              this.transferVisitedAtLeastOneTurbine = true;
              continue;
            }
          }
          //Reached the end, turbine has not been visited
          if (!platformIsVisited) {
            platforms.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], turbineLocation.name[index]));
          }
        }
      });
    }
    const source = from(platforms);
    const groupedTurbines = source.pipe(
      groupBy(platforms => platforms.latitude),
      mergeMap(group => group.pipe(toArray()))
    );
    groupedTurbines.subscribe(val => this.platformLocations.turbineLocations.push(val));
    setTimeout(() => {
        this.platformsLoaded = true;
    }, 1500);
  }
 

  //Handle events and get variables from child components//////////
  onMouseOver(infoWindow, gm) {
    this.eventService.OpenAgmInfoWindow(infoWindow, gm);
  }

  getMapZoomLvl(mapZoomLvl: number): void {
    this.mapZoomLvl = mapZoomLvl;
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

  getRouteFound(routeFound: boolean): void {
    this.routeFound = routeFound;
  }

  getParkFound(parkFound: boolean): void {
    this.parkFound = parkFound;
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

  getMatlabDateToCustomJSTime(serial, format) {
    return this.dateTimeService.MatlabDateToCustomJSTime(serial, format);
  }

  GetDecimalValueForNumber(value, endpoint) {
    return this.calculationService.GetDecimalValueForNumber(value, endpoint);
  }

  ngOnInit() {
    if (this.tokenInfo.userPermission === 'admin') {
      this.newService.getVessel().subscribe(data => this.vessels = data);
    } else {
      this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => {
        this.vessels = data;
      });
    }
    this.buildPageWithCurrentInformation();
  }

  // TODO: make complient with the newly added usertypes
  buildPageWithCurrentInformation() {
    this.resetRoutes();
    this.noPermissionForData = false;
    this.newService.validatePermissionToViewData({ mmsi: this.vesselObject.mmsi }).subscribe(validatedValue => {
      if (validatedValue.length === 1) {
        this.vesselObject.vesselType = validatedValue[0].operationsClass;
        let map = document.getElementById('routeMap');
        if(map != null) {
          this.mapPixelWidth = map.offsetWidth;
        }
        setTimeout(() => {
          if (this.vesselObject.vesselType === 'CTV' && this.ctvChild !== undefined) {
            this.ctvChild.buildPageWithCurrentInformation();
          } else if ((this.vesselObject.vesselType === 'SOV' || this.vesselObject.vesselType === 'OSV') && this.sovChild !== undefined) {
            this.sovChild.buildPageWithCurrentInformation();
          }

        }, 1000);
      } else {
        this.noPermissionForData = true;
      }
    });
  }

  onChange(): void {
    this.eventService.closeLatestAgmInfoWindow();
    this.resetRoutes();
    const dateAsMatlab = this.getDateAsMatlab();
    this.vesselObject.date = dateAsMatlab;
    this.vesselObject.dateNormal = this.dateTimeService.MatlabDateToJSDateYMD(dateAsMatlab);

    this.buildPageWithCurrentInformation();
  }

  getDateAsMatlab(): any {
    const datepickerValueAsMomentDate = moment.utc(this.datePickerValue.day + '-' + this.datePickerValue.month + '-' + this.datePickerValue.year, 'DD-MM-YYYY');
    datepickerValueAsMomentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    datepickerValueAsMomentDate.format();

    const momentDateAsIso = moment.utc(datepickerValueAsMomentDate).unix();

    return this.dateTimeService.unixEpochtoMatlabDate(momentDateAsIso);
  }

  resetRoutes() {
    this.vesselTurbines = new VesselTurbines();
    this.platformLocations = new VesselPlatforms();
    this.boatLocationData = [];
    this.longitude = 0;
    this.latitude = 0;
    this.showMap = false;
    this.routeFound = false;
    this.parkFound = false;
    this.transferVisitedAtLeastOneTurbine = false;
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
