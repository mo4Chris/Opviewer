import { TestBed, inject } from '@angular/core/testing';

import { CommonService } from './common.service';
import { HttpClientModule } from '@angular/common/http';

describe('CommonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CommonService]
    });
  });

  it('should be created', inject([CommonService], (service: CommonService) => {
    expect(service).toBeTruthy();
  }));
});
