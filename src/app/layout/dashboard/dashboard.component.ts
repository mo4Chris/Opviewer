import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

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

    //Map settings
    latitude = 52.3702157;
    longitude = 4.895167;
    zoomlvl = 6;
    mapTypeId = "roadmap"
    streetViewControl = false;

    infoWindowOpened = null;

    filter() {
        infoWindowOpened = null;
        // redraw the map with filtered markers
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

    //End map settings

    ngOnInit() {    
        this.newService.GetLatLon().subscribe(data =>  this.LLdata = data);
        this.newService.GetLatestBoatLocation().subscribe(data => this.Locdata = data, err => this.errData = err);
      }  
}
