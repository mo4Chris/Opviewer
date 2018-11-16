import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import * as jwt_decode from 'jwt-decode';

import {CommonService} from '../../common.service';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(private newService: CommonService, private userService: UserService) {   }
    LLdata;
    Locdata;
    errData;

     // Map settings
     latitude = 52.3702157;
     longitude = 4.895167;
     zoomlvl = 6;
     mapTypeId = 'roadmap';
     streetViewControl = false;
     // End map settings

     infoWindowOpened = null;

     tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));

    filter() {
        this.infoWindowOpened = null;
    }

    showInfoWindow(infoWindow, index) {
        if (this.infoWindowOpened === infoWindow) {
            return;
        }

        if (this.infoWindowOpened !== null) {
            this.infoWindowOpened.close();
        }
        this.infoWindowOpened = infoWindow;
    }

    getLatestBoatLocationAdmin() {
        this.newService.GetLatestBoatLocation().subscribe(data => this.Locdata = data, err => this.errData = err);
        setTimeout(() => {
            this.getLatestBoatLocationAdmin();
        }, 60000);
    }
    getLatestBoatLocationCompany(company) {
        this.newService.GetLatestBoatLocationForCompany(company).subscribe(data => this.Locdata = data, err => this.errData = err);
        setTimeout(() => {
            this.getLatestBoatLocationCompany(company);
        }, 60000);
    }


    ngOnInit() {
        this.newService.GetLatLon().subscribe(data =>  this.LLdata = data);

        if (this.tokenInfo.userPermission === 'admin') {
            this.getLatestBoatLocationAdmin();
        } else {
            this.getLatestBoatLocationCompany([{'companyName' : this.tokenInfo.userCompany}]);
        }
      }
}
