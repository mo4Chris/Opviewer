import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/common.service';
import { routerTransition } from '@app/router.animations';
import { AuthService } from '@app/auth.service';
import { UserService } from '@app/shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { UserType } from '@app/shared/enums/UserType';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {

    registerUserData = {
        permissions: '',
        email: '',
        client: '',
        username: '',
        password: ''
    };

    businessNames: string[]; // Loaded iff admin
    createPermissions: UserType[] = [
        'Vessel master',
        'Logistics specialist',
        'Marine controller',
        'Client representative',
        'Qhse specialist'
    ];

    constructor(
      public router: Router,
      private _auth: AuthService,
      private newService: CommonService,
      private userService: UserService,
      public permission: PermissionService,
      public alert: AlertService,
    ) {}

    onRegistration() {
        if (!this.createPermissions.find(_permission => _permission === this.registerUserData.permissions)) {
            this.alert.sendAlert({
              text: 'You\'re not allowed to add a user of this type',
              type: 'danger',
            });
            return;
        }
        if (!this.permission.admin) {
            const tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
            this.registerUserData.client = tokenInfo.userCompany;
        } else if (this.businessNames.indexOf(this.registerUserData.client) < 0) {
            this.alert.sendAlert({
              text: 'User needs a client',
              type: 'danger',
            });
            return;
        }
        this._auth.registerUser(this.registerUserData).subscribe(
            res => {
                this.router.navigate(['/dashboard', {status: 'success', message: res.data }]);
            },
            err => {
                if (err.status === 401) {
                    this.alert.sendAlert({ type: 'danger', text: err._body});
                    this.router.navigate(['/signup']);
                } else {
                  this.alert.sendAlert({ type: 'danger', text: 'Something is wrong, contact BMO Offshore' });
                }
            });

    }

    ngOnInit() {
        if (!this.permission.admin) {
            if (this.permission.userCreate) {
                    // this.permissions = ['Contract manager'];
            } else {
                this.router.navigate(['/access-denied']);
            }
        } else {
            this.createPermissions = this.createPermissions.concat(['admin', 'Logistics specialist']);
            this.newService.getCompanies().subscribe(data => this.businessNames = data);
        }
    }
}
