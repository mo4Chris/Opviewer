import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { LongtermVesselObjectModel } from '../../../longterm.component';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { UtilizationGraphComponent } from './utilizationGraph.component';
import { HttpClientModule } from '@angular/common/http';

describe('Sov Utilization Graph', () => {
  let component: UtilizationGraphComponent;
  let fixture: ComponentFixture<UtilizationGraphComponent>;
  const mockedCommonService = new MockedCommonService();
  const defaultVessel = mockedCommonService.getVesselDefault();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilizationGraphComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
      imports: [
        HttpClientModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilizationGraphComponent);
    component = fixture.componentInstance;
    component.vesselObject = {
        dateMax: 737740,
        dateMin: 737700,
        dateNormalMin: 'Min date',
        dateNormalMax: 'Max date',
        mmsi: [987654321],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ToDo: create proper test here
});
