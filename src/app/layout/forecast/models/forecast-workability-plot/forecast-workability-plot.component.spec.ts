import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastWorkabilityPlotComponent } from './forecast-workability-plot.component';

describe('ForecastWorkabilityPlotComponent', () => {
  let component: ForecastWorkabilityPlotComponent;
  let fixture: ComponentFixture<ForecastWorkabilityPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastWorkabilityPlotComponent ]
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
  });
});
