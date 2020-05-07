import { TestBed } from '@angular/core/testing';

import { DatetimeService } from './datetime.service';
import * as moment from 'moment-timezone';
import { MockedSettingsService } from './mocked.settings.service';
import { MockedCommonServiceProvider } from './mocked.common.service';
import { SettingsService } from './settings.service';

describe('DatetimeService', () => {
  let service: DatetimeService;
  let settings: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
      ],
    });
    service = TestBed.get(DatetimeService);
    settings = TestBed.get(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should correctly handle vessel offset', () => {
    const m = moment.utc({year: 2000, month: 1, day: 1, hour: 1, minute: 0, second: 0});
    service.vesselOffsetHours = 0;
    service.applyTimeOffsetToMoment(m);
    const a = m.hour();
    service.vesselOffsetHours = 1;
    service.applyTimeOffsetToMoment(m);
    const b = m.hour();
    expect(a + 1).toEqual(b);
  });

  fit('Should correctly handle timezones and offsets', () => {
    expect(settings).toBeTruthy();
    settings.Timezone = 'utc';
    // DST = 29 MAR - 25 OCT
    // 737000 = 1 Nov 2017
    // 737250 = 9 Jul 2018
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('00:00');
    settings.Timezone = 'custom'; // Doesnt care about DST
    settings.fixedTimeZoneOffset = 3;
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('03:00');
    settings.fixedTimeZoneOffset = -3;
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('21:00');
    settings.Timezone = 'vessel'
    service.vesselOffsetHours = 2; // Should include DST
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('02:00');
    // Cant really test the timezones here
    // settings.Timezone = 'own'
    // expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('01:00');
    settings.Timezone = 'timezone'
    settings.fixedTimeZoneLoc = 'Europe/London' // UTC
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('00:00'); // WITHOUT DST
    expect(service.MatlabDateToCustomJSTime(737250, 'HH:mm')).toEqual('01:00'); // WITH DST
    settings.fixedTimeZoneLoc = 'Europe/Amsterdam' // UTC + 1
    expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('01:00'); // WITHOUT DST
    expect(service.MatlabDateToCustomJSTime(737250, 'HH:mm')).toEqual('02:00'); // WITH DST
  })
});
