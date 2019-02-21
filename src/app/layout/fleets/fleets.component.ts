import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import { StringMutationService } from '../../shared/services/stringMutation.service';
import { DatetimeService } from '../../supportModules/datetime.service';

import { Router } from '../../../../node_modules/@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-fleets',
    templateUrl: './fleets.component.html',
    styleUrls: ['./fleets.component.scss'],
    animations: [routerTransition()]
})
export class FleetsComponent implements OnInit {
    constructor(private stringMutationService: StringMutationService, private dateTimeService: DatetimeService, private newService: CommonService, private _router: Router, private userService: UserService) { }
    fleets;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));

    ngOnInit() {
        if (this.tokenInfo.userPermission === 'admin') {
            this.newService.getTurbineWarranty().subscribe(data => this.fleets = data);
        } else {
            this.newService.getTurbineWarrantyForCompany({ client: this.tokenInfo.userCompany }).subscribe(data => this.fleets = data);
        }
    }

    MatlabDateToJSDate(serial) {
        return this.dateTimeService.MatlabDateToJSDate(serial);
    }

    redirectFleetAvailability(campaignName, windfield, startDate) {
        this._router.navigate(['fleetavailability', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    redirectFleetLog(campaignName, windfield, startDate) {
        this._router.navigate(['fleet-log', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    humanize(str) {
        return this.stringMutationService.humanize(str);  
    }
}
