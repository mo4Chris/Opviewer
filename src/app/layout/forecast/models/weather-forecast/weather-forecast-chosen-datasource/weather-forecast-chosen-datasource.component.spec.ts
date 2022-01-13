import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherForecastChosenDatasourceComponent } from './weather-forecast-chosen-datasource.component';

describe('WeatherForecastChosenDatasourceComponent', () => {
  let component: WeatherForecastChosenDatasourceComponent;
  let fixture: ComponentFixture<WeatherForecastChosenDatasourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastChosenDatasourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastChosenDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
