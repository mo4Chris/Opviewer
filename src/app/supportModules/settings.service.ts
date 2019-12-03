import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    Timezone: TimezoneOptions = 'vessel';
    unit_distance: distanceOptions = 'NM';
    unit_speed: speedOptions = 'knots';
    unit_weight: weightOptions = 'ton';

    options = {
        time: ['vessel', 'own', 'utc'],
        weight: ['ton', 'kg'],
        speed: ['km/h', 'mph', 'knots', 'm/s'],
        distance: ['km', 'mile', 'NM'],
    };
}

type TimezoneOptions = number | 'vessel' | 'utc' | 'own';
type speedOptions =  'km/h' | 'mph' | 'knots' | 'm/s';
type distanceOptions = 'km' | 'mile' | 'NM';
type weightOptions = 'ton' | 'kg';



