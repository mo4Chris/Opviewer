import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import * as jwt_decode from 'jwt-decode';
import { Router } from '../../../../node_modules/@angular/router';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    animations: [routerTransition()]
})
export class UsersComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router, private userService: UserService ) { }
    errData;
    userData;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission = this.tokenInfo.userPermission;
    alert = { type: '', message: '' };
    timeout;
    showAlert = false;

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

    resetPassword(id) {
        this.newService.resetPassword({ _id: id }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
    }
}
