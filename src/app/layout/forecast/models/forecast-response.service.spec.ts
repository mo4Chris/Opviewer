import { TestBed } from '@angular/core/testing';

import { ForecastResponseService } from './forecast-response.service';
import { Dof6Array } from './forecast-response.model';
import { ForecastMotionLimit } from './forecast-limit';

describe('ForecastResponseService', () => {
  let service: ForecastResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecastResponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute limits', () => {
    const resp: Dof6Array = [[[0, 1, 2, 4, 5, 6]]];
    expect(service.computeLimit(resp, 'Surge', 3)).toEqual([[0]]);
    expect(service.computeLimit(resp, 'Sway', 6)).toEqual([[1 / 6]]);
    expect(service.computeLimit(resp, 'Heave', 6)).toEqual([[1 / 3]]);
    expect(service.computeLimit(resp, 'Roll', 6)).toEqual([[2 / 3]]);
    expect(service.computeLimit(resp, 'Pitch', 6)).toEqual([[5 / 6]]);
    expect(service.computeLimit(resp, 'Yaw', 6)).toEqual([[1]]);
  });

  it('should combine Workabilities', () => {
    expect(service.combineWorkabilities([])).toEqual([[]]);
    expect(service.combineWorkabilities([[]])).toEqual([[]]);
    expect(service.combineWorkabilities([[[]]])).toEqual([[]]);
    expect(service.combineWorkabilities([[[1, 3, 1]], [[2, 2, 2]], [[1, 0, 5]]])).toEqual([[2, 3, 5]]);
  });

  it('should set limits from ops preference', () => {
    let ops = null;
    const default_out = [new ForecastMotionLimit({Dof: 'Heave', Type: 'Disp', Value: 1.5, Unit: 'm'})];
    expect(service.setLimitsFromOpsPreference(ops)).toEqual(default_out)
    ops = getOps();
    expect(service.setLimitsFromOpsPreference(ops)).toEqual(default_out)
    ops = getOps({client_preferences: null});
    expect(service.setLimitsFromOpsPreference(ops)).toEqual(default_out)
    ops = getOps(getDof({Dof: 'Roll', Type: 'Disp', Value: 1}));
    expect(service.setLimitsFromOpsPreference(ops)).not.toEqual(default_out)
    ops = getOps(getDof({Dof: 'Roll', Type: 'Disp', Value: 1, Unit: 'deg'}));
    expect(service.setLimitsFromOpsPreference(ops)).not.toEqual(default_out)
  })
});

function getOps(opts = {}) {
  const base = {
    id: 1,
    name: "string",
    nicename: "string",
    client_id: 1,
    latitude: 1,
    longitude: 1,
    water_depth: 1,
    maximum_duration: 1,
    vessel_id: 1,
    activation_start_date: "string",
    activation_end_date: "string",
    client_preferences: null,
    analysis_types: ["Default"],
    metocean_provider: null,
    consumer_id: 0,
  }
  return {...base, ... opts};
}

function getDof(value) {
  return {
    client_preferences: {
      Limits: [value]
    }
  }
}
