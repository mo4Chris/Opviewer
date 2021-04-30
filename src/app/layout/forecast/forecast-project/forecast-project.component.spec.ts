import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { AgmMap } from '@agm/core';
import { ForecastVesselComponent } from './forecast-project.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VesselLocationIndicatorComponent } from '../models/vessel-location-indicator/vessel-location-indicator.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { mockedObservable } from '@app/models/testObservable';
import { testBrokenHelpButtons, testEmptyTooltips } from '../forecast-new-vessel/forecast-new-vessel.component.spec';
import { AlertService } from '@app/supportModules/alert.service';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from '@app/supportModules/router.service';

describe('ForecastProjectComponent', () => {
  let component: ForecastVesselComponent;
  let fixture: ComponentFixture<ForecastVesselComponent>;

  beforeEach(waitForAsync(() => {
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
        RouterTestingModule
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
        {
          provide: ActivatedRoute,
          useValue: {
            params: mockedObservable({
              project_name: 'new'
            }),
          },
      }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastVesselComponent);
    component = fixture.componentInstance;
  });

  it('should init new - permission denied', () => {
    const routingSpy = spyOn(RouterService.prototype, 'route');
    const alertSpy = spyOn(AlertService.prototype, 'sendAlert');
    const loadSpy = spyOn(component, 'loadData');
    component.permission.forecastCreateProject = false;
    fixture.detectChanges();
    expect(routingSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
  })

  it('should init new - permission granted', () => {
    const routingSpy = spyOn(RouterService.prototype, 'route');
    const alertSpy = spyOn(AlertService.prototype, 'sendAlert');
    const loadSpy = spyOn(component, 'loadData');
    component.permission.forecastCreateProject = true;
    fixture.detectChanges();
    expect(routingSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
  })
});

describe('ForecastProjectComponent', () => {
  let component: ForecastVesselComponent;
  let fixture: ComponentFixture<ForecastVesselComponent>;
  let routingSpy: jasmine.Spy

  beforeEach(waitForAsync(() => {
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
        RouterTestingModule
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
        {
          provide: ActivatedRoute,
          useValue: {
            params: mockedObservable({
              project_name: 'test_project'
            }),
          },
      }]
    })
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(ForecastVesselComponent);
    component = fixture.componentInstance;
    routingSpy = spyOn(RouterService.prototype, 'route');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', async () => {
    await fixture.whenStable()
    expect(component).toBeTruthy();
    let agmMap = locate('agm-map');
    // expect(agmMap).toBeTruthy('Project should have loaded');
    expect(agmMap).toBeTruthy('Map should be present');
    expect(routingSpy).not.toHaveBeenCalled();
  });

  xit('should not have any broken help buttons', testBrokenHelpButtons(() => fixture));

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture));

  it('should correctly save changes', async () => {
    const saveSpy = spyOn(MockedCommonService.prototype, 'saveForecastProjectSettings')
      .and.returnValue(mockedObservable({data: 'Great succes'}));
    const alertSpy = spyOn(AlertService.prototype, 'sendAlert');
    const saveBtn = locate('button') as HTMLButtonElement;
    expect(saveBtn).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    saveBtn.click();
    await fixture.whenStable();
    expect(saveSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  })

  function locate(locator: string) {
    const nativeElt = <HTMLElement> fixture.nativeElement;
    return nativeElt.querySelector(locator);
  }
});
