import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    animations: [routerTransition()]
})
export class UsersComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router ) { }
    errData;
    userData;
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission = this.tokenInfo.userPermission;

    ngOnInit() {
        if (this.userPermission != "admin") {
            if (this.userPermission != "Logistics specialist") {
                this._router.navigate(['/access-denied']);
            } else {
                this.newService.getUsersForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => this.userData = data, err => this.errData = err);
            }
        } else {
            this.newService.getUsers().subscribe(data => this.userData = data, err => this.errData = err);
        }
    }

    redirectManageBoats(username) {
        this._router.navigate(['usermanagement', { username: username }]);
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

    resetPassword(id) {
        this.newService.resetPassword({ _id: id }).subscribe(data => this.errData = data.data);
    }
}
