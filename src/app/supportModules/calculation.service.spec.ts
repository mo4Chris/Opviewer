import { TestBed } from '@angular/core/testing';

import { CalculationService } from './calculation.service';

describe('CalculationService', () => {
  let service: CalculationService;
  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.get(CalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get correct nan filters', () => {
    expect(service.getNanMax([-2, NaN, 1, 0])).toEqual(1, 'NanMax');
    expect(service.getNanMax([NaN])).toEqual(NaN, 'nanMax');
    expect(service.getNanMin([3, NaN, 1])).toEqual(1, 'nanMin');
    expect(service.getNanMean([3, NaN, 1])).toEqual(2, 'nanMean');
    expect(service.getNanStd([2, NaN, 4])).toEqual(1, 'nanStd');
  })
  it('should create correct linspaces', () => {
    expect(service.linspace(1, 5)).toEqual([1,2,3,4,5]);
    expect(service.linspace(1, 5, 1)).toEqual([1,2,3,4,5]);
    expect(service.linspace(1, 4, 2)).toEqual([1,3]);
    expect(service.linspace(1, 5, 2)).toEqual([1,3,5]);
  })
  it('should count correct uniques', () => {
    expect(service.countUniques([5, 1, 5])).toEqual({1: 1, 5: 2});
  })
  it('should perform correct 1d interpolation', () => {
    expect(service.interp1([1,3,4], [3,4,5], [2, 4, 5])).toEqual([3.5, 5, NaN])
  })
  // ToDo interp2 test if we ever use it

  describe('should correctly convert', () => {
    it('volumes', () => {
      expect(service.switchVolumeUnits(10, 'm3', 'liter')).toEqual(10000);
      expect(service.switchVolumeUnits(100, 'liter', 'm3')).toEqual(0.1);
      expect(service.switchUnits(100, 'liter', 'm3')).toEqual(0.1);
    });
    it('speeds', () => {
      expect(service.switchSpeedUnits(10, 'm/s', 'kmh')).toEqual(36);
      expect(service.switchSpeedUnits(10, 'm/s', 'mph')).toBeCloseTo(22.37, 2);
      expect(service.switchUnits(10, 'm/s', 'mph')).toBeCloseTo(22.37, 2);
    });
    it('angles', () => {
      expect(service.switchDirectionUnits(10, 'deg', 'rad')).toBeCloseTo(0.1745, 1);
      expect(service.switchUnits(10, 'deg', 'rad')).toBeCloseTo(0.1745, 1);
    });
    it('durations', () => {
      expect(service.switchDurationUnits(600, 'mns', 'hour')).toEqual(10);
      expect(service.switchDurationUnits(600, 'mns', 'hour')).toEqual(10);
      expect(service.switchUnits(2, 'day', 'sec')).toEqual(2*24*60*60);
    });
    it('weights', () => {
      expect(service.switchWeightUnits(10, 'kg', 'gram')).toEqual(10000);
      expect(service.switchUnits(10, 'kg', 'gram')).toEqual(10000);
    });
  });

});

