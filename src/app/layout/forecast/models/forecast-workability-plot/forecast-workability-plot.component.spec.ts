import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { PlotlyModule } from 'angular-plotly.js';
import { ForecastWorkabilityPlotComponent } from './forecast-workability-plot.component';

describe('ForecastWorkabilityPlotComponent', () => {
  let component: ForecastWorkabilityPlotComponent;
  let fixture: ComponentFixture<ForecastWorkabilityPlotComponent>;
  let calc = new CalculationService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForecastWorkabilityPlotComponent
      ],
      imports: [
        PlotlyModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWorkabilityPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.hasData).toEqual(false);
  });

  it('generate a plot when data is available', async () => {
    component.workabilityAlongHeading = calc.linspace(0, 200, 20);
    component.time      = calc.linspace(737000, 737001, 1/10).map(t => datenumToDate(t));
    component.startTime = 737000.05;
    component.stopTime  = 737000.15;
    component.ngOnChanges();
    expect(component).toBeTruthy()
    expect(component.hasData).toBe(true);

    await fixture.whenStable()
    let el = fixture.nativeElement;
    let svg = el.querySelector('svg');
    expect(svg).toBeTruthy();
  })
});


function datenumToDate(serial: number) {
  const time_info = new Date((serial - 719529) * 864e5);
  return time_info;
}