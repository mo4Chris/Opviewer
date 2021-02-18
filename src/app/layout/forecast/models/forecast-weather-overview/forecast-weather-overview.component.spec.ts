import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastWeatherOverviewComponent } from './forecast-weather-overview.component';

describe('ForecastWeatherOverviewComponent', () => {
  let component: ForecastWeatherOverviewComponent;
  let fixture: ComponentFixture<ForecastWeatherOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastWeatherOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWeatherOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
