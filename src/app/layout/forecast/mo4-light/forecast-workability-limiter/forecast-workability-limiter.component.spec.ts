import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotlyModule } from 'angular-plotly.js';
import { ForecastMotionLimit } from '../../models/forecast-limit';
import { ForecastWorkabilityLimiterComponent } from './forecast-workability-limiter.component';

describe('ForecastWorkabilityLimiterComponent', () => {
  let component: ForecastWorkabilityLimiterComponent;
  let fixture: ComponentFixture<ForecastWorkabilityLimiterComponent>;
  let initSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastWorkabilityLimiterComponent ],
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        PlotlyModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWorkabilityLimiterComponent);
    component = fixture.componentInstance;
    initSpy = spyOn(component, 'onPlotlyInit')
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run w/ data', async () => {
    component.time = [
      new Date(2020, 1, 1, 2, 0, 0),
      new Date(2020, 1, 1, 2, 5, 0),
      new Date(2020, 1, 1, 2, 10, 0)
    ],
    component.workabilityPerLimiter = [
      [90, 105, 99],
      [80, 90, 105]
    ];
    component.combinedWorkability = [
      90, 105, 105
    ];
    component.limits = [new ForecastMotionLimit({
      Type: 'Acc',
      Dof: 'Heave',
      Value: 10
    }), new ForecastMotionLimit({
      Type: 'Wind',
      Dof: 'Gust',
      Value: 10
    })];
    component.ngOnChanges();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.parsedData.length).toEqual(3);
  });
});
