import { Component, OnInit, ViewChild, SystemJsNgModuleLoader, NgZone, ElementRef, OnDestroy } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { ActivatedRoute, Router } from '@angular/router';
import { mapLegend, mapMarkerIcon } from '../dashboard/models/mapLegend';

import { UserService } from '@app/shared/services/user.service';
import { AdminComponent } from './components/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/vessel-master/vessel-master.component';
import { UserTypeEnum } from '@app/shared/enums/UserType';
import { EventService } from '@app/supportModules/event.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CommonService } from '@app/common.service';
import { GmapService } from '@app/supportModules/gmap.service';
import { RouterService } from '@app/supportModules/router.service';
import { AlertService } from '@app/supportModules/alert.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { Observable } from 'rxjs';
import { MapZoomData, MapZoomLayer } from '@app/models/mapZoomLayer';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [routerTransition()]
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private eventService: EventService,
    private dateTimeService: DatetimeService,
    private commonService: CommonService,
    private mapService: GmapService,
    private routerService: RouterService,
    private alert: AlertService,
    public permission: PermissionService,
    private ngZone: NgZone,
  ) { }
  locationData: AisMarkerModel[];
  forecastLocationData: ForecastMarkerModel[];
  forecastLocationIcon = GmapService.iconForecastLocation;

  // Map settings
  googleMap: google.maps.Map;
  mapStyle = GmapService.defaultMapStyle;
  zoominfo: ZoomInfo = {
    longitude: 0.0,
    latitude: 55,
    zoomlvl: 5.5
  };
  mapTypeId = 'roadmap';
  streetViewControl = false;
  clusterStylePark: ClusterStyle[];
  clustererImagePathPark: string;
  clusterStyleVessels: ClusterStyle[];
  clustererImagePathVessels: string;
  clustererMaxZoom;
  clustererGridSize;
  // End map settings
  mapLegend: mapLegend = new mapLegend([]);
  legendLoaded = false;
  parkLocations: any[] = new Array<any>();
  harbourLocations: any[] = new Array<any>();

  showAlert = false;
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  infoWindowOld;

  // used for comparison in the HTML
  userType = UserTypeEnum;

    // Children and event handlers //
    @ViewChild(AdminComponent)
    private adminComponent: AdminComponent;

    @ViewChild(LogisticsSpecialistComponent)
    private logisticsSpecialistComponent: LogisticsSpecialistComponent;

    @ViewChild(MarineControllerComponent)
    private marineControllerComponent: MarineControllerComponent;

    @ViewChild(VesselMasterComponent)
    private vesselMasterComponent: VesselMasterComponent;

  setLocationData(locationData: AisMarkerModel[]): void {
    let lastUpdatedHours: number;
    this.locationData = locationData;
    this.locationData.forEach(marker => {
      lastUpdatedHours = this.dateTimeService.hoursSinceTimeString(marker.TIMESTAMP);
      if (lastUpdatedHours < 1) {
        marker.markerIcon = GmapService.iconVesselLive;
      } else if (lastUpdatedHours < 6) {
        marker.markerIcon = GmapService.iconVesselHours;
      } else {
        marker.markerIcon = GmapService.iconVesselOld;
      }
    });
  }

  plotForecastLocations(forecastLocations: Observable<{nicename: string, lon: number, lat: number, id: number}[]>, minZoom = 5, maxZoom = 30) {
    forecastLocations.subscribe(_locs => this.forecastLocationData = _locs);
  }


  setZoominfo(zoominfo: ZoomInfo): void {
    this.zoominfo = zoominfo;
  }

  onMouseOver(infoWindow, gm) {
    this.infoWindowOld = infoWindow;
    this.eventService.openAgmInfoWindow(infoWindow, gm);
  }
  ///////////////////////////////

  ngOnInit() {
    this.commonService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (!userIsActive) {
        this.userService.logout();
      }
      this.getAlert();
      this.makeLegend();
      this.getLocations();
    });
  }

  ngOnDestroy() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  private _timeout: NodeJS.Timeout;
  getLocations() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        switch (this.tokenInfo.userPermission) {
          case this.userType.Admin: {
            this.adminComponent.getLocations();
            break;
          }
          case this.userType.LogisticsSpecialist: {
            this.logisticsSpecialistComponent.getLocations();
            break;
          }
          case this.userType.MarineController: {
            this.marineControllerComponent.getLocations();
            break;
          }
          case this.userType.Vesselmaster: {
            this.vesselMasterComponent.getLocations();
            break;
          }
        }
        this.eventService.closeLatestAgmInfoWindow();
      }, 100);
      // We need to tell angular that the 10 minute dashboard update
      // should not be waited for with regards to change detection.
      this._timeout = setTimeout(() => {
        this.eventService.closeLatestAgmInfoWindow();
        if (this.router.url === '/dashboard') {
          this.getLocations();
        }
      }, 60000);
    });
  }

  buildGoogleMap(googleMap: google.maps.Map) {
    this.googleMap = googleMap;
    const harbourLocations = this.commonService.getHarbourLocations();
    this.mapService.plotHarbours(this.googleMap, harbourLocations);
    // Drawing the wind parks as polygons is zoomed in
    const parkLocations = this.commonService.getParkLocations();
    // Draw turbines as pictograms if zoomed out
    this.mapService.plotParkBoundaries(this.googleMap, parkLocations);
    this.mapService.plotParkPictograms(this.googleMap, parkLocations);
    // Draw platforms if zoomed in
    const platforms = this.commonService.getPlatformLocations('');
    this.mapService.plotPlatforms(this.googleMap, platforms);
    // Drawing the forecast locations
    if (this.permission.forecastRead) {
      const forecastLocations = this.commonService.getForecastProjectLocations();
      this.plotForecastLocations(forecastLocations)
    }
  }

  makeLegend() {
    if (!this.legendLoaded) {
      this.clustererMaxZoom = 9;
      this.clustererGridSize = 25;
      this.clustererImagePathPark = '../assets/clusterer/turbine';
      this.clusterStylePark = [
        {
          url: '../assets/clusterer/turbine1.png',
          textSize: 20,
          height: 48,
          width: 48,
          anchor: [1, 1],
        },
        {
          url: '../assets/clusterer/turbine2.png',
          textSize: 20,
          height: 48,
          width: 48,
          anchor: [1, 1],
          textColor: '#000',
        }
      ];
      this.clustererImagePathVessels = '../assets/clusterer/turbine';
      this.clusterStyleVessels = [
        {
          url: '../assets/clusterer/m1.png',
          textSize: 20,
          height: 53,
          width: 52
        },
        {
          url: '../assets/clusterer/m1.png',
          textSize: 20,
          height: 56,
          width: 55
        }
      ];

      // Generate the legend
      this.mapLegend.add(GmapService.iconVesselCluster);
      this.mapLegend.add(GmapService.iconVesselLive);
      this.mapLegend.add(GmapService.iconVesselHours);
      this.mapLegend.add(GmapService.iconVesselOld);
      this.mapLegend.add(GmapService.iconHarbour);
      this.mapLegend.add(GmapService.iconWindfield);
      if (this.permission.forecastRead) this.mapLegend.add(GmapService.iconForecastLocation);

      const legend = document.getElementById('mapLegendID');
      const height = 35;
      this.mapLegend.markers.forEach(marker => {
        const div = document.createElement('div');
        div.innerHTML = '<span><img src=' + marker.url + ' height="' + height + '"> ' + marker.description + '</span>';
        legend.appendChild(div);
      });
      this.legendLoaded = true;
    }
  }

  redirectDailyVesselReport(mmsi: number) {
    this.eventService.closeLatestAgmInfoWindow();
    this.routerService.routeToDPR({ mmsi: mmsi });
  }

  redirectToForecasting(id: number) {
    this.eventService.closeLatestAgmInfoWindow();
    this.routerService.routeToForecast(id);
  }

  getAlert() {
    this.route.params.subscribe(params => {
      this.alert.type = params.status;
      this.alert.text = params.message;
    });
  }
}

export interface AisMarkerModel {
  _id: string;
  TIMESTAMP: string;
  LON: number;
  LAT: number;
  vesselInformation: any[];
  markerIcon: mapMarkerIcon;
}

export interface ForecastMarkerModel {
  nicename: string;
  lat: number;
  lon: number;
  id: number;
}

interface ClusterStyle {
  /**
   * The image url.
   */
  url?: string;
  /**
   * The image height.
   */
  height?: number;
  /**
   * The image width.
   */
  width?: number;
  /**
   * The anchor position of the label text.
   */
  anchor?: [number, number];
  /**
   * The text color.
   */
  textColor?: string;
  /**
   * The text size.
   */
  textSize?: number;
  /**
   * The position of the backgound x, y.
   */
  backgroundPosition?: string;
  /**
   * The anchor position of the icon x, y.
   */
  iconAnchor?: [number, number];
}

interface ZoomInfo {
  longitude: number;
  latitude: number;
  zoomlvl: number;
}
