import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { invalid } from 'moment';

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

    constructor(private route: ActivatedRoute, private _auth: AuthService) { }

    getTokenFromParameter() {
        let _token;
        this.route.params.subscribe(params => { console.log(params); _token = String(params.token) }); //TODO delete the console.log()
        console.log(_token);
        return _token;
    }

    getUserByToken(token) {
        this._auth.getUserByToken({ passwordToken: token }).subscribe(data => this.user = data.username);
    }

    ngOnInit() {
        if (this.token && this.token != "undefined") {
            this.getUserByToken(this.token);
        } else {
            this.getUserByToken("test");
        }
    }

    setUserPassword() {
        this._auth.setUserPassword({ passwordToken: "test", password: this.passwords.password, confirmPassword: this.passwords.confirmPassword }).subscribe(); //TODO ask for this.token
    }
}
