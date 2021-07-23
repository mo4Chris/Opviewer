import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AgmInfoWindow, AgmMap } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmMarkerCluster } from '@agm/js-marker-clusterer';
import { AdminComponent } from './components/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/vessel-master/vessel-master.component';
import { MockComponents } from 'ng-mocks';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterService } from '@app/supportModules/router.service';
import { mockedObservable } from '@app/models/testObservable';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [
        DashboardComponent,
        MockComponents(
          AdminComponent,
          LogisticsSpecialistComponent,
          MarineControllerComponent,
          VesselMasterComponent,
          AgmMap,
          AgmMarkerCluster,
          AgmInfoWindow,
        ),
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
        RouterService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set zoomInfo', () => {
    fixture.detectChanges();
    const info = {
      longitude: 1,
      latitude: 2,
      zoomlvl: 3,
    }
    component.setZoominfo(info);
    expect(component.zoominfo).toEqual(info);
  })

  it('should log user out if it is not active', () => {
    const logoutspy = spyOn(UserTestService.prototype, 'logout');
    spyOn(MockedCommonService.prototype, 'checkUserActive').and.returnValue(mockedObservable(false));
    fixture.detectChanges();
    expect(logoutspy).toHaveBeenCalled();
  })

  it('should not log user out if it is active', () => {
    const logoutspy = spyOn(UserTestService.prototype, 'logout');
    spyOn(MockedCommonService.prototype, 'checkUserActive').and.returnValue(mockedObservable(true));
    fixture.detectChanges();
    expect(logoutspy).not.toHaveBeenCalled();
  })
});
