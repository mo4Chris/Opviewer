import { TestBed } from '@angular/core/testing';

import { OsmGenerateIconsService } from './osm-generate-icons.service';

describe('OsmGenerateIconsService', () => {
  let service: OsmGenerateIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsmGenerateIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
