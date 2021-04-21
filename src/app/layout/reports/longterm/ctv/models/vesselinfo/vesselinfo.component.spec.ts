import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VesselinfoComponent } from './vesselinfo.component';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('VesselinfoComponent', () => {
  let component: VesselinfoComponent;
  let fixture: ComponentFixture<VesselinfoComponent>;
  const mockedCommonService = new MockedCommonService();
  const defaultVessel = mockedCommonService.getVesselDefault();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ VesselinfoComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
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

  it('should update', async () => {
    component.mmsi = defaultVessel.map(vessel => vessel.mmsi);
    component.vesselStore = defaultVessel;
    component.update(); // Async operation -> need timeout before test

    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.vessels.length).toEqual(defaultVessel.length);
  });
});
