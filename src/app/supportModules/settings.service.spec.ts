import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { CalculationService } from './calculation.service';

describe('Settings service', () => {
  let service: SettingsService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
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
});
