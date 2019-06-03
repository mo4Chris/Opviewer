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
import { CommonService } from '../../common.service'
import { ClusterStyle, ClusterOptions } from '@agm/js-marker-clusterer/services/google-clusterer-types';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(public router: Router, private route: ActivatedRoute, private userService: UserService, private eventService: EventService, private dateTimeService: DatetimeService, private commonService: CommonService) {   }
    locationData;

    // Map settings
    zoominfo = {
        longitude: 0,
        latitude: 0,
        zoomlvl: 7
    }
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

    iconMarkerLive: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/grn-circle.png',
         "Updated last hour"
    )
      
    iconMarkerHours: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/ylw-circle.png',
        "Updated < 6 hours",
      )
      
    iconMarkerOld: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/red-circle.png',
        "Updated > 6 hours",
      )
       
    iconHarbour: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/marina.png',
        "Harbour",
        {
            width: 20,
            height: 20
        }
      )
      
    iconWindfield: mapMarkerIcon = new mapMarkerIcon(
        '../assets/images/windTurbine.png',
        "Windfield",
        {
            width: 25,
            height: 25
        }
    )
    
    iconVesselCluster: mapMarkerIcon = new mapMarkerIcon(
        '../assets/clusterer/m1.png', 
        'Cluster of vessels'
    )

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
        let lastUpdatedHours
        this.locationData = locationData;
        this.locationData.forEach(marker =>
            {
                lastUpdatedHours = this.dateTimeService.hoursSinceMoment(marker.TIMESTAMP)
                if (lastUpdatedHours < 1){
                    marker.markerIcon = this.iconMarkerLive
                } else if (lastUpdatedHours < 6){
                    marker.markerIcon = this.iconMarkerHours
                } else{
                    marker.markerIcon = this.iconMarkerOld
                }
                });
    }

    getZoominfo(zoominfo: any): void {
        this.zoominfo = zoominfo
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
                    this.eventService.closeLatestAgmInfoWindow();
                    break;
                }
                case Usertype.LogisticsSpecialist: {
                    this.logisticsSpecialistComponent.getLocations();
                    this.eventService.closeLatestAgmInfoWindow();
                    break;
                }
                case Usertype.MarineController: {
                    this.marineControllerComponent.getLocations();
                    this.eventService.closeLatestAgmInfoWindow();
                    break;
                }
                case Usertype.Vesselmaster: {
                    this.vesselMasterComponent.getLocations();
                    this.eventService.closeLatestAgmInfoWindow();
                    break;
                }
            }
        }, 1000);
        setTimeout(() => {
            this.eventService.closeLatestAgmInfoWindow();

            if (this.router.url === '/dashboard') {
                this.getLocations();
            }
        }, 60000);
    }

    makeLegend(){
        if (!this.legendLoaded){
            this.clustererMaxZoom = 9;
            this.clustererGridSize = 25;
            this.clustererImagePathPark = "../assets/clusterer/turbine";
            this.clusterStylePark = [
                {
                    url:'../assets/clusterer/turbine1.png', 
                    textSize: 20, 
                    height: 48,
                    width: 48,
                    anchor: [1, 1],
                },
                {
                    url:'../assets/clusterer/turbine2.png', 
                    textSize: 20,
                    height: 48,
                    width: 48,
                    anchor: [1, 1],
                    textColor: '#000',
                }
            ]
            this.clustererImagePathVessels = "../assets/clusterer/turbine";
            this.clusterStyleVessels = [
                {
                    url:'../assets/clusterer/m1.png', 
                    textSize: 20, 
                    height: 53,
                    width: 52
                },
                {
                    url:'../assets/clusterer/m1.png', 
                    textSize: 20,
                    height: 56,
                    width: 55
                }
            ]
            const parkLocations = this.commonService.getParkLocations();
            parkLocations.forEach(field => {
                this.parkLocations = field;
            })
            const harbourLocations = this.commonService.getHarbourLocations();
            harbourLocations.forEach(harbour => {
                this.harbourLocations = harbour;
            })

            this.mapLegend.add(this.iconVesselCluster);
            this.mapLegend.add(this.iconMarkerLive);
            this.mapLegend.add(this.iconMarkerHours);
            this.mapLegend.add(this.iconMarkerOld);
            this.mapLegend.add(this.iconHarbour);
            this.mapLegend.add(this.iconWindfield);

            // Generate the legend
            var legend = document.getElementById('mapLegendID');
            const height = 35;
            this.mapLegend.markers.forEach(marker=>
                {var div = document.createElement('div');
                    div.innerHTML = '<span><img src=' + marker.url + ' height="' + height + '"> ' + marker.description + '</span>';
                    legend.appendChild(div);
                })
            this.legendLoaded = true;
        }
    }

    redirectDailyVesselReport(mmsi) {
        this.eventService.closeLatestAgmInfoWindow();
        this.router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    getAlert() {
        this.route.params.subscribe(params => { this.alert.type = params.status; this.alert.text = params.message;});
        if (this.alert.type && this.alert.type !== '' && this.alert.text !== '') {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 1000);
        }
    }
}
