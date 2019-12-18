import { TestBed } from '@angular/core/testing';

import { DatetimeService } from './datetime.service';
import { MockedCommonServiceProvider } from './mocked.common.service';

describe('DatetimeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [MockedCommonServiceProvider]
  }));

  it('should be created', () => {
    const service: DatetimeService = TestBed.get(DatetimeService);
    expect(service).toBeTruthy();
  });
});
