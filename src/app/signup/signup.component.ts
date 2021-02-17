import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { routerTransition } from '@app/router.animations';
import { AuthService } from '@app/auth.service';
import { UserService } from '@app/shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { UserType } from '@app/shared/enums/UserType';
import { RouterService } from '@app/supportModules/router.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [routerTransition()]
})
export class SignupComponent implements OnInit {

  registerUserData = {
    client: '',
    email: '',
    permissions: '',
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
    private routerService: RouterService,
    private _auth: AuthService,
    private newService: CommonService,
    private userService: UserService,
    public permission: PermissionService,
    public alert: AlertService,
  ) {}

  onRegistration() {
    if (this.registerUserData.email.length == 0) return this.alert.sendAlert({ text: 'Please enter email', type: 'danger' })
    const isValidPermission = Boolean(this.createPermissions.find(p => p == this.registerUserData.permissions));
    if (!isValidPermission) return this.alert.sendAlert({ text: 'Please select an account type!', type: 'danger' })

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
    this._auth.registerUser(this.registerUserData).subscribe( res => {
      this.alert.sendAlert({ type: 'success', text: res.data })
      this.routerService.route(['dashboard', {status: 'success', message: res.data}]);
    }, err => {
      if (err.status === 401) {
        this.alert.sendAlert({ type: 'danger', text: err.error, timeout: null });
      } else {
        this.alert.sendAlert({ type: 'danger', text: 'Something is wrong, please contact MO4' });
      }
    });
  }

  ngOnInit() {
    if (!this.permission.admin && !this.permission.userCreate) {
      this.routerService.routeToAccessDenied();
    } else {
      this.createPermissions = this.createPermissions.concat(['admin', 'Logistics specialist']);
      this.newService.getCompanies().subscribe(data => this.businessNames = data);
    }
  }
}
