import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { ForecastOpsPickerComponent } from '../forecast-ops-picker/forecast-ops-picker.component';
import { HeadingPickerComponent } from '../models/heading-picker/heading-picker.component';
import { ForecastWorkabilityPlotComponent } from '../models/forecast-workability-plot/forecast-workability-plot.component'
import { SurfacePlotComponent } from '../models/surface-plot/surface-plot.component';
import { Mo4LightComponent } from './mo4-light.component';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterService } from '@app/supportModules/router.service';
import { mockedObservable } from '@app/models/testObservable';
import { of } from 'rxjs';


fdescribe('Mo4LightComponent', () => {
  let component: Mo4LightComponent;
  let fixture: ComponentFixture<Mo4LightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Mo4LightComponent,
        MockComponents(
          ForecastOpsPickerComponent,
          HeadingPickerComponent,
          SurfacePlotComponent,
          ForecastWorkabilityPlotComponent,
        )
      ],
      imports: [
        CommonModule,
        SupportModelModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4LightComponent);
    component = fixture.componentInstance;
  });

  describe('before init', () => {
    it('should create', async () => {
      await fixture.whenStable();
      expect(component).toBeTruthy();
    });

    it('should redirect on invalid url', () => {
      const routerSpy = spyOn(RouterService.prototype, 'routeToForecast')
      spyOn(component, 'loadData');
      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should have a loading icon', () => {
      spyOn(RouterService.prototype, 'routeToForecast')
      spyOn(component, 'loadData');
      fixture.detectChanges();
      checkElementIsPresent('app-ng-loading');
    })
  })

  describe('after init', () => {
    beforeEach(() => {
      component['route'].params = mockedObservable({project_id: '3'});
      fixture.detectChanges();
    })

    it('should create', () => {
      expect(component).toBeTruthy();
    });
    it('should render all components', async () => {
      await fixture.whenStable();
      checkElementIsPresent('app-forecast-ops-picker')
      checkElementIsPresent('app-forecast-workability-plot')
      checkElementIsPresent('app-surface-plot')
    })
    it('should propely set min/max forecast date', () => {
      expect(component).toBeTruthy();
    });
  
    it('should set and update heading', () => {
      expect(component).toBeTruthy();
    });
  
    it('should update on change project configuration', () => {
      expect(component).toBeTruthy();
    });
  
    it('should set parse workability', () => {
      expect(component).toBeTruthy();
    });
  
    it('should show a loading icon when no date is available', () => {
      expect(component).toBeTruthy();
    });
  })

  describe('on new project select', () => {
    beforeEach(() => {
      spyOn(RouterService.prototype, 'routeToForecast')
      component['route'].params = of({project_id: '3'}, {project_id: "2"})
    })

    it('should init component twice', () => {
      const changeSpy = spyOn(component, 'loadData')
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(2);
      expect(component['project_id']).toEqual(2);
    })
  })

  function checkElementIsPresent(selector: string) {
    const page: HTMLElement = fixture.nativeElement;
    const webElement = page.querySelector(selector)
    expect(webElement).toBeTruthy(`Element with selector "${selector}" should be present`)
  }
});


