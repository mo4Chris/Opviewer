import { TestBed } from '@angular/core/testing';
import { CalculationService } from './calculation.service';

describe('CalculationService', () => {
  let service: CalculationService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get correct nan filters', () => {
    expect(service.nanMax([-2, NaN, 1, 0])).toEqual(1, 'NanMax');
    expect(service.nanMax([NaN])).toEqual(NaN, 'nanMax');
    expect(service.nanMin([3, NaN, 1])).toEqual(1, 'nanMin');
    expect(service.nanMean([3, NaN, 1])).toEqual(2, 'nanMean');
    expect(service.nanStd([2, NaN, 4])).toEqual(1, 'nanStd');
  });
  it('should create correct linspaces', () => {
    expect(service.linspace(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(service.linspace(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(service.linspace(1, 4, 2)).toEqual([1, 3]);
    expect(service.linspace(1, 5, 2)).toEqual([1, 3, 5]);
  });
  it('should count correct uniques', () => {
    expect(service.countUniques([5, 1, 5])).toEqual({1: 1, 5: 2});
  });
  it('should perform correct 1d interpolation', () => {
    expect(service.interp1([1, 3, 4], [3, 4, 5], [2, 4, 5])).toEqual([3.5, 5, NaN]);
  });
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
      expect(service.switchUnits(2, 'day', 'sec')).toEqual(2 * 24 * 60 * 60);
    });
    it('weights', () => {
      expect(service.switchWeightUnits(10, 'kg', 'gram')).toEqual(10000);
      expect(service.switchUnits(10, 'kg', 'gram')).toEqual(10000);
    });
  });

  it('should format and round numbers', () => {
    expect(service.roundNumber(12, 10)).toEqual('12');
    expect(service.roundNumber(1.2, 10)).toEqual('1.2');
    expect(service.roundNumber(12, 10, ' appels')).toEqual('12 appels');
    expect(service.roundNumber(<any> {}, 10)).toEqual('N/a');
    expect(service.roundNumber(<any> [], 10)).toEqual('N/a');
    expect(service.roundNumber(NaN, 10, 'berries')).toEqual('N/a');
    expect(service.roundNumber(1.12, 10, 'm3')).toEqual('1.1 m\u00B3');
    expect(service.roundNumber('_NaN_', 10, 'm3')).toEqual('N/a');
    expect(service.roundNumber('10', 10)).toEqual('10');
    expect(service.roundNumber('10', 10, '%')).toEqual('10%');
  });

  it('should properly get maxima', () => {
    const m1 = service.maxInNdArray(<any> 1);
    const m2 = service.maxInNdArray([1, 4, 2]);
    const m3 = service.maxInNdArray([[1, 4, 2]]);
    const m4 = service.maxInNdArray([[{}]]);
    const m5 = service.maxInNdArray([1, NaN]);
    expect(m1).toBe(1);
    expect(m2).toBe(4);
    expect(m3).toBe(4);
    expect(m4).toBeFalsy();
    expect(m5).toBe(1);
  });

  it('should properly get minima', () => {
    const m1 = service.minInNdArray(<any> 1);
    const m2 = service.minInNdArray([1, -4, 2]);
    const m3 = service.minInNdArray([[1, -4, 2]]);
    const m4 = service.minInNdArray([[{}]]);
    const m5 = service.minInNdArray([1, NaN]);
    const m6 = service.minInNdArray([NaN, NaN]);
    expect(m1).toBe(1);
    expect(m2).toBe(-4);
    expect(m3).toBe(-4);
    expect(m4).toBeFalsy();
    expect(m5).toBe(1);
    expect(isNaN(m6)).toBe(true);
  });

  it('getDecimalValueForNumber', () => {
    expect(service.getDecimalValueForNumber('N/a', '%')).toEqual('N/a')
  })
});

