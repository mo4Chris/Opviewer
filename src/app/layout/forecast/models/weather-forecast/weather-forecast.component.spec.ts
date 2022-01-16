import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonService } from '@app/common.service';
import { WeatherForecastCommunicationService } from './weather-forecast-communication.service';
import { WeatherForecastUtilsService } from './weather-forecast-utils.service';

import { WeatherForecastComponent } from './weather-forecast.component';

describe('WeatherForecastComponent', () => {
  let component: WeatherForecastComponent;
  let fixture: ComponentFixture<WeatherForecastComponent>;

  beforeEach(async () => {
    const weatherForecastUtilsServiceMock = jasmine.createSpyObj('WeatherForecastUtilsService', ['getMetoceanForecasts'])
    const weatherForecastCommunicationServiceMock = jasmine.createSpyObj('WeatherForecastCommunicationService', ['updatedSelectedWeatherForecasts'])
    const commonServiceMock = jasmine.createSpyObj('CommonService', ['getSpecificWeatherForecasts'])
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastComponent ],
      providers: [
        {provide: WeatherForecastUtilsService, useValue: weatherForecastUtilsServiceMock },
        {provide:WeatherForecastCommunicationService, useValue: weatherForecastCommunicationServiceMock},
        {provide:CommonService, useValue: commonServiceMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
