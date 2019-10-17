import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import { Router } from '../../../../node_modules/@angular/router';
import { UserService } from '../../shared/services/user.service';
import { StringMutationService } from '../../shared/services/stringMutation.service';
import { VesselModel } from '../../models/vesselModel';
import { TokenModel } from '../../models/tokenModel';
import { Hotkeys } from '../../supportModules/hotkey.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    constructor(
        private stringMutationService: StringMutationService,
        private newService: CommonService,
        private _router: Router,
        private userService: UserService,
        private hotkeys: Hotkeys
        ) { }
    Repdata: VesselModel[];
    tokenInfo = new TokenModel(this.userService);
    ScatterplotCompanies = ['BMO', 'SSE Beatrice', 'Vattenfall', 'Seazip'];
    ScatterplotPermission: Boolean;
    filter = [];
    sortedData: VesselModel[];
    sort = { active: 'Client', isAsc: true };

    ngOnInit() {
        this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
        if (userIsActive === true) {
            this.ScatterplotPermission = this.testScatterPermission();
            if (this.tokenInfo.userPermission === 'admin') {
                this.newService.getVessel().subscribe(data => { this.Repdata = data; this.applyFilter(''); });
            } else {
                this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => { this.Repdata = data; this.applyFilter(''); });
            }
            this.hotkeys.addShortcut({
                keys: 'control.f',
            }).subscribe((hotkeyEvent) => {
                const inputElt = <HTMLInputElement> document.getElementsByClassName('form-control search')[0];
                inputElt.select();
            });
        } else {
            localStorage.removeItem('isLoggedin');
            localStorage.removeItem('token');
            this._router.navigate(['login']);
          }
        });
    }

    redirectDailyVesselReport(mmsi: Number) {
        this._router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    redirectLongterm(mmsi: Number, vesselName: String) {
        this._router.navigate(['longterm', {boatmmsi: mmsi, vesselName: vesselName}]);
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        if (filterValue === '') {
            this.filter = this.Repdata;
            this.sortData(this.sort);
            return;
        }
        this.filter = this.Repdata.filter(s => s.nicename.toLowerCase().includes(filterValue) || (s.mmsi + '').includes(filterValue));
        this.sortData(this.sort);
    }

    sortData(sort: {active: string, isAsc: boolean}) {
        this.sort = sort;
        const data: VesselModel[] = this.filter.slice();

        this.filter = data.sort((a, b) => {
            const isAsc = sort.isAsc;
            switch (sort.active) {
                case 'nicename': return this.stringMutationService.compare(a.nicename.toLowerCase(), b.nicename.toLowerCase(), isAsc);
                case 'mmsi': return this.stringMutationService.compare(a.mmsi, b.mmsi, isAsc);
                case 'client':
                    if (a.client.length === 0 ) {
                        return sort.isAsc ? -1 : 1;
                    } else if (b.client.length === 0) {
                        return sort.isAsc ? 1 : -1;
                    } else {
                        return this.stringMutationService.compare(a.client[0].toLowerCase(), b.client[0].toLowerCase(), isAsc);
                    }
                default: return 0;
            }
        });
    }

    testScatterPermission() {
        return (this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist') &&
            (this.ScatterplotCompanies.some(companyWithAccess => companyWithAccess === this.tokenInfo.userCompany));
    }
}

