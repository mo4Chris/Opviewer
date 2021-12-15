import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { HeadingPickerComponent } from '../models/heading-picker/heading-picker.component';
import { ForecastWorkabilityPlotComponent } from '../models/forecast-workability-plot/forecast-workability-plot.component';
import { SurfacePlotComponent } from '../models/surface-plot/surface-plot.component';
import { Mo4LightComponent } from './mo4-light.component';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterService } from '@app/supportModules/router.service';
import { mockedObservable } from '@app/models/testObservable';
import { of } from 'rxjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastResponseService } from '../models/forecast-response.service';
import { ForecastMotionLimit } from '../models/forecast-limit';
import { ForecastWeatherOverviewComponent } from './forecast-weather-overview/forecast-weather-overview.component';
import * as moment from 'moment-timezone';
import { ForecastProjectOverviewComponent } from './forecast-project-overview/forecast-project-overview.component';


describe('Mo4LightComponent', () => {
  let component: Mo4LightComponent;
  let fixture: ComponentFixture<Mo4LightComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        Mo4LightComponent,
        MockComponents(
          HeadingPickerComponent,
          SurfacePlotComponent,
          ForecastWorkabilityPlotComponent,
          ForecastWeatherOverviewComponent,
          ForecastProjectOverviewComponent,
        )
      ],
      imports: [
        CommonModule,
        NgbModule,
        SupportModelModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(Mo4LightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('before init', () => {
    it('should create', async () => {
      expect(component).toBeTruthy();
    });

    it('should redirect on invalid url', async () => {
      const routerSpy = spyOn(RouterService.prototype, 'routeToForecast');
      spyOn(component, 'loadData');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalled();
    });
    it('should redirect without forecast read permissions', async () => {
      const routerSpy = spyOn(RouterService.prototype, 'routeToAccessDenied');
      component['permission'].forecastRead = false;
      spyOn(component, 'loadData');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should have a loading icon', async () => {
      spyOn(RouterService.prototype, 'routeToForecast');
      spyOn(component, 'loadData');
      fixture.detectChanges();
      await fixture.whenStable();
      checkElementIsPresent('app-ng-loading');
    });


    it('should update on init w/out data', async () => {
      const updateSpy1 = spyOn(component, 'computeWorkability')
      // const updateSpy2 = spyOn(component, 'setWorkabilityAlongHeading')
      const updateSpy3 = spyOn(component, 'loadWeather')
      const updateSpy4 = spyOn(component, 'onProjectSettingsChange')
      component['route'].params = mockedObservable({project_id: '3'});
      fixture.detectChanges()
      await fixture.whenStable();
      expect(updateSpy1).toHaveBeenCalled();
      expect(updateSpy4).not.toHaveBeenCalled();
      // expect(updateSpy2).not.toHaveBeenCalled();
      // expect(updateSpy3).toHaveBeenCalled(); // TEMP DISABLED - apr21
    });

    it('should update on init w/ data', async () => {
      const updateSpy1 = spyOn(component, 'computeWorkability')
      // const updateSpy2 = spyOn(component, 'setWorkabilityAlongHeading')
      const updateSpy3 = spyOn(component, 'loadWeather')
      spyOn(ForecastResponseService.prototype, 'setLimitsFromOpsPreference').and.returnValue([
        new ForecastMotionLimit({Type: 'Disp', Dof: 'Heave', Value: 1.5, 'Unit': 'm'})
      ]);
      component['route'].params = mockedObservable({project_id: '1'});
      fixture.detectChanges()
      await fixture.whenStable();
      expect(updateSpy1).toHaveBeenCalled();
      // expect(updateSpy2).toHaveBeenCalled();
      // expect(updateSpy3).toHaveBeenCalled(); // TEMP DISABLED - apr21
    });
  });

  describe('after init', () => {
    beforeEach(() => {
      component['route'].params = mockedObservable({project_id: '1'});
      fixture.detectChanges();
    });

    it('should create', async () => {
      await fixture.whenStable();
      expect(component).toBeTruthy();
    });
    it('should render all components', async () => {
      await fixture.whenStable();
      checkElementIsPresent('app-forecast-project-overview');
      checkElementIsPresent('app-forecast-workability-plot');
      checkElementIsPresent('app-surface-plot');
    });
    it('should propely set min/max forecast date', () => {
      component.startTime = 737000;
      component.stopTime  = 737100;
      component.onProjectSettingsChange({
        startTime: 737200,
        stopTime: 737300,
        limits: null
      });
      expect(component.startTime).toEqual(737200);
      expect(component.stopTime ).toEqual(737300);
    });

    it('should set and update heading', () => {
      expect(component.headingLine.Value).not.toEqual(100);
      component.selectedHeading = 100;
      expect(component).toBeTruthy();
      expect(component.headingLine.Value).toEqual(100);
    });

    it('should update on change project configuration', () => {
      const updateSpy1 = spyOn(component, 'computeWorkability')
      const updateSpy3 = spyOn(component, 'loadWeather')
      component.onProjectSettingsChange(null);
      expect(updateSpy1).toHaveBeenCalled();
      expect(updateSpy3).not.toHaveBeenCalled();
    });

    it('should show a loading icon when no date is available', () => {
      expect(component).toBeTruthy();
    });
    it('should have loaded wave and spectral data', () => {
      expect(component.weather).toBeTruthy();
      expect(component.spectrum).toBeTruthy();
    });

    it('should register projectSettingsChanged', () => {
      const op = component.operations[0];
      component.responseObj.latitude = op.latitude;
      component.responseObj.longitude = op.longitude;
      component.responseObj.response.Points_Of_Interest.P1.Project_Settings.water_depth = op.water_depth;

      expect(component.projectSettingsChanged).toBe(false);
      component.responseObj.latitude += 1;
      expect(component.projectSettingsChanged).toBe(true);
    })

    it('should register projectSettingsChanged before first forecast', () => {
      component.responseObj = null
      expect(component.projectSettingsChanged).toBe(false);
    })

    it('should correctly determine if the project is no longer active', () => {
      component.operations = [{
        id: component['project_id'],
        activation_end_date: "2021-06-27T09:36:30.052000+00:00",
        activation_start_date: "2021-05-27T09:36:30.052000+00:00",
        analysis_types: ["Standard"],
        client_id: 4,
        client_preferences: null,
        latitude: 52,
        longitude: 3,
        maximum_duration: 60,
        metocean_provider: {id: 20, name: "infoplaza", display_name: "INFOPLAZA", is_active: true},
        name: "demo_1622108190052",
        nicename: "Demo project",
        vessel_id: 2,
        water_depth: 20,
      }]
      const spy = spyOn(moment, 'now').and.returnValue(1524872801778);
      fixture.detectChanges();
      component.checkProjectActive();
      expect(component.projectNotActive).toBeFalsy();
      spy.and.returnValue(1624872801778);
      fixture.detectChanges();
      component.checkProjectActive();
      expect(component.projectNotActive).toBeTruthy();
    })
  });

  describe('on new project select', () => {
    beforeEach(() => {
      spyOn(RouterService.prototype, 'routeToForecast');
      component['route'].params = of({project_id: '3'}, {project_id: '2'});
    });

    it('should init component twice', () => {
      const changeSpy = spyOn(component, 'loadData');
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(2);
      expect(component['project_id']).toEqual(2);
    });
  });

  function checkElementIsPresent(selector: string) {
    const page: HTMLElement = fixture.nativeElement;
    const webElement = page.querySelector(selector);
    expect(webElement).toBeTruthy(`Element with selector "${selector}" should be present`);
  }
});


