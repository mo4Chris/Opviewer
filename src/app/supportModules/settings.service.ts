import { Injectable, NgModule } from '@angular/core';
import { isNumber } from 'util';
import * as moment from 'moment-timezone';
import { CommonService } from '../common.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    Timezone: TimezoneOptions = 'vessel';
    unit_distance: distanceOptions = 'NM';
    unit_speed: speedOptions = 'knots';
    unit_weight: weightOptions = 'ton';

    constructor (
        private newService: CommonService
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
    };
    localTimeZoneOffset: number = moment().utcOffset() / 60; // Offset in hours
    fixedTimeZoneOffset = 0;
    fixedTimeZoneLoc = 'Europe/London';

    // ##################### Functions ###########################
    getTimeOffset(vesselOffsetHours: number = 0) {
        // Returns the time offset in hours according to the chosen timezone settings
        // If a local offset is selected, the vesselOffset is used.
        const timezone = this.Timezone;
        if (isNumber(timezone)) {
            return <number> timezone;
        } else {
            switch (timezone) {
                case 'vessel':
                    return vesselOffsetHours;
                case 'own':
                    return this.localTimeZoneOffset;
                case 'utc':
                    return 0;
                case 'custom':
                  return this.fixedTimeZoneOffset;
                case 'timezone':
                    return 0;
                default:
                    console.error('Invalid timezone setting!');
            }
        }
    }

    private loadSettings() {
        // loads the settings from the database
        this.newService.loadUserSettings().subscribe(settings => {
            if (typeof settings === 'object') {
                const keys = Object.keys(settings);
                keys.forEach(_key => {
                    if (_key in this) {
                        this[_key] = settings[_key];
                    }
                    if (_key === 'Timezone' &&  settings[_key] === 'fixed') {
                        this[_key] = 'custom';
                    }
                });
            }
        });
    }

    saveSettings() {
        this.newService.saveUserSettings({
            Timezone: this.Timezone,
            fixedTimeZoneOffset: +this.fixedTimeZoneOffset,
            fixedTimeZoneLoc: this.fixedTimeZoneLoc,
            unit_distance: this.unit_distance,
            unit_speed: this.unit_speed,
            unit_weight: this.unit_weight,
        });
    }
}

type TimezoneOptions = number | 'vessel' | 'utc' | 'own' | 'custom' | 'timezone';
type speedOptions = 'km/h' | 'mph' | 'knots' | 'm/s';
type distanceOptions = 'km' | 'mile' | 'NM';
type weightOptions = 'ton' | 'kg';



