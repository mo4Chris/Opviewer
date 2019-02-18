import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common.service';
import { UserService } from '../../shared/services/user.service';
import { Router } from '../../../../node_modules/@angular/router';
import { DatetimeService } from '../../supportModules/datetime.service';
import * as moment from 'moment';

@Component({
    selector: 'app-fleet-log',
    templateUrl: './fleet-log.html',
    styleUrls: ['./fleet-log.component.scss'],
    animations: [routerTransition()]
})
export class FleetLogComponent implements OnInit {
    constructor(private newService: CommonService, private userService: UserService, private _router: Router, private route: ActivatedRoute, private dateTimeService: DatetimeService) { }

    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    params = { campaignName: '', windfield: '', startDate: 0 };
    edits;
    fleetId;
    fleetClient;
    type = "Sail days changed";
    sailDayChanged;
    activeListings;
    vesselsToAdd;
    users;
    loading = true;
    availableMonths = [];
    selectedMonth;
    noData = true;

    ngOnInit() {
        if (this.tokenInfo.userPermission != 'admin') {
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
        if (this.type == "Sail days changed") {
            if (!this.sailDayChanged) {
                this.getSailDayChanged();
            } else {
                this.getValidData();
                this.loading = false;
            }
        } else if (this.type == "Active listings") {
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
        if (date) {
            return moment(date).format('DD-MM-YYYY');
        } else {
            return '-';
        }
    }

    getMatlabDateToJSDate(serial) {
        return this.dateTimeService.MatlabDateToJSDate(serial);
    }

    MatLabDateToMoment(serial) {
        return moment((serial - 719529) * 864e5);
    }

    changeToNicename(name) {
        if (name && name != '') {
            if (isNaN(name)) {
                return name.replace(/_/g, ' ');
            }
            return name;
        } else {
            return '-';
        }
    }

    getUsername(id) {
        if (this.users) {
            let user = this.users.find(x => x._id == id);
            return user.username;
        } else {
            return id;
        }
    }

    getAvailableMonths() {
        var dateStart = moment('2018-01-01');
        var dateEnd = moment();

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            this.availableMonths.push(dateStart.format('YYYY MMM'));
            dateStart.add(1, 'month');
        }
        this.availableMonths.reverse();
        this.selectedMonth = dateEnd.format('YYYY MMM');
    }

    getSailDayChanged() {
        this.newService.getTurbineWarrantyOne({ campaignName: this.params.campaignName, windfield: this.params.windfield, startDate: this.params.startDate }).subscribe(data => {
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
        if (this.type == "Sail days changed") {
            for (var i = 0; i < this.sailDayChanged.length; i++) {
                if (moment(this.sailDayChanged[i].changeDate).format('YYYY MMM') == this.selectedMonth) {
                    this.edits.push(this.sailDayChanged[i]);
                }
            }
        } else if (this.type == "Active listings") {
            for (var i = 0; i < this.activeListings.length; i++) {
                if (moment(this.activeListings[i].dateChanged).format('YYYY MMM') == this.selectedMonth) {
                    this.edits.push(this.activeListings[i]);
                }
            }
        } else {
            for (var i = 0; i < this.vesselsToAdd.length; i++) {
                if (moment(this.vesselsToAdd[i].dateAdded).format('YYYY MMM') == this.selectedMonth) {
                    this.edits.push(this.vesselsToAdd[i]);
                }
            }
        }
        this.noData = (!this.edits[0]);
    }
}
