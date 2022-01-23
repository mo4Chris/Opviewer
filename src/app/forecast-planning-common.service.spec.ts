import { TestBed } from '@angular/core/testing';

import { ForecastPlanningCommonService } from './forecast-planning-common.service';

describe('ForecastPlanningCommonService', () => {
  let service: ForecastPlanningCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecastPlanningCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
