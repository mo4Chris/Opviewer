import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from "jwt-decode";
 
import { Router } from '../../../../node_modules/@angular/router';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router ) { }
    Repdata;
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    ScatterplotPermission = (this.tokenInfo.userPermission == 'admin' || this.tokenInfo.userPermission == 'Logistics specialist');
    valbutton = "Save";

    getDecodedAccessToken(token: string): any {
        try{
            return jwt_decode(token);
        }
        catch(Error){
            return null;
        }
      }

    ngOnInit() {
        if(this.tokenInfo.userPermission == "admin"){
            this.newService.GetVessel().subscribe(data => this.Repdata = data)
        } else {
            if (this.ScatterplotPermission) {
                this.newService.GetVesselsForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => this.Repdata = data)
            }
        }
    }

    redirectDailyVesselReport(mmsi){
        this._router.navigate(['vesselreport', {boatmmsi: mmsi}]);
    }

    redirectScatterplot(mmsi){
        this._router.navigate(['scatterplot', {boatmmsi: mmsi}]);
    }

    onSave = function (vessel, isValid: boolean) {
        vessel.mode = this.valbutton;
        this.newService.saveVessel(vessel)
            .subscribe(data => {
                alert(data.data);

                this.ngOnInit();
            }
                , error => this.errorMessage = error)
    }
    edit = function (kk) {
        this.id = kk._id;
        this.name = kk.name;
        this.address = kk.address;
        this.valbutton = "Update";
    }
}
