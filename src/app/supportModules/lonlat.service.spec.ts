import { TestBed } from '@angular/core/testing';

import { LonlatService } from './lonlat.service';

describe('LonlatService', () => {
  let service: LonlatService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LonlatService);
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

  it('should correctly estimate distances', () => {
    const from = {lng: 21.0122287, lat: 52.2296756};
    const to = {lng: 16.9251681, lat: 52.406374};
    const d = service.latlngdist(from, to);
    const expectedDist = 278.458;
    expect(d).toBeCloseTo(expectedDist, 3);
  });
});


