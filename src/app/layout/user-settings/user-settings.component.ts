import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@app/supportModules/settings.service';
import { AlertService } from '@app/supportModules/alert.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  public token = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  public settingsOptions: any;

  constructor(
    private userService: UserService,
    public settings: SettingsService,
    public alert: AlertService,
    public permission: PermissionService,
  ) {
    this.settingsOptions = settings.options;
  }

  getTokenExpiredDate() {
    return new Date(this.token.expires);
  }

  changeSetting() {
    this.alert.sendAlert({
      text: 'Setting changed for current session'}
    );
  }

  saveSettings() {
    this.alert.sendAlert({
      text: 'Settings saved!'
    });
    this.settings.saveSettings();
  }

  ngOnInit() {
  }
}

