import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { LongtermVesselObjectModel } from '../../../longterm.component';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { DeploymentGraphComponent } from './deploymentGraph.component';

describe('DeploymentGraphComponent', () => {
  let component: DeploymentGraphComponent;
  let fixture: ComponentFixture<DeploymentGraphComponent>;
  const mockedCommonService = new MockedCommonService();
  const defaultVessel = mockedCommonService.getVesselDefault();
  const userBoats = [{
    mmsi: 987654321,
    nicename: 'Fake SOV',
    rawName: 'Fake_SOV',
  }];
  let dataSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentGraphComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataSpy = spyOn(DeploymentGraphComponent.prototype, 'getChartData').and.callFake((cb) => cb([[0, 1, 2, 4]]));
    fixture = TestBed.createComponent(DeploymentGraphComponent);
    component = fixture.componentInstance;
    component.vesselObject = <LongtermVesselObjectModel> {
      mmsi: [userBoats[0].mmsi],
      dateMin: 737791, // 1 jan 2020
      dateMax: 737851, // 1 mar 2020
      dateNormalMin: 'Test date 1',
      dateNormalMax: 'Test date 2',
      vesselName: [userBoats[0].rawName]
    };
    component.vesselLabels = [userBoats[0].nicename];

    const N = 12 * 24 * (component.vesselObject.dateMax - component.vesselObject.dateMin + 1);
    component.wavedata = {
      timeStamp: linspace(component.vesselObject.dateMin, component.vesselObject.dateMax, N),
      'Hs': linspace(1, 2, N),
      'Tp': linspace(1, 2, N),
      'waveDir': linspace(1, 2, N),
      'wind': linspace(1, 2, N),
      'windDir': linspace(1, 2, N),
    };
    component.tokenInfo = UserTestService.getMockedAccessToken({userBoats: userBoats});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(dataSpy).toHaveBeenCalled();
  });
});


function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}
