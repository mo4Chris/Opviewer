import { Component, OnInit, ViewChild, SystemJsNgModuleLoader } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ActivatedRoute, Router } from '@angular/router';
import { mapLegend, mapMarkerIcon } from '../dashboard/models/mapLegend';

import { UserService } from '../../shared/services/user.service';
import { AdminComponent } from './components/users/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/users/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/users/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/users/vessel-master/vessel-master.component';
import { Usertype } from '../../shared/enums/UserType';
import { EventService } from '../../supportModules/event.service';
import { DatetimeService } from '../../supportModules/datetime.service';
import { CommonService } from '../../common.service';
import { ClusterStyle, ClusterOptions } from '@agm/js-marker-clusterer/services/google-clusterer-types';
import { GmapService } from '../../supportModules/gmap.service';
import { MapZoomData, MapZoomLayer, MapZoomPolygon } from '../../models/mapZoomLayer';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(public router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private eventService: EventService,
        private dateTimeService: DatetimeService,
        private commonService: CommonService,
        private mapService: GmapService,
     ) {   }
    locationData;

    // Map settings
    googleMap: google.maps.Map;
    zoominfo = {
        longitude: 0,
        latitude: 0,
        zoomlvl: 7
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
    alert = {type: '', text: ''};
    timeout;
    infoWindowOld;

    // used for comparison in the HTML
    userType = Usertype;

    // Children and event handlers //
    @ViewChild(AdminComponent)
    private adminComponent: AdminComponent;

    @ViewChild(LogisticsSpecialistComponent)
    private logisticsSpecialistComponent: LogisticsSpecialistComponent;

    @ViewChild(MarineControllerComponent)
    private marineControllerComponent: MarineControllerComponent;

    @ViewChild(VesselMasterComponent)
    private vesselMasterComponent: VesselMasterComponent;

    getLocationData(locationData: any[]): void {
        let lastUpdatedHours;
        this.locationData = locationData;
        this.locationData.forEach(marker => {
                lastUpdatedHours = this.dateTimeService.hoursSinceMoment(marker.TIMESTAMP);
                if (lastUpdatedHours < 1) {
                    marker.markerIcon = this.mapService.iconVesselLive;
                } else if (lastUpdatedHours < 6) {
                    marker.markerIcon = this.mapService.iconVesselHours;
                } else {
                    marker.markerIcon = this.mapService.iconVesselOld;
                }
                });
    }

    getZoominfo(zoominfo: any): void {
        // Is this not setZoominfo?
        this.zoominfo = zoominfo;
    }

    onMouseOver(infoWindow, gm) {
        this.infoWindowOld = infoWindow;
        this.eventService.OpenAgmInfoWindow(infoWindow, gm);
    }
    ///////////////////////////////

    ngOnInit() {
        this.getAlert();
        this.getLocations();
    }

    getLocations() {
        this.makeLegend();
        // this.adminComponent.setZoomLevel();
        setTimeout(() => {
            switch (this.tokenInfo.userPermission) {
                case Usertype.Admin: {
                    this.adminComponent.getLocations();
                    break;
                }
                case Usertype.LogisticsSpecialist: {
                    this.logisticsSpecialistComponent.getLocations();
                    break;
                }
                case Usertype.MarineController: {
                    this.marineControllerComponent.getLocations();
                    break;
                }
                case Usertype.Vesselmaster: {
                    this.vesselMasterComponent.getLocations();
                    break;
                }
            }
            this.eventService.closeLatestAgmInfoWindow();
        }, 1000);
        setTimeout(() => {
            this.eventService.closeLatestAgmInfoWindow();

            if (this.router.url === '/dashboard') {
                this.getLocations();
            }
        }, 60000);
    }

    buildGoogleMap( googleMap ) {
        // this.mapService.addTurbinesToMapForDashboard(googleMap, this.parkLocations);
        this.googleMap = googleMap;
        const harbourLocations = this.commonService.getHarbourLocations(8);
        this.mapService.plotHarbours(this.googleMap, harbourLocations);
        // Drawing the wind parks as polygons is zoomed in
        const parkLocations = this.commonService.getParkLocations();
        // Draw turbines as pictograms if zoomed out
        this.mapService.plotParkBoundaries(this.googleMap, parkLocations);
        this.mapService.plotParkPictograms(this.googleMap, parkLocations);
        
        // Draw platforms if zoomed in
        const platforms = this.commonService.getPlatformLocations('');
        this.mapService.plotPlatforms(this.googleMap, platforms);
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
            this.mapLegend.add(this.mapService.iconVesselCluster);
            this.mapLegend.add(this.mapService.iconVesselLive);
            this.mapLegend.add(this.mapService.iconVesselHours);
            this.mapLegend.add(this.mapService.iconVesselOld);
            this.mapLegend.add(this.mapService.iconHarbour);
            this.mapLegend.add(this.mapService.iconWindfield);

            // Generate the legend
            const legend = document.getElementById('mapLegendID');
            const height = 35;
            this.mapLegend.markers.forEach(marker => {const div = document.createElement('div');
                    div.innerHTML = '<span><img src=' + marker.url + ' height="' + height + '"> ' + marker.description + '</span>';
                    legend.appendChild(div);
                });
            this.legendLoaded = true;
        }
    }

    redirectDailyVesselReport(mmsi) {
        this.eventService.closeLatestAgmInfoWindow();
        this.router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    getAlert() {
        this.route.params.subscribe(params => { this.alert.type = params.status; this.alert.text = params.message; });
        if (this.alert.type && this.alert.type !== '' && this.alert.text !== '') {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 1000);
        }
    }
}
