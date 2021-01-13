import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { CalculationService } from './calculation.service';
import { MockedCommonServiceProvider } from './mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('Settings service', () => {
  let service: SettingsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    });
    service = TestBed.get(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should allow conversion between each option', () => {
    const calcService = new CalculationService();
    const errorSpy = spyOn(console, 'error').and.callThrough();
    ['weight', 'speed', 'distance'].forEach(_key => {
      const ref = service.options[_key][0];
      service.options[_key].forEach(opt => {
        expect(calcService.switchUnits([0, 1, 2], opt, ref)).toBeTruthy();
      });
    });
    expect(errorSpy).toHaveBeenCalledTimes(0);
  });

  it('Should return correct time offsets', () => {
    service.Timezone = 'utc'
    expect(service.getTimeOffset()).toEqual(0);
    // DST = 29 MAR - 25 OCT
    // 737000 = 1 Nov 2017
    // 737250 = 9 Jul 2018
    service.Timezone = 'custom'; // Doesnt care about DST
    service.fixedTimeZoneOffset = 3;
    expect(service.getTimeOffset()).toEqual(3);
    service.fixedTimeZoneOffset = -3;
    expect(service.getTimeOffset()).toEqual(-3);
    service.Timezone = 'vessel'
    expect(service.getTimeOffset(0)).toEqual(0);
    expect(service.getTimeOffset(null)).toEqual(0);
    expect(service.getTimeOffset(3)).toEqual(3);
    // Cant really test the timezones here
    // settings.Timezone = 'own'
    // expect(service.MatlabDateToCustomJSTime(737000, 'HH:mm')).toEqual('01:00');
    service.Timezone = 'timezone'
    service.fixedTimeZoneLoc = 'Europe/London' // UTC
    expect(service.getTimeOffset(0, '2017-11-01')).toEqual(-0); // Dont even ask
    expect(service.getTimeOffset(0, '2018-07-09')).toEqual(1);
    service.fixedTimeZoneLoc = 'Europe/Amsterdam' // UTC + 1
    expect(service.getTimeOffset(0, '2017-11-01')).toEqual(1);
    expect(service.getTimeOffset(0, '2018-07-09')).toEqual(2);
  })
});
