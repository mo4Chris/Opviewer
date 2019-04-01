import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../../shared/services/user.service';
import { AdminComponent } from './components/users/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/users/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/users/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/users/vessel-master/vessel-master.component';
import { Usertype } from '../../shared/enums/UserType';
import { EventService } from '../../supportModules/event.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(public router: Router, private route: ActivatedRoute, private userService: UserService, private eventService: EventService) {   }
    locationData;

    // Map settings
    latitude = 54.3702157;
    longitude = 4.895167;
    zoomlvl = 5.5;
    mapTypeId = 'roadmap';
    streetViewControl = false;
    // End map settings

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
        this.locationData = locationData;
    }

    onMouseOver(infoWindow, gm) {
        this.infoWindowOld = infoWindow;
        this.eventService.OpenAgmInfoWindow(infoWindow, gm);
    }
    ///////////////////////////////

    ngOnInit() {
        this.getLocations();
        this.getAlert();
      }

    getLocations() {
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

    redirectDailyVesselReport(mmsi) {
        this.eventService.closeLatestAgmInfoWindow();
        this.router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    getAlert() {
        this.route.params.subscribe(params => { this.alert.type = params.status; this.alert.text = params.message; });
        if (this.alert.type !== '' && this.alert.text !== '') {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 10000);
        }
    }
}
