import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';

import { Router } from '../../../../node_modules/@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-fleets',
    templateUrl: './fleets.component.html',
    styleUrls: ['./fleets.component.scss'],
    animations: [routerTransition()]
})
export class FleetsComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router, private userService: UserService) { }
    fleets;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));

    ngOnInit() {
        if (this.tokenInfo.userPermission == "admin") {
            this.newService.getTurbineWarranty().subscribe(data => this.fleets = data);
        } else {
            this.newService.getTurbineWarrantyForCompany({ client: this.tokenInfo.userCompany }).subscribe(data => this.fleets = data);
        }
    }

    MatlabDateToJSDate(serial) {
        return moment((serial - 719529) * 864e5).format('DD-MM-YYYY');
    }

    redirectFleetAvailability(campaignName, windfield, startDate) {
        this._router.navigate(['fleetavailability', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    redirectFleetLog(campaignName, windfield, startDate) {
        this._router.navigate(['fleet-log', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    humanize(str) {
        var frags = str.split('_');
        for (var i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    }
}
