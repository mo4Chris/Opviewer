import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('Settings service', () => {
  let service: SettingsService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
