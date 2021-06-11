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
    idField: 'vessel_id',
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
      username =  String(params.username);
    });
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
      const isVesselMaster = userdata[0].permission.user_type == 'vessel master'
      this.multiSelectSettings.singleSelection = isVesselMaster;
      // this.newService.getVesselsForCompany([{
      //   client: userdata[0].client_name,
      //   notHired: 1
      // }])
      this.newService.getVesselNameAndIDById({
        vessel_ids: userdata[0]?.vessel_ids
      }).subscribe(vessels => {
        this.user.boats = vessels;
      });

      this.newService.getVesselForUser(userdata[0].username).subscribe(vessels => {
        // ToDo get rid of this after updates to user import routines
        this.boats = vessels;
      });
    });
  }

  saveUserBoats() {
    this.newService.saveUserBoats(this.user).subscribe({
      next: (res) => {
        this.alert.sendAlert({
          text: res.data,
          type: 'success'
        });
      },
      error: error => {
        this.alert.sendAlert({
          text: error,
          type: 'danger'
        });
        throw error;
      }
    });
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
