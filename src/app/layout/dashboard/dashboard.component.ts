import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import * as jwt_decode from "jwt-decode";

//Mongo Imports
import {FormGroup,FormControl,Validators,FormsModule, } from '@angular/forms';
import {CommonService} from '../../common.service';
import {Http,Response, Headers, RequestOptions } from '@angular/http';   

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    constructor(private newService :CommonService) {   }  
    LLdata;
    Locdata;
    errData;
    

    getDecodedAccessToken(token: string): any {
        try{
            return jwt_decode(token);
        }
        catch(Error){
            return null;
        }
      }
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));

    //Map settings
    latitude = 52.3702157;
    longitude = 4.895167;
    zoomlvl = 6;
    mapTypeId = "roadmap"
    streetViewControl = false;    
    //End map settings

    infoWindowOpened = null;

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

    getLatestBoatLocationAdmin(){
        this.newService.GetLatestBoatLocation().subscribe(data => this.Locdata = data, err => this.errData = err);
        setTimeout(()=>{
            this.getLatestBoatLocationAdmin();
        }, 60000);
    }
    getLatestBoatLocationCompany(company){
        this.newService.GetLatestBoatLocationForCompany(company).subscribe(data => this.Locdata = data, err => this.errData = err);
        setTimeout(()=>{
            this.getLatestBoatLocationCompany(company);
        }, 60000)
    }


    ngOnInit() {    
        this.newService.GetLatLon().subscribe(data =>  this.LLdata = data);

        if(this.tokenInfo.userPermission == "admin"){
            this.getLatestBoatLocationAdmin();
        } else {
            this.getLatestBoatLocationCompany([{"companyName" : this.tokenInfo.userCompany}]);
        }
      }  
}
