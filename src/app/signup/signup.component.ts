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
    registerUserData = {
        permissions: '',
        client: ''
    };
    businessNames;
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission = this.tokenInfo.userPermission;
    permissions = ["Vessel master","Marine controller"];

    constructor(public router: Router, private _auth: AuthService, private newService :CommonService) {}

    onRegistration() {
        if (!this.permissions.find(permission => permission == this.registerUserData.permissions)){
            this.router.navigate(['/access-denied']);
        }
        if (this.userPermission != 'admin') {
            this.registerUserData.client = this.tokenInfo.userCompany;
        }
        this._auth.registerUser(this.registerUserData).subscribe(
    		res => {
    			this.router.navigate(['/dashboard']);
    		},
    		err => {
                if (err instanceof HttpErrorResponse) {
    				if (err.status === 401){
    					this.router.navigate(['/signup'])
    				}
    			}
    		})

    }

    ngOnInit() {
        if (this.userPermission != "admin") {
            if (this.userPermission != "Logistics specialist") {
                this.router.navigate(['/access-denied']);
            }
        } else {
            this.permissions = this.permissions.concat(["Logistics specialist", "admin"]);
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
