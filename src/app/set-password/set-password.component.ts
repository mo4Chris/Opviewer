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
import { UserType } from '@app/shared/enums/UserType';
import { AlertService } from '@app/supportModules/alert.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  animations: [routerTransition()]
})
export class SetPasswordComponent implements OnInit {
  passwords = { password: '', confirmPassword: '', confirm2fa: '' };
  username = '';
  userCompany: string;
  userType: UserType;
  token = '';
  noUser = false;
  showAfterscreen = false;
  QRCode: string;
  secretAsBase32: string;
  modalReference: NgbModalRef;
  initiate2fa: boolean;
  public requires2fa: boolean;

  constructor(
    public router: Router,
    private newService: CommonService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private _auth: AuthService,
    private alert: AlertService,
  ) { }

  initTokenFromParameter() {
    this.route.params.subscribe(params => this.token = String(params.token));
  }

  ngOnInit() {
    this.initTokenFromParameter();
    this.checkIf2faSecretExists();

    if (this.token && this.token !== 'undefined') {
      this.getUserByToken(this.token);
    } else {
      this.noUser = true;
    }
  }

  getUserByToken(token) {
    this._auth.getUserByToken({
      passwordToken: token,
      user: this.getUsernameFromParameter()
    }).subscribe(data => {
      if (data.username) {
        this.username = data.username;
        this.userCompany = data.client_name;
        this.userType = data.permission.user_type;
        this.requires2fa = data.requires2fa;
      } else {
        this.noUser = true;
      }
    });
  }

  getUsernameFromParameter(): Observable<String> {
    return this.route.params.pipe(map(params => String(params.user)));
  }

  createBase32SecretCode() {
    const secretString = bCrypt.hashSync(Math.random().toString(18).substring(2), 10);
    const secretStringAsBase32 = base32.encode(secretString);
    this.secretAsBase32 = secretStringAsBase32;
    this.createQrCode();
  }

  checkIf2faSecretExists() {
    this.newService.get2faExistence({
      userEmail: this.getUsernameFromParameter()
    }).subscribe(data => {
      if ( data.secret2fa === '' ) {
        this.initiate2fa = true;
        this.createBase32SecretCode();
      } else {
        this.initiate2fa = false;
        this.secretAsBase32 = data.secret2fa;
      }
    });
  }

  createQrCode() {
    this.QRCode = 'otpauth://totp/' + this.getUsernameFromParameter() + '?secret=' + this.secretAsBase32 + '&issuer=MO4%20Dataviewer';
  }

  openModal(content) {
    this.modalReference = this.modalService.open(content, { centered: true, size: 'lg' });
  }

  closeModal() {
    this.modalReference.close();
  }

  setUserPassword() {
    this.alert.clear();
    if (this.passwords.password.length < 7) {
      return this.alert.sendAlert({
        text: 'Your password does not meet the minimum length of 7 characters',
        type: 'danger'
      });
    } else if (this.passwords.password !== this.passwords.confirmPassword) {
      return this.alert.sendAlert({
        text: 'Password and confirmation are not equal!',
        type: 'danger'
      });
    }

    // TODO: Make sure that bibby fixes their stuff and then re-activate 2fa for them
    // TODO: Make sure to implement require2fa here
    const isBibbyVesselMaster = this.userCompany === 'Bibby Marine' && this.userType === 'Vessel master';
    if (isBibbyVesselMaster || !this.requires2fa) {
      return this._auth.setUserPassword({
        passwordToken: this.token,
        password: this.passwords.password,
        confirmPassword: this.passwords.confirmPassword,
        secret2fa: null,
      }).pipe(map((res) => {
          this.showAfterscreen = true;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }), catchError(error => {
          this.alert.sendAlert({
            text: error._body,
            type: 'danger'
          });
          throw error;
      })).subscribe();
    }

    if (twoFactor.verifyToken(this.secretAsBase32, this.passwords.confirm2fa) == null) {
      return this.alert.sendAlert({
        text: 'Your two factor authentication code is incorrect or has expired. Please try again',
        type: 'danger'
      });
    }

    this._auth.setUserPassword({
      passwordToken: this.token,
      password: this.passwords.password,
      confirmPassword: this.passwords.confirmPassword,
      secret2fa: this.secretAsBase32
    }).pipe(map((res) => {
        this.showAfterscreen = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }), catchError(err => {
        this.alert.sendAlert({
          text: err._body,
          type: 'danger'
        });
        throw err;
    })).subscribe();
  }
}
