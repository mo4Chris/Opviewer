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
    user;
    username = this.getUsernameFromParameter();
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    userpermissions = this.tokenInfo.userPermission;
    boats;

    multiSelectSettings = {
        idField: 'mmsi',
        textField: 'nicename',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true
    };

    ngOnInit() {
        this.newService.getUserByUsername({ username: this.username }).subscribe(data => {
            this.user = data[0];
            if (this.user.permissions == "admin" || this.user.permissions == "Logistics specialist" ) {
                this.router.navigate(['/access-denied']);
            }
            if (this.userpermissions != "admin") {
                if (this.userpermissions != "Logistics specialist") {
                    this.router.navigate(['/access-denied']);
                } else {
                    if (this.tokenInfo.userCompany != this.user.client) {
                        this.router.navigate(['/access-denied']);
                    }
                }
            }
            this.newService.GetVesselsForCompany([{ client: this.user.client }]).subscribe(data => this.boats = data);
        });
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

    
}
