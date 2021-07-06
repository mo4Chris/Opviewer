import { Component, OnInit } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { CommonService } from '@app/common.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '@app/shared/services/user.service';
import { StringMutationService } from '@app/shared/services/stringMutation.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { UserModel } from '@app/models/userModel';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [routerTransition()]
})
export class UsersComponent implements OnInit {
  constructor(
    public permission: PermissionService,
    private newService: CommonService,
    // private _router: Router,
    private userService: UserService,
    private stringMutationService: StringMutationService,
    private alert: AlertService,
    private routerService: RouterService,
  ) { }

  userData: UserModel[];
  sortedData: UserModel[];
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  showAlert = false;
  sort = { active: '', isAsc: true };

  ngOnInit() {
    this.newService.checkUserActive(
      this.tokenInfo.username
    ).subscribe(userIsActive => {
      if (userIsActive !== true) return this.userService.logout();
      if (!this.permission.admin && !this.permission.userRead) return this.routerService.routeToAccessDenied()
      this.newService.getUsers().subscribe(
        data => {
          this.userData = data
        },
        // err => this.errData = err
        err => this.alert.sendAlert({text: err})
      );
    });
  }

  redirectManageBoats(username: string) {
    // this._router.navigate(['usermanagement', { username: username }]);
    this.routerService.routeToManageUser(username)
  }

  resetPassword(username: string) {
    this.newService.resetPassword(username).subscribe(res => {
      this.alert.sendAlert({text: res.data, type: 'success'});
    }, error => {
      this.alert.sendAlert({text: error, type: 'danger'});
      throw error;
    });
  }

  setActive(user: UserModel) {
    this.newService.setActive({
      username: user.username,
    }).subscribe(res => {
      this.alert.sendAlert({text: res.data, type: 'success'});
      user.active = true;
    }, error => {
      this.alert.sendAlert({text: error, type: 'danger'});
      throw error;
    })
  }

  setInactive(user: UserModel) {
    this.newService.setInactive({
      username: user.username,
    }).pipe(
      map(
        (res) => {
          this.alert.sendAlert({text: res.data, type: 'success'});
          user.active = false;
        }
      ),
      catchError(error => {
        this.alert.sendAlert({text: error, type: 'danger'});
        throw error;
      })
    ).subscribe();
  }

  sortData(sort: { active: any, isAsc: any}) {
    this.sort = sort;
    const data = this.userData.slice();
    if (!sort.active || sort.isAsc === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.isAsc;
      switch (sort.active) {
        // case 'permissions': return this.stringMutationService.compare(a.permissions, b.permissions, isAsc);
        case 'permissions': return this.stringMutationService.compare(a.permission.user_type, b.permission.user_type, isAsc);
        // case 'client': return this.stringMutationService.compare(a.client, b.client, isAsc);
        case 'client': return this.stringMutationService.compare(a.client_name, b.client_name, isAsc);
        case 'username': return this.stringMutationService.compare(a.username, b.username, isAsc);
        default: return 0;
      }
    });
    this.userData = this.sortedData;
  }
}
