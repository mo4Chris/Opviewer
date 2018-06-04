import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

    constructor(public router: Router, private _auth: AuthService) {}

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

    ngOnInit() {}
}
