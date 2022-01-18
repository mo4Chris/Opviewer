import { TestBed } from '@angular/core/testing';

import { OsmAssignDataService } from './osm-assign-data.service';

describe('OsmAssignDataService', () => {
  let service: OsmAssignDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsmAssignDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
