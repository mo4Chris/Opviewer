import {ForecastMotionLimit, ForecastLimitInputs, WaveType, WindType} from './forecast-limit'
import { Dof6, DofType } from './forecast-response.model'

fdescribe('Forecast-limit class', () => {

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
})

function assertValidInstantiation(inputs: ForecastLimitInputs) {
  const instance = new ForecastMotionLimit(inputs);
  expect(instance).toBeTruthy();
  expect(instance.Unit).toBeTruthy();
  expect(instance.toObject()).toBeTruthy();
  return instance;
}
