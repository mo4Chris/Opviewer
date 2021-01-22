import { TestBed } from '@angular/core/testing';

import { ForecastReponseService } from './forecast-response.service';
import { Dof6Array } from './forecast-response.model';

describe('ForecastReponseService', () => {
  let service: ForecastReponseService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.get(ForecastReponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute limits', () => {
    const resp: Dof6Array = [[[0, 1, 2, 4, 5, 6]]];
    expect(service.computeLimit(resp, 'surge', 3)).toEqual([[0]]);
    expect(service.computeLimit(resp, 'sway', 6)).toEqual([[1/6]]);
    expect(service.computeLimit(resp, 'heave', 6)).toEqual([[1/3]]);
    expect(service.computeLimit(resp, 'roll', 6)).toEqual([[2/3]]);
    expect(service.computeLimit(resp, 'pitch', 6)).toEqual([[5/6]]);
    expect(service.computeLimit(resp, 'yaw', 6)).toEqual([[1]]);
  })

  it('should combine Workabilities', ()=> {
    expect(service.combineWorkabilities([])).toEqual([[]])
    expect(service.combineWorkabilities([[]])).toEqual([[]])
    expect(service.combineWorkabilities([[[]]])).toEqual([[]])
    expect(service.combineWorkabilities([[[1, 3, 1]], [[2, 2, 2]], [[1, 0, 5]]])).toEqual([[2, 3, 5]])
  })
});
