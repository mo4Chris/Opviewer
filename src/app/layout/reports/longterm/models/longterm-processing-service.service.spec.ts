import { TestBed } from '@angular/core/testing';

import { LongtermProcessingServiceService } from './longterm-processing-service.service';

describe('LongtermProcessingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LongtermProcessingServiceService = TestBed.get(LongtermProcessingServiceService);
    expect(service).toBeTruthy();
  });
});
