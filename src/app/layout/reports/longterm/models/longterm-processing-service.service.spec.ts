import { TestBed, async } from '@angular/core/testing';

import { LongtermProcessingService } from './longterm-processing-service.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { HttpClientModule } from '@angular/common/http';

describe('LongtermProcessingService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ], imports: [
        HttpClientModule
      ]
    });
  }));

  it('should be created', () => {
    const service: LongtermProcessingService = TestBed.get(LongtermProcessingService);
    expect(service).toBeTruthy();
  });
});
