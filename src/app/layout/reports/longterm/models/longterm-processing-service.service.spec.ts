import { TestBed, async } from '@angular/core/testing';

import { LongtermProcessingService } from './longterm-processing-service.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('LongtermProcessingService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ], imports: []
    });
  }));

  it('should be created', () => {
    const service: LongtermProcessingService = TestBed.inject(LongtermProcessingService);
    expect(service).toBeTruthy();
  });
});
