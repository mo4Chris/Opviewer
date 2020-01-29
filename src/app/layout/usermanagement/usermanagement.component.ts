import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';

import * as jwt_decode from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { TokenModel } from '../../models/tokenModel';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
  animations: [routerTransition()]
})
export class UserManagementComponent implements OnInit {

    constructor(
        public router: Router,
        private newService: CommonService,
        private route: ActivatedRoute,
        private userService: UserService,
        public permission: PermissionService,
        public alert: AlertService,
    ) { }

    username = this.getUsernameFromParameter();
    user;
    tokenInfo: TokenModel = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
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
        this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
            if (userIsActive !== true) {
                localStorage.removeItem('isLoggedin');
                localStorage.removeItem('token');
                this.router.navigate(['login']);
            } else {
                this.getUser();
            }
        });
        console.log(this);
    }

    getUsernameFromParameter() {
        let username;
        this.route.params.subscribe(params => username = String(params.username));
        return username;
    }

    getUser() {
        this.newService.getUserByUsername({username: this.username}).subscribe(data => {
            // Loads the users this person is allowed to edit
            if (!this.permission.admin) {
                if (!this.permission.userRead) {
                    this.router.navigate(['/access-denied']);
                } else {
                    if (this.tokenInfo.userCompany !== data[0].client) {
                        this.router.navigate(['/access-denied']);
                    }
                }
            }
            this.newService.getVesselsForCompany([{
                client: data[0].client,
                notHired: 1 }]
            ).subscribe(vessels => {
                this.boats = vessels;
            });
            this.user = data[0];
            this.multiSelectSettings.singleSelection = (data[0].permissions === 'Vessel master');
        });
    }

    saveUserBoats() {
        this.newService.saveUserBoats(this.user).pipe(
            map(
                (res) => {
                    this.alert.sendAlert({
                        text: res.data,
                        type: 'success'
                    });
                }
            ),
            catchError(error => {
                this.alert.sendAlert({
                    text: error,
                    type: 'danger'
                });
                throw error;
            })
        ).subscribe();
    }

}
