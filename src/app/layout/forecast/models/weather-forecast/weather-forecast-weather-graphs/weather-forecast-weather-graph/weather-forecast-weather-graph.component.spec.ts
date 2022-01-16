import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherForecastWeatherGraphComponent } from './weather-forecast-weather-graph.component';
import { WeatherForecastWeatherGraphService } from './weather-forecast-weather-graph.service';

describe('WeatherForecastWeatherGraphComponent', () => {
  let component: WeatherForecastWeatherGraphComponent;
  let fixture: ComponentFixture<WeatherForecastWeatherGraphComponent>;

  beforeEach(async () => {
    const weatherForecastWeatherGraphServiceMock = jasmine.createSpyObj('WeatherForecastWeatherGraphService', ['createGraphInformation'])
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastWeatherGraphComponent ],
      providers: [{provide: WeatherForecastWeatherGraphService, useValue: weatherForecastWeatherGraphServiceMock}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastWeatherGraphComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    component.weatherForecast = []
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
