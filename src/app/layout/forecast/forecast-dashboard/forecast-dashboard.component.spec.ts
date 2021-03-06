import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastDashboardComponent } from './forecast-dashboard.component';

describe('ForecastDashboardComponent', () => {
  let component: ForecastDashboardComponent;
  let fixture: ComponentFixture<ForecastDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastDashboardComponent ],
      imports: [
        FormsModule,
        NgbModule,
        CommonModule,
        RouterTestingModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have working buttons', async () => {
    component.projects = [{
      id: 0,
      nicename: 'TESTY',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 1234,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: null,
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }];
    const routerSpyProjectOverview = spyOn(RouterService.prototype, 'routeToForecastProjectOverview');
    const routerSpyForecast = spyOn(RouterService.prototype, 'routeToForecast');
    await fixture.whenStable();
    const elt: HTMLElement = fixture.nativeElement;
    const hoverDivs: NodeListOf<HTMLButtonElement> = elt.querySelectorAll('button');
    hoverDivs.forEach(btn => {
      btn.click();
    });
    expect(routerSpyProjectOverview).toHaveBeenCalled();
    expect(routerSpyForecast).toHaveBeenCalled();
  });
});
