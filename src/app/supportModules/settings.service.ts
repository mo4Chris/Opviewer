import { Injectable, NgModule } from '@angular/core';
import { isNumber } from 'util';
import * as moment from 'moment';
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
        time: ['vessel', 'own', 'utc'],
        weight: ['ton', 'kg'],
        speed: ['km/h', 'mph', 'knots', 'm/s'],
        distance: ['km', 'mile', 'NM'],
    };
    localTimeZoneOffset: number = moment().utcOffset() / 60; // Offset in hours

    // ##################### Functions ###########################
    getTimeOffset(vesselOffset: number = 0): number {
        // Returns the time offset in hours according to the chosen timezone settings
        // If a local offset is selected, the vesselOffset is used.
        const timezone = this.Timezone;
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

    private loadSettings() {
        // loads the settings from the database
        this.newService.loadUserSettings().subscribe(settings => {
            if (typeof settings === 'object') {
                const keys = Object.keys(settings);
                keys.forEach(_key => {
                    if (this[_key]) {
                        this[_key] = settings[_key];
                    }
                });
            }
        });
    }

    saveSettings() {
        this.newService.saveUserSettings({
            Timezone: this.Timezone,
            unit_distance: this.unit_distance,
            unit_speed: this.unit_speed,
            unit_weight: this.unit_weight,
        });
    }
}

type TimezoneOptions = number | 'vessel' | 'utc' | 'own';
type speedOptions = 'km/h' | 'mph' | 'knots' | 'm/s';
type distanceOptions = 'km' | 'mile' | 'NM';
type weightOptions = 'ton' | 'kg';



