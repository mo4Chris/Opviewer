import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {CommonService} from '../common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import * as jwt_decode from 'jwt-decode';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
    
    registerUserData:any = {
        Permissions: '',
        client: '',
        username: '',
        password: ''
    };

    businessNames;
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission = this.tokenInfo.userPermission;
    permissions = ['Vessel master', 'Marine controller'];
    alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
    showAlert = false;

    constructor(public router: Router, private _auth: AuthService, private newService :CommonService) {}

    onRegistration() {
        if (!this.permissions.find(permission => permission == this.registerUserData.permissions)){
            this.showAlert = true;
            this.alert.message = "You\'re not allowed to add a user of this type";
            return;
        }
        if (this.userPermission != 'admin') {
            this.registerUserData.client = this.tokenInfo.userCompany;
        } else if (this.businessNames.indexOf(this.registerUserData.client) < 0) {
            this.showAlert = true;
            this.alert.message = "User needs a client";
            return;
        }
        this._auth.registerUser(this.registerUserData).subscribe(
    		res => {
    			this.router.navigate(['/dashboard']);
    		},
    		err => {
                this.showAlert = true;
                this.alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
                if (err.status === 401) {
                    this.alert.message = err._body;
                    this.router.navigate(['/signup']);
    			}
    		})

    }

    ngOnInit() {
        if (this.userPermission != 'admin') {
            if (this.userPermission != 'Logistics specialist') {
                this.router.navigate(['/access-denied']);
            }
        } else {
            this.permissions = this.permissions.concat(['Logistics specialist', 'admin']);
            this.newService.GetCompanies().subscribe(data => this.businessNames = data);
        }
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }
}
