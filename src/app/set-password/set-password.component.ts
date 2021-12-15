import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import * as base32 from 'hi-base32';
import * as bCrypt from 'bcryptjs';
import * as twoFactor from 'node-2fa';
import { AlertService } from '@app/supportModules/alert.service';
import { Observable } from 'rxjs';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  animations: [routerTransition()]
})
export class SetPasswordComponent implements OnInit {
  passwords = { password: '', confirmPassword: '', confirm2fa: '' };
  username = '';
  token = '';

  noUser = false;
  showAfterscreen = false;

  QRCode: string;
  secretAsBase32: string;
  modalReference: NgbModalRef;
  initiate2fa: boolean;
  public requires2fa: boolean;

  constructor(
    public router: RouterService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private _auth: AuthService,
    private alert: AlertService,
  ) { }

  initParameters(): Observable<void> {
    return this.route.params.pipe(map(params => {
      this.token = String(params.token)
      this.username = String(params.user)
    }));
  }

  ngOnInit() {
    this.initParameters().subscribe(() => {
      if (!this.token || this.token == 'undefined') return this.noUser = true;
      this._auth.getRegistrationInformation({
        registration_token: this.token,
        username: this.username
      }).subscribe(data => {
        if (!data.username) return this.noUser = true;
        this.username = data.username;
        this.requires2fa = data.requires2fa;
        this.set2faExistence(data.secret2fa);
      }, err => {
        this.noUser = true;
        if (err.status == 400) {
          return this.alert.sendAlert({
            type: 'danger',
            text: 'Registration token invalid - please contact your supervisor',
            timeout: null})
        }
        this.alert.sendAlert({
          type: 'danger',
          text: 'Failed to load registration information - please try to reload the page',
          timeout: null})
      });
    })
  }

  createBase32SecretCode() {
    const secretString = bCrypt.hashSync(Math.random().toString(18).substring(2), 10);
    const secretStringAsBase32 = base32.encode(secretString);
    this.secretAsBase32 = secretStringAsBase32;
    this.createQrCode();
  }

  set2faExistence(secret2faResponse: string) {
    if ( secret2faResponse == '' || secret2faResponse == null ) {
      this.initiate2fa = true;
      this.createBase32SecretCode();
    } else {
      this.initiate2fa = false;
      this.secretAsBase32 = secret2faResponse;
    }
  }

  createQrCode() {
    this.QRCode = `otpauth://totp/${this.username}?secret=${this.secretAsBase32}&issuer=MO4%20Dataviewer`;
  }


  setUserPassword() {
    this.alert.clear();
    if (this.passwords.password.length < 7) return this.alert.sendAlert({
      text: 'Your password does not meet the minimum length of 7 characters',
      type: 'danger'
    });
    if (this.passwords.password !== this.passwords.confirmPassword) return this.alert.sendAlert({
      text: 'Password and confirmation do not match!',
      type: 'danger'
    });

    if (!this.requires2fa) this._setPassword(null, null);
    if (!this.initiate2fa) this._setPassword(null, this.passwords.confirm2fa);

    if (twoFactor.verifyToken(this.secretAsBase32, this.passwords.confirm2fa) == null) {
      return this.alert.sendAlert({
        text: 'Your two factor authentication code is incorrect or has expired. Please try again',
        type: 'danger'
      });
    }
    this._setPassword(this.secretAsBase32, this.passwords.confirm2fa);
  }

  private _setPassword(secret2fa: string, confirm2fa: string) {
    const request_body = {
      passwordToken: this.token,
      password: this.passwords.password,
      confirmPassword: this.passwords.confirmPassword
    };
    if (secret2fa) request_body['secret2fa'] = secret2fa;
    if (confirm2fa) request_body['confirm2fa'] = confirm2fa;
    this._auth.setUserPassword(request_body).subscribe({
      next: () => {
        this.alert.clear();
        this.showAfterscreen = true;
        setTimeout(() => {
          this.router.routeToLogin();
        }, 3000);
      },
      error: (error) => {
        this.alert.sendAlert({
          text: error,
          type: 'danger'
        });
        throw error;
      }
    })
  }


  openModal(content) {
    this.modalReference = this.modalService.open(content, { centered: true, size: 'lg' });
  }
  closeModal() {
    this.modalReference.close();
  }
}
