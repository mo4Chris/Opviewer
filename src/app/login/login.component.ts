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
    alert = { message: 'Something is wrong, contact BMO Offshore' };
    timeout;
    showAlert = false;
    loginUserData = {
        username: '',
        password: '',
        confirm2fa: ''
    };

    constructor(public router: Router, private _auth: AuthService) {}


    ngOnInit() {}

    onLoggedin() {

        this._auth.loginUser(this.loginUserData).subscribe(
            res => {
                localStorage.setItem('token', res.token);
                this.router.navigate(['/dashboard']);
            },
            err => {
                this.showAlert = true;
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        this.alert.message = err.error;
                        this.router.navigate(['/login']);
                    }
                }
            });

   }
}
