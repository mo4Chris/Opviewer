import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SettingsService } from '@app/supportModules/settings.service';
import { MockComponents } from 'ng-mocks';
import { ForecastWorkabilityPlotComponent } from '../../models/forecast-workability-plot/forecast-workability-plot.component';
import { SurfacePlotComponent } from '../../models/surface-plot/surface-plot.component';
import { ForecastWorkabilityComponent } from './forecast-workability.component';

fdescribe('ForecastWorkabilityComponent', () => {
  let component: ForecastWorkabilityComponent;
  let fixture: ComponentFixture<ForecastWorkabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForecastWorkabilityComponent,
        MockComponents(
          SurfacePlotComponent,
          ForecastWorkabilityPlotComponent,
        ),
      ],
      providers: [
        MockedUserServiceProvider,
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWorkabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to parse an empty response', () => {
    component.response = {
      consumer_id: 1,
      id: 2,
      metocean_id: "3",
      project_id: 4,
      response: {
        Points_Of_Interest: {
          P1: {
            Coordinates: {X: {Data: 0, String_Value: ''}, Y: {Data: 0, String_Value: ''}, Z: {Data: 0, String_Value: ''}},
            Heading: [],
            Time: [],
            Response: {
              Acc: [],
              Vel: [],
              Disp: [],
            }
          }
        }
      }
    }
    component.heading = 90;
    component.limits = [];
    expect(component).toBeTruthy();
  });
});
