import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';

import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AdminComponent } from './components/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/vessel-master/vessel-master.component';
import { MockComponents } from 'ng-mocks';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpModule,
        AgmCoreModule.forRoot(),
        AgmJsMarkerClustererModule,
        AgmSnazzyInfoWindowModule,
        NgbModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        DashboardComponent,
        MockComponents(AdminComponent, LogisticsSpecialistComponent, MarineControllerComponent, VesselMasterComponent),
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
