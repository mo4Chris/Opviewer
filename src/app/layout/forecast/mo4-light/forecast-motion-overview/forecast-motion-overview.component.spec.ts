import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastMotionOverviewComponent } from './forecast-motion-overview.component';

describe('ForecastMotionOverviewComponent', () => {
  let component: ForecastMotionOverviewComponent;
  let fixture: ComponentFixture<ForecastMotionOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastMotionOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastMotionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
