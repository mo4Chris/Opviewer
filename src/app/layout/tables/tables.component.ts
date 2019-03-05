import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
 
import { Router } from '../../../../node_modules/@angular/router';
import { UserService } from '../../shared/services/user.service';
import { StringMutationService } from '../../shared/services/stringMutation.service';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    constructor(private stringMutationService: StringMutationService, private newService: CommonService, private _router: Router, private userService: UserService ) { }
    Repdata;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    ScatterplotPermission = (this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist');
    valbutton = "Save";
    filter = [];
    sortedData;
    sort = { active: '', isAsc: true };

    ngOnInit() {
        if(this.tokenInfo.userPermission == "admin"){
            this.newService.getVessel().subscribe(data => { this.Repdata = data; this.applyFilter(''); });
        } else {
            this.newService.getVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => { this.Repdata = data; this.applyFilter(''); });
        }
    }

    redirectDailyVesselReport(mmsi){
        this._router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    redirectScatterplot(mmsi){
        this._router.navigate(['scatterplot', {boatmmsi: mmsi}]);
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        let filter = [];
        if(filterValue == ''){
            this.filter = this.Repdata;
            this.sortData(this.sort);
            return
        }
        this.Repdata.forEach(function(element, index) {
            if(element.nicename.toLowerCase().includes(filterValue) || (element.mmsi+'').includes(filterValue)) {
                filter.push(element);
            }
        });
        this.filter = filter;
        this.sortData(this.sort);
    }

    sortData(sort) {
        this.sort = sort;
        const data = this.filter.slice();
        if (!sort.active || sort.isAsc === '') {
            this.filter = data;
            return;
        }

        this.filter = data.sort((a, b) => {
            const isAsc = sort.isAsc;
            switch (sort.active) {
                case 'nicename': return this.stringMutationService.compare(a.nicename.toLowerCase(), b.nicename.toLowerCase(), isAsc);
                case 'mmsi': return this.stringMutationService.compare(a.mmsi, b.mmsi, isAsc);
                case 'client': return this.stringMutationService.compare(a.client.toLowerCase(), b.client.toLowerCase(), isAsc);
                default: return 0;
            }
        });
    }
}
