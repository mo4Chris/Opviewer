import { TestBed } from '@angular/core/testing';

import { DatetimeService } from './datetime.service';
import * as moment from 'moment';
import { MockedSettingsService } from './mocked.settings.service';
import { MockedCommonServiceProvider } from './mocked.common.service';

describe('DatetimeService', () => {
  let service: DatetimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
      ],
    });
    service = TestBed.get(DatetimeService);
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
    expect(a + 1).toEqual(b)
  })
});
