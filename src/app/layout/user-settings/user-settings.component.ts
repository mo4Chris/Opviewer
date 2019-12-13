import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import { isNumber } from 'util';
import { UserService } from '../../shared/services/user.service';
import { SettingsService } from '../../supportModules/settings.service';
import { AlertService } from '../../supportModules/alert.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  token = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  settingsOptions: object;

  constructor(
    private userService: UserService,
    public settings: SettingsService,
    public alert: AlertService,
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

