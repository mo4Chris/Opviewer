import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    //Map settings
    latitude = 52.3702157;
    longitude = 4.895167;
    zoomlvl = 6;
    mapTypeId = "roadmap"
    streetViewControl = false;
    //End map settings

    constructor() {}

    ngOnInit() {}
}
