import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  animations: [routerTransition()]
})
export class SetPasswordComponent implements OnInit {

    alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
    showAlert = false;
    passwords = { password: "", confirmPassword: "" }
    user = "";
    token = this.getTokenFromParameter();
    noUser = false;
    showAfterscreen = false;

    constructor(public router: Router, private route: ActivatedRoute, private _auth: AuthService) { }

    getTokenFromParameter() {
        let _token;
        this.route.params.subscribe(params => _token = String(params.token));
        return _token;
    }

    getUsernameFromParameter() {
        let _username;
        this.route.params.subscribe(params => _username = String(params.user));
        return _username;
    }

    getUserByToken(token) {
        this._auth.getUserByToken({ passwordToken: token, user: this.getUsernameFromParameter() }).subscribe(data => {
            if (data.username) {
                this.user = data.username;
            } else {
                this.noUser = true;
            }
        });
    }

    ngOnInit() {

        if (this.token && this.token != "undefined") {
            this.getUserByToken(this.token);
        } else {
            this.noUser = true;
        }
    }

    setUserPassword() {
        this._auth.setUserPassword({ passwordToken: this.token, password: this.passwords.password, confirmPassword: this.passwords.confirmPassword }).pipe(
            map(
                (res) => {
                    this.showAfterscreen = true;
                    setTimeout(() => this.router.navigate(['/login']), 3000);
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error._body;
                this.showAlert = true;
                throw error;
            })
        ).subscribe();
    }
}
