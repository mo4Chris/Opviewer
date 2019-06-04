import { TestBed } from '@angular/core/testing';

import { LonlatService } from './lonlat.service';

describe('LonlatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LonlatService = TestBed.get(LonlatService);
    expect(service).toBeTruthy();
  });
});