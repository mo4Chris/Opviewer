import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    loginUserData = {};

    constructor(public router: Router, private _auth: AuthService) {}
    

    ngOnInit() {}

    onLoggedin() {
        
    	this._auth.loginUser(this.loginUserData).subscribe(
    		res => {
    			localStorage.setItem('token', res.token);
    			this.router.navigate(['/dashboard']);
    		},
    		err => {
    			if(err instanceof HttpErrorResponse){
    				if (err.status === 401){
    					this.router.navigate(['/login'])
    				}
    			}
    		})
    	
   }
}
