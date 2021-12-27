import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';

import { WeatherForecastWeatherGraphsComponent } from './weather-forecast-weather-graphs.component';
import { WeatherForecastWeatherGraphsService } from './weather-forecast-weather-graphs.service';

describe('WeatherForecastWeatherGraphsComponent', () => {
  let component: WeatherForecastWeatherGraphsComponent;
  let fixture: ComponentFixture<WeatherForecastWeatherGraphsComponent>;
  let weatherForecastWeatherGraphsServiceMock;
  let weatherForecastCommunicationServiceMock
  beforeEach(async () => {
    weatherForecastWeatherGraphsServiceMock = jasmine.createSpyObj('WeatherForecastWeatherGraphsService', ['factorDailyWeatherForecastData'])
    weatherForecastCommunicationServiceMock = jasmine.createSpyObj('WeatherForecastCommunicationService', ['getWeatherForecasts'])
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastWeatherGraphsComponent ],
      providers: [ {provide:WeatherForecastWeatherGraphsService, useValue: weatherForecastWeatherGraphsServiceMock},
        {provide:WeatherForecastCommunicationService, useValue: weatherForecastCommunicationServiceMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastWeatherGraphsComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    weatherForecastCommunicationServiceMock.getWeatherForecasts.and.returnValue(of([{}]))
    weatherForecastWeatherGraphsServiceMock.factorDailyWeatherForecastData.and.returnValue(of([{}]))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
