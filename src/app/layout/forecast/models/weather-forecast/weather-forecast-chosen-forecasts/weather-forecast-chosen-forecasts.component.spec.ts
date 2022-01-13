import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherForecastChosenForecastsComponent } from './weather-forecast-chosen-forecasts.component';

describe('WeatherForecastChosenForecastsComponent', () => {
  let component: WeatherForecastChosenForecastsComponent;
  let fixture: ComponentFixture<WeatherForecastChosenForecastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastChosenForecastsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastChosenForecastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
