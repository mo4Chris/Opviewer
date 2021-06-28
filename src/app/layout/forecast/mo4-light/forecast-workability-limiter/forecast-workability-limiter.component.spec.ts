import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastWorkabilityLimiterComponent } from './forecast-workability-limiter.component';

describe('ForecastWorkabilityLimiterComponent', () => {
  let component: ForecastWorkabilityLimiterComponent;
  let fixture: ComponentFixture<ForecastWorkabilityLimiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastWorkabilityLimiterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWorkabilityLimiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
