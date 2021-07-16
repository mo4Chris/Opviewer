import { TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { GmapService } from './gmap.service';
import { MockedCommonServiceProvider } from './mocked.common.service';

fdescribe('GmapService', () => {
  let service: GmapService
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    });
    service = TestBed.inject(GmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
