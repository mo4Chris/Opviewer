import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MapStore } from './map.store';

describe('Map store', () => {
  let store: MapStore

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ],
    });
    store = TestBed.inject(MapStore)
  });

  it('should be created', async () => {
    expect(store).toBeTruthy();
    const out = await store.onAllData()
    expect(out.length).toEqual(3);
  });

  it('should store parks', async () => {
    expect(store.parks).toBeTruthy();
    const out = await store.parks;
    expect(out[0]).toEqual({
      name: 'Test park',
      filename: 'Test_park_ugly',
      turbines: [
        {name: 'a', lon: 0.5, lat: 0.5},
        {name: 'b', lon: 0.6, lat: 0.6},
      ],
      centroid: {
        lon: 50,
        lat: 1
      },
      outline: {
        lon: [0, 1, 1, 0],
        lat: [0, 0, 1, 1]
      }
    });
  });

  it('should store harbours', async () => {
    expect(store.harbours).toBeTruthy();
    const out = await store.harbours;
    expect(out[0]).toEqual({
      name: 'Test harbour',
      centroid: {
        lon: 50,
        lat: 1,
        radius: 1,
      },
      outline: {
        lon: [50],
        lat: [1]
      }
    });
  });

  it('should store platforms', async () => {
    expect(store.platforms).toBeTruthy();
    const out = await store.platforms;
    expect(out[0]).toEqual({
      name: 'PE-F15-PA',
      lat: 0,
      lon: 0,
    });
  });
});
