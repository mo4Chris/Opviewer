import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../../shared/services/user.service';
import { AdminComponent } from './components/users/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/users/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/users/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/users/vessel-master/vessel-master.component';
import { Usertype } from '../../shared/enums/UserType';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(public router: Router, private route: ActivatedRoute, private userService: UserService) {   }
    locationData;
    errData;

    // Map settings
    latitude = 52.3702157;
    longitude = 4.895167;
    zoomlvl = 6;
    mapTypeId = 'roadmap';
    streetViewControl = false;
    // End map settings

    infoWindowOpened = null;
    showAlert = false;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    alert = {type: '', text: ''}
    timeout;

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
    ///////////////////////////////


    filter() {
        this.infoWindowOpened = null;
    }

    showInfoWindow(infoWindow) {
        if (this.infoWindowOpened === infoWindow) {
            return;
        }

        if (this.infoWindowOpened !== null) {
            this.infoWindowOpened.close();
        }
        this.infoWindowOpened = infoWindow;
    }

    redirectDailyVesselReport(mmsi) {
        this.router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    ngOnInit() {
        setTimeout(() => {
            switch(this.tokenInfo.userPermission) { 
                case Usertype.Admin: { 
                    this.adminComponent.GetLocations();
                    break; 
                }
                case Usertype.LogisticsSpecialist: { 
                    this.logisticsSpecialistComponent.GetLocations();
                    break; 
                }
                case Usertype.MarineController: { 
                    this.marineControllerComponent.GetLocations();
                    break; 
                }
                case Usertype.Vesselmaster: { 
                    this.vesselMasterComponent.GetLocations();
                    break; 
                } 
            }
        }, 1000);
        this.getAlert();
      }

      getAlert() {
          this.route.params.subscribe(params => { this.alert.type = params.status; this.alert.text = params.message });
          if (this.alert.type != '' && this.alert.text != '') {
              clearTimeout(this.timeout);
              this.showAlert = true;
              this.timeout = setTimeout(() =>{
                  this.showAlert = false;
              }, 10000);
          }
      }
}
