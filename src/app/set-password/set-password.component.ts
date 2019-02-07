import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError } from 'rxjs/operators';
import { CommonService } from '../common.service';
import * as base32 from 'hi-base32';
import * as bCrypt from 'bcryptjs';
import * as twoFactor from 'node-2fa';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  animations: [routerTransition()]
})
export class SetPasswordComponent implements OnInit {

    alert = { type: 'danger', message: 'Something is wrong, contact BMO Offshore' };
    showAlert = false;
    passwords = { password: '', confirmPassword: '', confirm2fa: '' };
    user = '';
    token = this.getTokenFromParameter();
    noUser = false;
    showAfterscreen = false;
    QRCode;
    QRCodeShort;
    secretAsBase32;
    initiate2fa;
    modalReference: NgbModalRef;

    constructor(public router: Router, private newService: CommonService, private route: ActivatedRoute, private modalService: NgbModal, private _auth: AuthService) { }

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
        this.checkIf2faSecretExists();
        this.initiate2fa = true;

        if (this.token && this.token !== 'undefined') {
            this.getUserByToken(this.token);
        } else {
            this.noUser = true;
        }
    }

    createBase32SecretCode() {
        const secretString = bCrypt.hashSync(Math.random().toString(18).substring(2), 10);
        const secretStringAsBase32 = base32.encode(secretString);
        this.secretAsBase32 = secretStringAsBase32;
        this.createQrCode();
    }

    checkIf2faSecretExists() {
        this.newService.get2faExistence({userEmail: this.getUsernameFromParameter()}).subscribe(data => {
            console.log(data);
            if ( data.secret2fa === '' ) {
                this.createBase32SecretCode();
            } else {
                this.secretAsBase32 = data;
            }
        });
    }

    createQrCode() {
        this.QRCode = 'otpauth://totp/' + this.getUsernameFromParameter() + '?secret=' + this.secretAsBase32 + '&issuer=BMO%20Dataviewer';
    }

    openModal(content) {

        this.modalReference = this.modalService.open(content, { centered: true, size: 'lg' });
    }

    closeModal() {
        this.modalReference.close();
    }

    setUserPassword() {

        if (this.passwords.password.length < 7) {
            this.alert.type = 'danger';
            this.alert.message = 'Your password does not meet the minimum length of 7 characters';
            this.showAlert = true;

        } else if (this.passwords.password !== this.passwords.confirmPassword) {
            this.alert.type = 'danger';
            this.alert.message = 'Your passwords are not the same.';
            this.showAlert = true;
        } else {
            if (twoFactor.verifyToken(this.secretAsBase32, this.passwords.confirm2fa) !== null) {
                this._auth.setUserPassword({ passwordToken: this.token, password: this.passwords.password, confirmPassword: this.passwords.confirmPassword, secret2fa: this.secretAsBase32 }).pipe(
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
            } else {
                this.alert.type = 'danger';
                this.alert.message = 'Your two factor authentication code is incorrect or has expired. Please try again';
                this.showAlert = true;

            }
        }
    }
}
