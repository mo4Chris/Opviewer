import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {CommonService} from '../common.service';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { UserService } from '../shared/services/user.service';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {

    registerUserData: any = {
        Permissions: '',
        client: '',
        username: '',
        password: ''
    };

    businessNames;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission: string = this.tokenInfo.userPermission;
    permissions = ['Vessel master', 'Marine controller'];
    alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
    showAlert = false;

    constructor(public router: Router, private _auth: AuthService, private newService: CommonService, private userService: UserService) {}

    onRegistration() {
        if (!this.permissions.find(permission => permission === this.registerUserData.permissions)) {
            this.showAlert = true;
            this.alert.message = 'You\'re not allowed to add a user of this type';
            return;
        }
        if (this.userPermission !== 'admin') {
            this.registerUserData.client = this.tokenInfo.userCompany;
        } else if (this.businessNames.indexOf(this.registerUserData.client) < 0) {
            this.showAlert = true;
            this.alert.message = 'User needs a client';
            return;
        }
        this._auth.registerUser(this.registerUserData).subscribe(
            res => {
                this.router.navigate(['/dashboard', {status: 'success', message: res.data }]);
            },
            err => {
                this.showAlert = true;
                this.alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
                if (err.status === 401) {
                    this.alert.message = err._body;
                    this.router.navigate(['/signup']);
                }
            });

    }

    ngOnInit() {
        if (this.userPermission !== 'admin') {
            if (this.userPermission !== 'Logistics specialist') {
                if(this.userPermission !== 'Contract manager') {
                    this.permissions = ['Contract manager'];
                } else {
                    this.router.navigate(['/access-denied']);
                }
            }
        } else {
            this.permissions = this.permissions.concat(['Logistics specialist', 'Contract manager', 'admin']);
            this.newService.getCompanies().subscribe(data => this.businessNames = data);
        }
    }
}
