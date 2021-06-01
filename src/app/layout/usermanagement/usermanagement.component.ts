import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { TokenModel } from '../../models/tokenModel';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';
import { UserModel } from '@app/models/userModel';
import { VesselModel } from '@app/models/vesselModel';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
  animations: [routerTransition()]
})
export class UserManagementComponent implements OnInit {
  constructor(
    public router: RouterService,
    private newService: CommonService,
    private route: ActivatedRoute,
    private userService: UserService,
    public permission: PermissionService,
    public alert: AlertService,
  ) { }

  username = this.getUsernameFromParameter();
  user: UserModel;
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  boats: VesselModel[];

  multiSelectSettings = {
    idField: 'mmsi',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false
  };

  ngOnInit() {
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      if (userIsActive == true) return this.getUser();
      localStorage.removeItem('isLoggedin');
      localStorage.removeItem('token');
      this.router.routeToLogin();
    });
  }

  getUsernameFromParameter() {
    let username = '';
    this.route.params.subscribe(params => {
      console.log(params.username);
      username =  String(params.username);
    });
    console.log(username);
    return username;
  }

  getUser() {
    this.newService.getUserByUsername({
      username: this.username
    }).subscribe(userdata => {
      // Loads the users this person is allowed to edit
      if (!this.permission.admin) {
        if (!this.permission.userRead) {
          this.router.routeToAccessDenied();
        } else if (this.tokenInfo.userCompany !== userdata[0].client) {
          this.router.routeToAccessDenied();
        }
      }
      this.user = userdata[0];
      console.log(userdata);
      const isVesselMaster = userdata[0].permission.user_type == 'Vessel master'
      this.multiSelectSettings.singleSelection = isVesselMaster;
      // this.newService.getVesselsForCompany([{
      //   client: userdata[0].client_name,
      //   notHired: 1
      // }])
      this.newService.getVessel().subscribe(vessels => {
        this.boats = vessels;
      });
    });
  }

  saveUserBoats() {
    this.newService.saveUserBoats(this.user).pipe(
        map(
            (res) => {
                this.alert.sendAlert({
                    text: res.data,
                    type: 'success'
                });
            }
        ),
        catchError(error => {
            this.alert.sendAlert({
                text: error,
                type: 'danger'
            });
            throw error;
        })
    ).subscribe();
}

  updateUserPermissions() {
    this.newService.updateUserPermissions(
      this.user
    ).subscribe(res => {
      this.alert.sendAlert({
        text: res.data,
        type: 'success'
      });
    }, error => {
      this.alert.sendAlert({
        text: error,
        type: 'danger'
      });
      throw error;
    });
  }

}
