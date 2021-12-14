import {ForecastMotionLimit, ForecastLimitInputs, WaveType, WindType} from './forecast-limit'
import { Dof6, DofType } from './forecast-response.model'

describe('Forecast-limit class', () => {
  it('should instantiate', () => {
    assertValidInstantiation({
      Type: 'Acc',
      Dof: 'Heave',
      Value: 1
    })
    assertValidInstantiation({
      Type: 'Vel',
      Dof: 'Heave',
      Value: 1
    })
    assertValidInstantiation({
      Type: 'Disp',
      Dof: 'Heave',
      Value: 1
    })
    assertValidInstantiation({
      Type: 'Slip',
      Dof: null,
      Value: 1
    })
    assertValidInstantiation({
      Type: 'Wave',
      Dof: 'Hs',
      Value: 1
    })
    assertValidInstantiation({
      Type: 'Wind',
      Dof: 'Speed',
      Value: 1
    })
  })

  it('should instantiate from stored motion statistics', () => {
    const Types: DofType[] = ['Acc', 'Vel', 'Disp'];
    const Dofs: Dof6[] = ['Surge', 'Sway', 'Heave', 'Roll', 'Pitch', 'Yaw'];
    Types.forEach(_type => {
      Dofs.forEach(_dof => {
        const instance = assertValidInstantiation({Type: _type, Dof: _dof, Value: 1});
        const obj = instance.toObject();
        const newObj = assertValidInstantiation(obj);
        expect(newObj.Value).toEqual(instance.Value)
      })
    })
  })

  it('should instantiate from stored slip statistics', () => {
    const Types = ['Slip'];
    const Dofs = [null];
    Types.forEach(_type => {
      Dofs.forEach(_dof => {
        const instance = assertValidInstantiation({Type: <any> _type, Dof: _dof, Value: 1});
        const obj = instance.toObject();
        const newObj = assertValidInstantiation(obj);
        expect(newObj.Value).toEqual(instance.Value)
      })
    })
  })

  it('should instantiate from stored wave statistics', () => {
    const Types = ['Wave'];
    const Dofs: WaveType[] = ['Hs', 'Hmax', 'Tp', 'Tz'];
    Types.forEach(_type => {
      Dofs.forEach(_dof => {
        const instance = assertValidInstantiation({Type: <any> _type, Dof: _dof, Value: 1});
        const obj = instance.toObject();
        const newObj = assertValidInstantiation(obj);
        expect(newObj.Value).toEqual(instance.Value)
      })
    })
  })

  it('should instantiate from stored wave statistics', () => {
    const Types = ['Wind'];
    const Dofs: WindType[] = ['Speed', 'Gust'];
    Types.forEach(_type => {
      Dofs.forEach(_dof => {
        const instance = assertValidInstantiation({Type: <any> _type, Dof: _dof, Value: 1});
        const obj = instance.toObject();
        const newObj = assertValidInstantiation(obj);
        expect(newObj.Value).toEqual(instance.Value)
      })
    })
  })

  it('should correctly cast to object', () => {
    const input: ForecastLimitInputs = {
      Type: 'Acc',
      Dof: 'Roll',
      Value: 2.5,
    };
    const limit = new ForecastMotionLimit(input);
    expect(limit.toObject()).toEqual({
      Type: 'Acc',
      Dof: 'Roll',
      Value: 2.5,
      Unit: 'deg\/s2'
    })
  })

  it('should not instantiate in invalid config', () => {
    expect( function(){
      const limit = new ForecastMotionLimit(INVALID_LIMIT_CONFIG);
    }).toThrow(new Error("Invalid limit config"));
  })

  it('should not show valid in invalid config', () => {
    const limit = new ForecastMotionLimit(VALID_LIMIT_CONFIG);
    limit.Dof = 'Hs';
    expect(limit.isValid).toBe(false);
  })
})

function assertValidInstantiation(inputs: ForecastLimitInputs) {
  const instance = new ForecastMotionLimit(inputs);
  expect(instance).toBeTruthy();
  expect(instance.isValid).toBe(true);
  expect(instance.Unit).toBeTruthy();
  expect(instance.toObject()).toBeTruthy();
  return instance;
}

const INVALID_LIMIT_CONFIG: ForecastLimitInputs = {
  Type: 'Acc',
  Dof: 'Hs',
  Value: 0.5
}
const VALID_LIMIT_CONFIG: ForecastLimitInputs = {
  Type: 'Acc',
  Dof: 'Heave',
  Value: 20.345
}
