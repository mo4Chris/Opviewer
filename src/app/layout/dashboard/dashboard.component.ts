import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import * as jwt_decode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';

import {CommonService} from '../../common.service';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(private newService: CommonService, private route: ActivatedRoute, private userService: UserService) {   }
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
     showAlert = false;
     tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    alert = {type: '', text: ''}
    timeout;

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
