import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';


import * as jwt_decode from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
  animations: [routerTransition()]
})
export class UserManagementComponent implements OnInit {

    constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute) { }
    username = this.getUsernameFromParameter();
    user = this.getUser();
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    boats;

    multiSelectSettings = {
        idField: 'mmsi',
        textField: 'nicename',
        allowSearchFilter: true,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        singleSelection: false
    };

    ngOnInit() {
        
    }

    getUsernameFromParameter() {
        let username;
        this.route.params.subscribe(params => username = String(params.username));
        return username;
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

    getUser() {
        this.newService.getUserByUsername({ username: this.username }).subscribe(data => {
            if (data[0].permissions == "admin" || data[0].permissions == "Logistics specialist" || data[0] == null) {
                this.router.navigate(['/access-denied']);
            }
            if (this.tokenInfo.userPermission != "admin") {
                if (this.tokenInfo.userPermission != "Logistics specialist") {
                    this.router.navigate(['/access-denied']);
                } else {
                    if (this.tokenInfo.userCompany != data[0].client) {
                        this.router.navigate(['/access-denied']);
                    }
                }
            }
            this.newService.GetVesselsForCompany([{ client: data[0].client }]).subscribe(data => { this.boats = data; });
            this.user = data[0];
            this.multiSelectSettings.singleSelection = (data[0].permissions == "Vessel master")
        });
    }

    saveUserBoats() {
        this.newService.saveUserBoats(this.user).subscribe();
    }
    
}
