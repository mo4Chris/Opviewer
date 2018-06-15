import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {CommonService} from '../common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';



@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
	registerUserData = {};
    businessNames;
    constructor(public router: Router, private _auth: AuthService, private newService :CommonService) {}

    onRegistration(){

    	this._auth.registerUser(this.registerUserData).subscribe(
    		res => {
    			this.router.navigate(['/dashboard']);
    		},
    		err => {
    			if(err instanceof HttpErrorResponse){
    				if (err.status === 401){
    					this.router.navigate(['/signup'])
    				}
    			}
    		})

    }

    ngOnInit() {
        this.newService.GetCompanies().subscribe(data =>  this.businessNames = data);
    }
}
