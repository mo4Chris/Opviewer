import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselinfoComponent } from './vesselinfo.component';
import { MockedCommonService } from '../../../../../supportModules/mocked.common.service';
import { LongtermVesselObjectModel } from '../../../longterm.component';

describe('VesselinfoComponent', () => {
  let component: VesselinfoComponent;
  let fixture: ComponentFixture<VesselinfoComponent>;
  const mockedCommonService = new MockedCommonService();
  const defaultVessel = mockedCommonService.getVesselDefault();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update', async(() => {
    component.vesselObject = <LongtermVesselObjectModel> {
      dateMin: 0,
      dateMax: 1,
      dateNormalMin: '0',
      dateNormalMax: '1',
      mmsi: defaultVessel.map(vessel => vessel.mmsi),
    };
    component.newService = mockedCommonService;
    component.update(); // Async operation -> need timeout before test
    setTimeout(() => {
      expect(component).toBeTruthy();
      expect(component.vessels.length).toEqual(defaultVessel.length);
    });
  }));
});
