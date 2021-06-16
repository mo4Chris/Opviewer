import { Component, OnInit } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { CommonService } from '@app/common.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@app/shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';
import { UserModel } from '@app/models/userModel';
import { VesselModel, VesselOperationsClass } from '@app/models/vesselModel';

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

  username: string;
  user: UserModel;
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  allowed_vessels: UsermanagementVesselModel[] = [];
  selected_vessels: UsermanagementVesselModel[];

  multiSelectSettings = {
    idField: 'vessel_id',
    textField: 'nicename',
    allowSearchFilter: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    singleSelection: false
  };

  ngOnInit() {
    this.setUsernameFromParameter()
    this.newService.checkUserActive(this.tokenInfo.username).subscribe(userIsActive => {
      this.getUser();
    });
  }

  setUsernameFromParameter() {
    this.route.params.subscribe(param => {
      this.username = param?.username ?? 'N/a';
    })
  }

  getUser() {
    this.newService.getUserByUsername(this.username).subscribe(userdata => {
      // Loads the users this person is allowed to edit
      this.user = userdata[0];
      const is_admin = this.permission.admin;
      const is_same_client = this.tokenInfo.userCompany == this.user.client_name;
      if (!is_admin && !this.permission.userRead) return this.router.routeToAccessDenied();
      if (!is_admin && !is_same_client) return this.router.routeToAccessDenied();

      const isVesselMaster = this.user.permission.user_type == 'Vessel master';
      this.multiSelectSettings.singleSelection = isVesselMaster;

      // Requires user has been loaded, as the set of allowed vessels may differ
      // from own allowed vessels (admin)
      this.newService.getVesselsForClientByUser(this.user.username).subscribe(vessels => {
        this.allowed_vessels = vessels;
        this.selected_vessels = this.user.vessel_ids.map(_id => {
          return this.allowed_vessels.find(v => v.vessel_id == _id)
        })
        this.selected_vessels = this.selected_vessels.filter(v => v!= null)
      });
    });
  }

  saveUserBoats() {
    const vessels_ids = this.selected_vessels.map(vessel => vessel.vessel_id)
    this.newService.saveUserVessels(this.user.username, vessels_ids).subscribe({
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

export interface UsermanagementVesselModel {
  mmsi: number,
  nicename: string,
  vessel_id:number,
  active: boolean,
  operations_class: VesselOperationsClass
}
