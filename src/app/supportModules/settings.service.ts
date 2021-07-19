import { Injectable, NgModule, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { CommonService } from '../common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  Timezone: TimezoneOptions = 'vessel';
  unit_distance: distanceOptions = 'NM';
  unit_speed: speedOptions = 'knots';
  unit_weight: weightOptions = 'ton';
  unit_latlng: GpsOptions = 'DMS';
  LongtermFilterFailedTransfers = false;
  dpr_map_drawExclusionZone = 0;

  // Some session settings - these are not saved across sessions
  weatherChartHidden = {
    Hs: false,
    windAvg: false,
    'V2v transfers': false,
    'Turbine transfers': false,
    'Platform transfers': false,
    'Transit': false,
    'Vessel transfers': false,
  };

  constructor (
    private newService: CommonService,
    public permission: PermissionService,
    private alert: AlertService,
  ) {
    this.loadSettings();
  }

  options = {
    time: ['vessel', 'own', 'utc', 'custom', 'timezone'],
    customTimeZone: [
      {name: 'utc -12 hours', value: -12},
      {name: 'utc -11 hours', value: -11},
      {name: 'utc -10 hour', value: -10},
      {name: 'utc -9 hours', value: -9},
      {name: 'utc -8 hours', value: -8},
      {name: 'utc -7 hour', value: -7},
      {name: 'utc -6 hours', value: -6},
      {name: 'utc -5 hours', value: -5},
      {name: 'utc -4 hour', value: -4},
      {name: 'utc -3 hours', value: -3},
      {name: 'utc -2 hours', value: -2},
      {name: 'utc -1 hour', value: -1},
      {name: 'utc +0 hours', value: 0},
      {name: 'utc +1 hour', value: 1},
      {name: 'utc +2 hours', value: 2},
      {name: 'utc +3 hours', value: 3},
      {name: 'utc +4 hours', value: 4},
      {name: 'utc +5 hours', value: 5},
      {name: 'utc +6 hours', value: 6},
      {name: 'utc +7 hours', value: 7},
      {name: 'utc +8 hours', value: 8},
      {name: 'utc +9 hours', value: 9},
      {name: 'utc +10 hours', value: 10},
      {name: 'utc +11 hours', value: 11},
      {name: 'utc +12 hours', value: 12},
    ],
    customTimeZoneLocations: [
      {name: 'London UTC', value: 'Europe/London'},
      {name: 'Dublin UTC', value: 'Europe/Dublin'},
      {name: 'Amsterdam UTC +1', value: 'Europe/Amsterdam'},
      {name: 'Berlin UTC +1', value: 'Europe/Berlin'},
      {name: 'Brussels UTC +1', value: 'Europe/Brussels'},
      {name: 'Copenhagen UTC +1', value: 'Europe/Copenhagen'},
      {name: 'Oslo UTC +1', value: 'Europe/Oslo'},
      {name: 'Paris UTC +1', value: 'Europe/Paris'},
      {name: 'Stockholm UTC +1', value: 'Europe/Stockholm'},
      {name: 'Helsinki UTC +2', value: 'Europe/Helsinki'},
    ],
    weight: ['ton', 'kg'],
    speed: ['km/h', 'mph', 'knots', 'm/s'],
    distance: ['km', 'mile', 'NM'],
    logical: [{name: 'Enable', value: 1}, {name: 'Disable', value: 0}]
  };
  localTimeZoneOffset: number = moment().utcOffset() / 60; // Offset in hours
  fixedTimeZoneOffset = 0;
  fixedTimeZoneLoc = 'Europe/London';

  // ##################### Functions ###########################
  reload() {
    this.loadSettings;
  }

  getTimeOffset(vesselOffsetHours: number = 0, date?: any) {
    // Returns the time offset in hours according to the chosen timezone settings
    // If a local offset is selected, the vesselOffset is used.
    const timezone = this.Timezone;
    if (typeof timezone == 'number') {
      return <number> timezone;
    } else {
      switch (timezone) {
        case 'vessel':
          return +vesselOffsetHours || 0;
        case 'own':
          return +this.localTimeZoneOffset;
        case 'utc':
          return 0;
        case 'custom':
          return +this.fixedTimeZoneOffset;
        case 'timezone':
          // ToDo: implement timezone coding?
          const T = moment.tz(date, this.fixedTimeZoneLoc);
          // @ts-ignore
          const timezoneOffset = T._offset / 60;
          return timezoneOffset;
        default:
          console.error('Invalid timezone setting!');
      }
    }
  }

  private loadSettings() {
    // loads the settings from the database
    this.newService.loadUserSettings().subscribe(settings => {
      if (settings == null || typeof(settings) != 'object') return;
      this.initSetting('Timezone', settings?.timezone?.type)
      this.initSetting('fixedTimeZoneOffset', settings?.timezone?.fixedTimeZoneOffset);
      this.initSetting('fixedTimeZoneLoc', settings?.timezone?.fixedTimeZoneLoc)

      this.initSetting('unit_distance', settings?.unit?.distance)
      this.initSetting('unit_speed', settings?.unit?.speed)
      this.initSetting('unit_weight', settings?.unit?.weight)
      this.initSetting('unit_gps', settings?.unit?.gps)
      this.initSetting('weatherChartHidden', settings?.weather_chart)
      this.initSetting('LongtermFilterFailedTransfers', settings?.longterm?.filterFailedTransfers)
      this.initSetting('dpr_map_drawExclusionZone', settings?.dpr?.map?.drawExclusionZone)
    });
  }

  initSetting(key: string, value: any, allowed: any[]=null): void {
    if (value == null) return;
    if (allowed == null) return this[key] = value;
    if (allowed.some(o => value == o)) return this[key] = value;
  }

  saveSettings() {
    this.alert.clear();
    this.newService.saveUserSettings({
      timezone: {
        type: String(this.Timezone),
        fixedTimeZoneOffset: this.fixedTimeZoneOffset,
        fixedTimeZoneLoc: this.fixedTimeZoneLoc
      },
      unit: {
        distance: this.unit_distance,
        speed: this.unit_speed,
        weight: this.unit_weight,
        gps: this.unit_latlng,
      },
      longterm: {
        filterFailedTransfers: this.LongtermFilterFailedTransfers
      },
      weather_chart: this.weatherChartHidden,
      dpr: {
        map: {
          drawExclusionZone: this.dpr_map_drawExclusionZone
        }
      },
    }).subscribe(data => {
      this.alert.sendAlert({
        text: 'Saved user settings',
        type: 'success'
      })
    }, err => this.alert.sendAlert({
          text: 'Failed to save settings',
          type: 'danger'
        })
    );
  }
}

type TimezoneOptions = number | 'vessel' | 'utc' | 'own' | 'custom' | 'timezone';
type speedOptions = 'km/h' | 'mph' | 'knots' | 'm/s';
type distanceOptions = 'km' | 'mile' | 'NM';
type weightOptions = 'ton' | 'kg';
type GpsOptions = 'DMS' | 'fractional';

interface LongtermSettings {
  filterFailedTransfers: boolean;
}

export interface storedSettings {
  timezone: {
    type: string,
    fixedTimeZoneOffset: number,
    fixedTimeZoneLoc: string,
  };
  unit: {
    distance: distanceOptions,
    speed: speedOptions,
    weight: weightOptions,
    gps: GpsOptions
  };
  longterm: LongtermSettings;
  weather_chart: any;
  dpr: any;
}

