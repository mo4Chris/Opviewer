import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import { Router } from '../../../../node_modules/@angular/router';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { StringMutationService } from '../../shared/services/stringMutation.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [routerTransition()]
})
export class UsersComponent implements OnInit {
  constructor(
    private newService: CommonService,
    private _router: Router,
    private userService: UserService,
    private stringMutationService: StringMutationService,
    public permission: PermissionService,
    private alert: AlertService
  ) { }
  errData;
  userData;
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  showAlert = false;
  sortedData;
  sort = { active: '', isAsc: true };

  ngOnInit() {
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (userIsActive === true) {
        if (!this.permission.admin && !this.permission.userRead) return this._router.navigate(['/access-denied']);
        this.newService.getUsers().subscribe(
          data => {
            this.userData = data
          },
          err => this.errData = err
        );
      } else {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('token');
        this._router.navigate(['login']);
      }
    });
  }

  redirectManageBoats(username) {
    this._router.navigate(['usermanagement', { username: username }]);
  }

  resetPassword(username: string) {
    this.newService.resetPassword(username).subscribe(res => {
      this.alert.sendAlert({text: res.data, type: 'success'});
    }, error => {
      this.alert.sendAlert({text: error, type: 'danger'});
      throw error;
    });
  }

  setActive(user: any) {
    this.newService.setActive({
      username: user.username,
    }).pipe(
    map(
        (res) => {
          this.alert.sendAlert({text: res.data, type: 'success'});
          user.active = 1;
        }
      ),
      catchError(error => {
        this.alert.sendAlert({text: error, type: 'danger'});
        throw error;
      })
    ).subscribe();
  }

  setInactive(user) {
    this.newService.setInactive({
      username: user.username,
    }).pipe(
      map(
        (res) => {
          this.alert.sendAlert({text: res.data, type: 'success'});
          user.active = 0;
        }
      ),
      catchError(error => {
        this.alert.sendAlert({text: error, type: 'danger'});
        throw error;
      })
    ).subscribe();
  }

  sortData(sort) {
    this.sort = sort;
    const data = this.userData.slice();
    if (!sort.active || sort.isAsc === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.isAsc;
      switch (sort.active) {
        case 'permissions': return this.stringMutationService.compare(a.permissions, b.permissions, isAsc);
        case 'client': return this.stringMutationService.compare(a.client, b.client, isAsc);
        case 'username': return this.stringMutationService.compare(a.username, b.username, isAsc);
        default: return 0;
      }
    });
    this.userData = this.sortedData;
  }
}
