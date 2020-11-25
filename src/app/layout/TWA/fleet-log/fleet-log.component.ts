import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common.service';
import { Router } from '@angular/router';
import { DatetimeService } from '../../../supportModules/datetime.service';
import * as moment from 'moment-timezone';
import { StringMutationService } from '../../../shared/services/stringMutation.service';
import { UserModel } from '../../../models/userModel';
import { UserService } from '@app/shared/services/user.service';

@Component({
    selector: 'app-fleet-log',
    templateUrl: './fleet-log.html',
    styleUrls: ['./fleet-log.component.scss'],
    animations: [routerTransition()]
})
export class FleetLogComponent implements OnInit {
    constructor(
        private stringMutationService: StringMutationService,
        private newService: CommonService,
        private userService: UserService,
        private _router: Router,
        private route: ActivatedRoute,
        private dateTimeService: DatetimeService
    ) { }

    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    params = { campaignName: '', windfield: '', startDate: 0 };
    edits;
    fleetId: string;
    fleetClient: string;
    type = 'Sail days changed';
    sailDayChanged: any[];
    activeListings;
    vesselsToAdd;
    users: UserModel[];
    loading = true;
    availableMonths = [];
    selectedMonth: string;
    noData = true;
    sortedData;
    sort = { active: '', isAsc: true };

    ngOnInit() {
        if (this.tokenInfo.userPermission !== 'admin') {
            this._router.navigate(['access-denied']);
        }
        this.getCampaignName();
        this.getStartDate();
        this.getWindfield();
        this.getUsers();
        this.getAvailableMonths();
        this.buildData(true);
    }

    buildData(init = false) {
        this.loading = true;
        if (this.type === 'Sail days changed') {
            if (!this.sailDayChanged) {
                this.getSailDayChanged();
            } else {
                this.getValidData();
                this.loading = false;
            }
        } else if (this.type === 'Active listings') {
            if (!this.activeListings) {
                this.getActiveListings();
            } else {
                this.getValidData();
                this.loading = false;
            }
        } else {
            if (!this.vesselsToAdd) {
                this.getVesselsToAddToFleet();
            } else {
                this.getValidData();
                this.loading = false;
            }
        }
    }

    getCampaignName() {
        this.route.params.subscribe(params => this.params.campaignName = params.campaignName);
    }

    getStartDate() {
        this.route.params.subscribe(params => this.params.windfield = params.windfield);
    }

    getWindfield() {
        this.route.params.subscribe(params => this.params.startDate = parseFloat(params.startDate));
    }

    getUsers() {
        this.newService.getUsers().subscribe(data => this.users = data);
    }

    valueToDate(date) {
        return this.dateTimeService.valueToDate(date);
    }

    getMatlabDateToJSDate(serial) {
        return this.dateTimeService.MatlabDateToJSDate(serial);
    }

    MatLabDateToMoment(serial) {
        return this.dateTimeService.MatlabDateToUnixEpoch(serial);
    }

    changeToNicename(name) {
        return this.stringMutationService.changeToNicename(name);
    }

    getUsername(id) {
        if (this.users) {
            const user = this.users.find(x => x._id === id);
            return user.username;
        } else {
            return id;
        }
    }

    getAvailableMonths() {
        const dateStart = moment('2018-01-01');
        const dateEnd = moment();

        let _counter = 0;
        while ((dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) && _counter++ < 200  ) {
            this.availableMonths.push(dateStart.format('YYYY MMM'));
            dateStart.add(1, 'month');
        }
        this.availableMonths.reverse();
        this.selectedMonth = dateEnd.format('YYYY MMM');
    }

    getSailDayChanged() {
        this.newService.getTurbineWarrantyOne({
            campaignName: this.params.campaignName,
            windfield: this.params.windfield,
            startDate: this.params.startDate
        }).subscribe(data => {
            this.sailDayChanged = data.sailDayChanged;
            this.sailDayChanged.reverse();
            this.fleetId = data.data._id;
            this.fleetClient = data.data.client;
            this.getValidData();
            this.loading = false;
        });
    }

    getActiveListings() {
        this.newService.getAllActiveListingsForFleet(this.fleetId).subscribe(data => {
            this.activeListings = data;
            this.activeListings.reverse();
            this.getValidData();
            this.loading = false;
        });
    }

    getVesselsToAddToFleet() {
        this.newService.getVesselsToAddToFleet({ campaignName: this.params.campaignName, windfield: this.params.windfield, startDate: this.params.startDate }).subscribe(data => {
            this.vesselsToAdd = data;
            this.vesselsToAdd.reverse();
            this.getValidData();
            this.loading = false;
        });
    }

    getValidData() {
        this.edits = [];
        if (this.type === 'Sail days changed') {
            for (let i = 0; i < this.sailDayChanged.length; i++) {
                this.formatDate(this.sailDayChanged[i], this.sailDayChanged[i].changeDate);
            }
        } else if (this.type === 'Active listings') {
            for (let i = 0; i < this.activeListings.length; i++) {
                this.formatDate(this.activeListings[i], this.activeListings[i].dateChanged);
            }
        } else {
            for (let i = 0; i < this.vesselsToAdd.length; i++) {
                this.formatDate(this.vesselsToAdd[i], this.vesselsToAdd[i].dateAdded);
            }
        }
        this.noData = (!this.edits[0]);
    }

    formatDate(data, date) {
        if (moment(date).format('YYYY MMM') === this.selectedMonth) {
            this.edits.push(data);
        }
    }

    sortData(sort) {
        this.sort = sort;
        const data = this.edits.slice();
        if (!sort.active || sort.isAsc === '') {
            this.sortedData = data;
            return;
        }

        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.isAsc;
            switch (sort.active) {
                case 'changeDate': return this.stringMutationService.compare(a.changeDate, b.changeDate, isAsc);
                case 'vessel': return this.stringMutationService.compare(a.vessel, b.vessel, isAsc);
                case 'date': return this.stringMutationService.compare(a.date, b.date, isAsc);
                case 'oldValue': return this.stringMutationService.compare(a.oldValue, b.oldValue, isAsc);
                case 'newValue': return this.stringMutationService.compare(a.newValue, b.newValue, isAsc);
                case 'userID': return this.stringMutationService.compare(this.getUsername(a.userID), this.getUsername(b.userID), isAsc);
                case 'dateChanged': return this.stringMutationService.compare(a.dateChanged, b.dateChanged, isAsc);
                case 'vesselname': return this.stringMutationService.compare(a.vesselname, b.vesselname, isAsc);
                case 'dateStart': return this.stringMutationService.compare(a.dateStart, b.dateStart, isAsc);
                case 'dateEnd': return this.stringMutationService.compare(a.dateEnd, b.dateEnd, isAsc);
                case 'deleted': return this.stringMutationService.compare(a.deleted, b.deleted, isAsc);
                case 'user': return this.stringMutationService.compare(a.user, b.user, isAsc);
                case 'dateAdded': return this.stringMutationService.compare(a.dateAdded, b.dateAdded, isAsc);
                case 'vesselname': return this.stringMutationService.compare(a.vesselname, b.vesselname, isAsc);
                case 'mmsi': return this.stringMutationService.compare(a.mmsi, b.mmsi, isAsc);
                case 'status': return this.stringMutationService.compare(a.status, b.status, isAsc);
                case 'client': return this.stringMutationService.compare(a.client, b.client, isAsc);
                case 'username': return this.stringMutationService.compare(a.username, b.username, isAsc);
                default: return 0;
            }
        });
        this.edits = this.sortedData;
    }
}


