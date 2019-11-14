import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { CommonService } from '../../../common.service';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { DatetimeService } from '../../../supportModules/datetime.service';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-fleet-request',
    templateUrl: './fleet-request.html',
    styleUrls: ['./fleet-request.component.scss'],
    animations: [routerTransition()],
    encapsulation: ViewEncapsulation.None,
})
export class FleetRequestComponent implements OnInit {
    constructor(
        private newService: CommonService,
        private userService: UserService,
        private _router: Router,
        private dateTimeService: DatetimeService
    ) { }

    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    boats = [];
    alert = { type: '', message: '' };
    showAlert = false;
    emptyRequired = {
        windfield: false,
        startDate: false,
        stopDate: false,
        numContractedVessels: false,
        campaignName: false,
        weatherDayTarget: false,
        client: false,
        boats: false,
        validFields: false
    };
    timeout;
    companies = [];

    request = {
        boats: [],
        client: '',
        windfield: '',
        startDate: { year: null, month: null, day: null },
        stopDate: { year: null, month: null, day: null },
        numContractedVessels: null,
        campaignName: '',
        weatherDayTarget: null,
        weatherDayTargetType: 'Per vessel',
        jsTime: { startDate: 0, stopDate: 0 },
        validFields: [],
        limitHs: null,
        requestTime: null
    };

    selectVesselsSettings = {
        idField: 'mmsi',
        textField: 'nicename',
        allowSearchFilter: true,
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        singleSelection: false
    };
    selectClientSettings = Object.assign({}, this.selectVesselsSettings);

    ngOnInit() {
        this.selectClientSettings.singleSelection = true;
        if (this.tokenInfo.userPermission !== 'admin' && this.tokenInfo.userPermission !== 'Logistics specialist') {
            this._router.navigate(['access-denied']);
        }
        this.getBoats();
        if (this.tokenInfo.userPermission === 'admin') {
            this.newService.getCompanies().subscribe(data => this.companies = data);
        }
    }

    getBoats() {
        if (this.tokenInfo.userPermission === 'admin') {
            this.newService.getVessel().subscribe(data => {
                this.boats = data.map(v => v.nicename);
            });
        } else {
            this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany, notHired: 1 }]).subscribe(data => {
                this.boats = data.map(v => v.nicename);
            });
        }
    }

    saveRequest() {
        this.emptyRequired.campaignName = !this.request.campaignName;
        this.emptyRequired.windfield = !this.request.windfield;
        this.emptyRequired.startDate = !this.request.startDate.year || !this.request.startDate.month || !this.request.startDate.day;
        this.emptyRequired.stopDate = !this.request.stopDate.year || !this.request.stopDate.month || !this.request.stopDate.day;
        this.emptyRequired.numContractedVessels = !this.request.numContractedVessels;
        this.emptyRequired.weatherDayTarget = !this.request.weatherDayTarget;
        if (this.tokenInfo.userPermission !== 'admin') {
            this.request.client = this.tokenInfo.userCompany;
        }
        this.emptyRequired.boats = this.request.boats.length <= 0;
        this.emptyRequired.client = !this.request.client;
        for (const obj in this.emptyRequired) {
            if (this.emptyRequired[obj]) {
                return;
            }
        }
        this.request.jsTime.startDate = this.dateTimeService.convertObjectToMoment(this.request.startDate.year, this.request.startDate.month, this.request.startDate.day).valueOf();
        this.request.jsTime.stopDate = this.dateTimeService.convertObjectToMoment(this.request.stopDate.year, this.request.stopDate.month, this.request.stopDate.day).valueOf();
        this.request.requestTime = moment().valueOf();
        this.newService.saveFleetRequest(this.request).pipe(
            map(
                (res) => {
                    this._router.navigate(['campaigns', { msg: res.data }]);
                }
            ),
            catchError(error => {
                this.setAlert('danger', error._body);
                throw error;
            })
        ).subscribe();
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

    cancelRequest() {
        this._router.navigate(['campaigns']);
    }
}
