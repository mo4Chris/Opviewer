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

    //End map settings

    ngOnInit() {    
        this.newService.GetLatLon().subscribe(data =>  this.LLdata = data);
        this.newService.GetLatestBoatLocation().subscribe(data => this.Locdata = data, err => this.errData = err);
      }  
}
