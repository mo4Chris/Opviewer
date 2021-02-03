import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { AgmCoreModule, AgmMap } from '@agm/core';
import { ForecastVesselComponent } from './forecast-project.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VesselLocationIndicatorComponent } from '../models/vessel-location-indicator/vessel-location-indicator.component'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { mockedObservable } from '@app/models/testObservable';
import { AlertService } from '@app/supportModules/alert.service';
import { testBrokenHelpButtons, testEmptyTooltips } from '../forecast-new-vessel/forecast-new-vessel.component.spec';

fdescribe('ForecastProjectComponent', () => {
  let component: ForecastVesselComponent;
  let fixture: ComponentFixture<ForecastVesselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForecastVesselComponent,
        MockComponents(
          AgmMap,    
          VesselLocationIndicatorComponent
        )
      ],
      imports: [
        FormsModule,
        CommonModule,
        NgbModule,
        RouterTestingModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastVesselComponent);
    component = fixture.componentInstance;
    spyOn(component, 'initParameter').and.returnValue(
      mockedObservable(
        () => {
          component.project_id = 1;
        }
      )
    )
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    let agmMap = locate('agm-map')
    expect(agmMap).toBeTruthy();
  });

  it('should emit alerts on bad POI input', async () => {
    let alertSpy = spyOn(AlertService.prototype, 'sendAlert').and.callThrough();
    await fixture.whenStable();
    expect(alertSpy).not.toHaveBeenCalled();
    component.POI = {
      X: 5,
      Y: 1,
      Z: 1,
    };
    component.verifyPointOfInterest();
    expect(alertSpy).not.toHaveBeenCalled();
    component.POI = {
      X: -10,
      Y: 1,
      Z: 1,
    };
    component.verifyPointOfInterest();
    expect(alertSpy).toHaveBeenCalledTimes(1);
  })

  it('should not have any broken help buttons', testBrokenHelpButtons(() => fixture))

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture))

  function locate(locator: string) {
    return fixture.nativeElement.querySelector(locator);
  }
});
