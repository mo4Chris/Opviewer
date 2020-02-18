import { TestBed } from '@angular/core/testing';

import { LonlatService } from './lonlat.service';

describe('LonlatService', () => {
  let service: LonlatService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(LonlatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lonlatarrayToLatLngArray should work', () => {
    const arr1 = {lon: [1, 2, 3], lat: [1, 2, 3]};
    const arr2 = {lon: [[1], [2], [3]], lat: [[1], [2], [3]]};
    const out = [{lat: 1, lng: 1}, {lat: 2, lng: 2}, {lat: 3, lng: 3}];

    expect(service.lonlatarrayToLatLngArray(arr1)).toEqual(out);
    expect(service.lonlatarrayToLatLngArray(arr2)).toEqual(out);
  });
});


