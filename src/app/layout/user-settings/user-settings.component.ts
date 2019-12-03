import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import { isNumber } from 'util';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../supportModules/event.service';
import { SettingsService } from '../../supportModules/settings.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  localTimeZoneOffset = 0;
  token = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  settingsOptions;

  alert = {
    active: false,
    text: '',
    type: '',
    timeout: null,
  };

  constructor(
    private newService: CommonService,
    private userService: UserService,
    private settings: SettingsService
  ) {
    this.loadFromLocalStorage();
    this.settingsOptions = settings.options;
  }

  getTokenExpiredDate() {
    return new Date(this.token.expires);
  }

  getTimeOffset(vesselOffset: number = 0): number {
    // Returns the time offset in hours according to the chosen timezone settings
    // If a local offset is selected, the vesselOffset is used.
    const timezone = this.settings.Timezone;
    if (isNumber(timezone)) {
      return timezone;
    } else {
      switch (timezone) {
        case 'vessel':
          return vesselOffset;
        case 'own':
          return this.localTimeZoneOffset;
        case 'utc':
          return 0;
        default:
          console.error('Invalid timezone setting!');
      }
    }
  }

  ngOnInit() {
  }

  changeSetting(settingsType: string) {
    // Triggered by any of the dropdowns
    this.saveToLocalStorage(settingsType);
    this.sendAlert({text: 'Settings saved!'});
  }

  sendAlert(opts: AlertOptions = {}) {
    const defaultOptions: AlertOptions = {
      text: '',
      type: 'success'
    };
    opts = {...defaultOptions, ...opts};
    if (this.alert.timeout) {
      clearTimeout(this.alert.timeout);
    }
    this.alert.active = true;
    this.alert.text = opts.text;
    this.alert.type = opts.type;
    this.alert.timeout = setTimeout(() => {
      this.alert.active = false;
    }, 2000);
  }

  loadFromLocalStorage() {
    // Get all settings from local storage, but use defaults if they are not stored
    Object.keys(this.settings).forEach(key => {
      const stored = localStorage.getItem('user-settings-' + key);
      if (stored !== null) {
        this.settings[key] = stored;
      }
    });
  }

  saveToLocalStorage(key ?: string) {
    // Saves one or all settings to local storage
    if (key) {
        const val = this.settings[key];
        if (val !== undefined) {
          localStorage.setItem('user-settings-' + key, val);
        }
    } else {
      Object.keys(this.settings).forEach((_key: string) => {
        localStorage.setItem('user-settings-' + _key, this.settings[_key]);
      });
    }
  }
}

type AlertTypeOptions = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';
export interface AlertOptions {
  text?: string;
  type?: AlertTypeOptions;
}
