import { TestBed } from '@angular/core/testing';

import { DatetimeService } from './datetime.service';
import * as moment from 'moment-timezone';
import { MockedCommonServiceProvider } from './mocked.common.service';
import { SettingsService } from './settings.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('DatetimeService', () => {
  let service: DatetimeService;
  let settings: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
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

  it('Should correctly handle timezones and offsets', () => {
    expect(settings).toBeTruthy();
    settings.Timezone = 'utc';
    
    expect(service.MatlabDateToJSTime(null)).toBe('N/a')
    expect(service.MatlabDateToJSTime(undefined)).toBe('N/a')
    // DST = 29 MAR - 25 OCT
    // 737000 = 1 Nov 2017
    // 737250 = 9 Jul 2018
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('00:00');
    expect(service.matlabDatenumToTimeString(737000)).toEqual('00:00:00');
    settings.Timezone = 'custom'; // Doesnt care about DST
    settings.fixedTimeZoneOffset = 3;
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('03:00');
    expect(service.matlabDatenumToTimeString(737000)).toEqual('03:00:00');
    settings.fixedTimeZoneOffset = -3;
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('21:00');
    expect(service.matlabDatenumToTimeString(737000)).toEqual('21:00:00');
    settings.Timezone = 'vessel';
    service.vesselOffsetHours = 2; // Should include DST
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('02:00');
    expect(service.matlabDatenumToTimeString(737000)).toEqual('02:00:00');
    // Cant really test the timezones here
    // settings.Timezone = 'own'
    // expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('01:00');
    settings.Timezone = 'timezone';
    settings.fixedTimeZoneLoc = 'Europe/London'; // UTC
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('00:00'); // WITHOUT DST
    expect(service.matlabDatenumToTimeString(737000)).toEqual('00:00:00 GMT');
    expect(service.matlabDatenumToFormattedTimeString(737250, 'HH:mm')).toEqual('01:00'); // WITH DST
    expect(service.matlabDatenumToTimeString(737250)).toEqual('01:00:00 BST');
    settings.fixedTimeZoneLoc = 'Europe/Amsterdam'; // UTC + 1
    expect(service.matlabDatenumToFormattedTimeString(737000, 'HH:mm')).toEqual('01:00'); // WITHOUT DST
    expect(service.matlabDatenumToTimeString(737000)).toEqual('01:00:00 CET');
    expect(service.matlabDatenumToFormattedTimeString(737250, 'HH:mm')).toEqual('02:00'); // WITH DST
    expect(service.matlabDatenumToTimeString(737250)).toEqual('02:00:00 CEST');
  });

  it('should format dates', () => {
    expect(service.dateToDayTimeString(new Date(2020, 0, 1, 1, 1, 1))).toEqual('Jan 1, 01:01')
    expect(service.dateToDayTimeString(new Date(2020, 0, 1, 13, 53, 1))).toEqual('Jan 1, 13:53')
  })

  it('should correct format date as ymdString', () => {
    expect(service.dateToDateString(new Date(2020, 0, 1, 1, 1, 1))).toEqual('1 Jan 2020')
    expect(service.dateToDateString(new Date(2021, 2, 24, 13, 53, 1))).toEqual('24 Mar 2021')
  })

  it('should create moments', () => {
    let mom = service.moment(2020, 2, 3);
    let mom2 = service.moment(2020, '2', '03')
    expect(mom.toArray()).toEqual([2020,2,3,0,0,0,0])
    expect(mom2.toArray()).toEqual([2020,2,3,0,0,0,0])
  })

  it('should correctly format matlab datenums', () => {
    expect(service.matlabDatenumToYMD(737800)).toEqual({ year: 2020, month: 1, day: 10 })
  })

  it('should correctly get current matlab date', () => {
    let matDate = service.getCurrentMatlabDatenum();
    let currDate = new Date();
    expect(service.matlabDatenumToDate(matDate).toUTCString()).toEqual(currDate.toUTCString())
  })

  fit('should correctly parse iso strings', () => {
    expect(service.isoStringToMoment('2021-01-18T10:20:31.902Z').toString()).toEqual('Mon Jan 18 2021 11:20:31 GMT+0100')
  });


});
