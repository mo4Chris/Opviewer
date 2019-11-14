import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { StringMutationService } from '../../../shared/services/stringMutation.service';
import { DatetimeService } from '../../../supportModules/datetime.service';

import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { CommonService } from '../../../common.service';
import * as moment from 'moment';

@Component({
    selector: 'app-fleets',
    templateUrl: './fleets.component.html',
    styleUrls: ['./fleets.component.scss'],
    animations: [routerTransition()]
})
export class FleetsComponent implements OnInit {
    constructor(
        private stringMutationService: StringMutationService,
        private dateTimeService: DatetimeService,
        private newService: CommonService,
        private _router: Router,
        private route: ActivatedRoute,
        private userService: UserService
    ) { }
    fleets;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    msg = '';
    timeout;
    alert = { type: '', message: '' };
    showAlert = false;
    companies = [];
    selectedCompany = this.tokenInfo.userCompany;

    log(input) {
        console.log(input);
    }

    ngOnInit() {
        this.getMsg();
        if (this.tokenInfo.userPermission === 'admin') {
            this.newService.getCompanies().subscribe(data => {
                this.companies = ['all'].concat(data);
            });
            this.newService.getTurbineWarranty().subscribe(data => this.fleets = data);
            this.selectedCompany = 'all';
        } else {
            this.newService.getTurbineWarrantyForCompany({ client: this.tokenInfo.userCompany }).subscribe(data => {
                this.fleets = data;
                if (this.fleets.length < 1) {
                    this._router.navigate(['access-denied']);
                }

            });
        }
        if (this.msg !== undefined) {
            this.setAlert('success', this.msg);
        }
    }


    getMsg() {
        this.route.params.subscribe(params => this.msg = params.msg);
    }

    MatlabDateToJSDate(serial) {
        return this.dateTimeService.MatlabDateToJSDate(serial);
    }

    MatlabDateToUnixEpoch(serial) {
        return this.dateTimeService.MatlabDateToUnixEpoch(serial);
    }

    redirectFleetAvailability(campaignName, windfield, startDate) {
        this._router.navigate(['fleetavailability', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    redirectFleetLog(campaignName, windfield, startDate) {
        this._router.navigate(['fleet-log', { campaignName: campaignName, windfield: windfield, startDate: startDate }]);
    }

    redirectFleetRequest() {
        this._router.navigate(['campaign-request']);
    }

    humanize(str: string) {
        return this.stringMutationService.changeToNicename(str, true);
    }

    getNewMoment() {
        return moment().valueOf();
    }

    setAlert(type, msg) {
        clearTimeout(this.timeout);
        this.alert.type = type;
        this.alert.message = msg;
        this.showAlert = true;
        this.timeout = setTimeout(() => {
            this.showAlert = false;
        }, 7000);
    }
}
