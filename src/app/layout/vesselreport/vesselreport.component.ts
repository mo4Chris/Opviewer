/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as moment from 'moment';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
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
import { LonlatService } from '../../supportModules/lonlat.service';
import {} from '@agm/core/services/google-maps-types';


declare const google: any;
@Component({
  selector: 'app-vesselreport',
  templateUrl: './vesselreport.component.html',
  styleUrls: ['./vesselreport.component.scss'],
  animations: [routerTransition()],
})
export class VesselreportComponent implements OnInit {
  constructor(public router: Router,
    private newService: CommonService,
    private route: ActivatedRoute,
    private calculationService: CalculationService,
    private dateTimeService: DatetimeService,
    private userService: UserService,
    private eventService: EventService,
    private lonlatService: LonlatService,
    ) {

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

  zoominfo = {
    mapZoomLvl: null,
    latitude: null,
    longitude: null,
  };
  googleMap: google.maps.Map;

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
  turbinesLoaded = true; // getTurbineLocationData is not always triggered
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
  };

  visitedIconMarker = {
    url: '../../assets/images/visitedTurbineIcon.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  };

  platformMarker = {
    url: '../../assets/images/oil-platform.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  };
  visitedPlatformMarker = {
    url: '../../assets/images/visitedPlatform.png',
    scaledSize: {
      width: 10,
      height: 10
    }
  };

  @ViewChild(CtvreportComponent)
  private ctvChild: CtvreportComponent;

  @ViewChild(SovreportComponent)
  private sovChild: SovreportComponent;

  getTurbineLocationData(turbineLocationData: any): void {
    this.turbinesLoaded = false;
    const locationData = turbineLocationData.turbineLocations;
    const transfers = turbineLocationData.transfers;
    const type = turbineLocationData.type;
    const vesselType = turbineLocationData.vesselType;
    const turbines: any[] = new Array<any>();

    if (locationData.length > 0 && transfers.length > 0) {
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

            if (turbineLocation.name[index] === transferName) {
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
    groupedTurbines.subscribe(val => this.vesselTurbines.turbineLocations.push(val));

    setTimeout(() => {
    this.turbinesLoaded = true;
    }, 1500);
  }

  getPlatformLocationData(platformLocationData: any): void {
    this.platformsLoaded = false;
    const locationData = platformLocationData.turbineLocations;
    const transfers = platformLocationData.transfers;
    const type = platformLocationData.type;
    const vesselType = platformLocationData.vesselType;
    const platforms: any[] = new Array<any>();

    if (locationData.length > 0 && transfers.length > 0) {
      locationData.forEach(turbineLocation => {
        for (let index = 0; index < turbineLocation.lat.length; index++) {
          let platformIsVisited = false;
          for (let transferIndex = 0; transferIndex < transfers.length; transferIndex++) {
            let transferName = '';
            if (vesselType === 'SOV' && type !== 'Turbine') {
              // Platform has different property name
              transferName = transfers[transferIndex].locationname;
            } else {
              transferName = transfers[transferIndex].location;
            }
            if (turbineLocation.name[index] === transferName) {

              platforms.push(new TurbineLocation(turbineLocation.lat[index][0], turbineLocation.lon[index][0], transferName, transfers[transferIndex]));
              platformIsVisited = true;
              this.transferVisitedAtLeastOneTurbine = true;
              continue;
            }
          }
          // Reached the end, turbine has not been visited
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


  // Handle events and get variables from child components//////////
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
        const map = document.getElementById('routeMap');
        if (map != null) {
          this.mapPixelWidth = map.offsetWidth;
        }
        // ToDo clear timeout when data is loaded
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
    this.zoominfo.longitude = 0;
    this.zoominfo.latitude = 0;
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

  buildGoogleMap(googleMap) {
    this.googleMap = googleMap;
    // drawing route
    const lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };
    this.boatLocationData.forEach(vessel => {
      new google.maps.Polyline({
        clickable: false,
        map: this.googleMap,
        path: this.lonlatService.lonlatarrayToLatLngArray(vessel),
        strokeColor: '#FF0000',
        strokeWeight: 1.5,
        icons: [{
          icon: lineSymbol,
          offset: '0.5%'
        }, {
          icon: lineSymbol,
          offset: '10%'
        }, {
          icon: lineSymbol,
          offset: '20%'
        }, {
          icon: lineSymbol,
          offset: '30%'
        }, {
          icon: lineSymbol,
          offset: '40%'
        }, {
          icon: lineSymbol,
          offset: '50%'
        }, {
          icon: lineSymbol,
          offset: '60%'
        }, {
          icon: lineSymbol,
          offset: '70%'
        }, {
          icon: lineSymbol,
          offset: '80%'
        }, {
          icon: lineSymbol,
          offset: '90%'
        }, {
          icon: lineSymbol,
          offset: '100%'
        }],
      });
    });
    // ToDo need to add a proper event emitter when location data is loaded
    setTimeout(() => {
      // Drawing turbines
      this.vesselTurbines.turbineLocations.forEach((turbineParkLocation, index) => {
          if (turbineParkLocation[0].shipHasSailedBy) {
            this.addMarkerToGoogleMap(this.visitedIconMarker, turbineParkLocation[0].longitude, turbineParkLocation[0].latitude, turbineParkLocation.map(docking => docking.transfer), turbineParkLocation[0].location, 5);
          } else {
            this.addMarkerToGoogleMap(this.iconMarker, turbineParkLocation[0].longitude, turbineParkLocation[0].latitude, turbineParkLocation.map(docking => docking.transfer));
          }
        });
      // Drawing platforms
      this.platformLocations.turbineLocations.forEach(platform => {
        if (platform[0].shipHasSailedBy) {
          this.addMarkerToGoogleMap(this.visitedPlatformMarker, platform[0].longitude, platform[0].latitude, platform.map(docking => docking.transfer), platform[0].location, 5);
        } else if (false) {
          // ToDO Need to decide if we want to show all platforms. Maybe we use some sort of fancy merger similar to dashboard or show only above certain zoom level
          this.addMarkerToGoogleMap(this.platformMarker, platform[0].longitude, platform[0].latitude);
        }

      });
    }, 500);
  }

  addMarkerToGoogleMap(markerIcon, lon, lat, infoArray = null, location = null, zIndex = 2) {
    const markerPosition = {lat: lat, lng: lon};
    const mymarker = new google.maps.Marker({
      position: markerPosition,
      draggable: false,
      icon: markerIcon,
      map: this.googleMap,
      zIndex: zIndex
    });
    if (infoArray.length > 0 && infoArray[0]) {
      let contentString =
        '<strong style="font-size: 15px;">' + location + ' Turbine transfers</strong>' +
        '<pre>';
        infoArray.forEach(info => {
          contentString = contentString + '<br>' +
          'Start: ' + this.dateTimeService.MatlabDateToJSTime(info.startTime) + '<br>' +
          'Stop: ' + this.dateTimeService.MatlabDateToJSTime(info.stopTime) + '<br>' +
          'Duration: ' + this.dateTimeService.MatlabDurationToMinutes(info.duration) + '<br>';
        });
        contentString = contentString + '</pre>';
      const infowindow = new google.maps.InfoWindow({
        content: contentString,
        disableAutoPan: true,
      });
      // Need to define local function here since we cant use callbacks to other functions from this class in the listener callback
      const openInfoWindow = (marker, infowindow) => {
        this.eventService.OpenAgmInfoWindow(infowindow, [], this.googleMap, marker);
      };
      mymarker.addListener('mouseover', function () {
        openInfoWindow(mymarker, infowindow);
      });
    }
  }
}
