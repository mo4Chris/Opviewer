import { TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

import { GpsService } from './gps.service';
import { MockedCommonServiceProvider } from './mocked.common.service';

describe('GpsService', () => {
  let service: GpsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    });
    service = TestBed.get(GpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert to DMS', () => {
    expect(service.latToDms(0)).toEqual("0° 0′ 0″ N")
    expect(service.latToDms(null)).toEqual("N/a")
    expect(service.latToDms(undefined)).toEqual("N/a")

    expect(service.lonToDms(0)).toEqual("0° 0′ 0″ E")
    expect(service.lonToDms(null)).toEqual("N/a")
    expect(service.lonToDms(undefined)).toEqual("N/a")

    const amsterdam = {
      lat: 52.377956,
      lng: 4.897070,
    }
    expect(service.latToDms(amsterdam.lat)).toEqual("52° 22′ 41″ N")
    expect(service.lonToDms(amsterdam.lng)).toEqual("4° 53′ 49″ E")
  })
});
