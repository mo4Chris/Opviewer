import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '@app/common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { of } from 'rxjs';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';
import { WeatherForecastUtilsService } from '../weather-forecast-utils.service';

import { WeatherForecastGraphComponent } from './weather-forecast-graph.component';

describe('WeatherForecastGraphComponent', () => {
  let component: WeatherForecastGraphComponent;
  let fixture: ComponentFixture<WeatherForecastGraphComponent>;
  let weatherForecastCommunicationServiceMock;
  beforeEach(async () => {
    const weatherForecastUtilsServiceMock = jasmine.createSpyObj('WeatherForecastUtilsService', ['getMetoceanForecasts'])
    weatherForecastCommunicationServiceMock = jasmine.createSpyObj('WeatherForecastCommunicationService', ['updatedSelectedWeatherForecasts', 'getWeatherForecasts'], )
    const commonServiceMock = jasmine.createSpyObj('CommonService', ['getSpecificWeatherForecasts'])
    const dateTimeServiceMock = jasmine.createSpyObj('DatetimeService', ['matlabDatenumToYmdHmString'])
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ WeatherForecastGraphComponent ],
      providers: [
        {provide: WeatherForecastUtilsService, useValue: weatherForecastUtilsServiceMock },
        {provide:WeatherForecastCommunicationService, useValue: weatherForecastCommunicationServiceMock},
        {provide:CommonService, useValue: commonServiceMock},
        {provide:DatetimeService, useValue: dateTimeServiceMock},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastGraphComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    weatherForecastCommunicationServiceMock.getWeatherForecasts.and.returnValue(of([]))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
