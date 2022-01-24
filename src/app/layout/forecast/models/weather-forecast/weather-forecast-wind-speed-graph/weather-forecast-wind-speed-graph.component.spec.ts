import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';

import { WeatherForecastWindSpeedGraphComponent } from './weather-forecast-wind-speed-graph.component';
import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph.service';

describe('WeatherForecastWindSpeedGraphComponent', () => {
  let component: WeatherForecastWindSpeedGraphComponent;
  let fixture: ComponentFixture<WeatherForecastWindSpeedGraphComponent>;
  let weatherForecastWindSpeedGraphServiceMock;
  let weatherForecastCommunicationServiceMock;
  beforeEach(async () => {
    weatherForecastWindSpeedGraphServiceMock = jasmine.createSpyObj('weatherForecastWindSpeedGraph', ['getPlotData'] )
    weatherForecastCommunicationServiceMock = jasmine.createSpyObj('WeatherForecastCommunicationService', ['getWeatherForecasts'] )
    await TestBed.configureTestingModule({
      declarations: [ WeatherForecastWindSpeedGraphComponent ],
      providers:[ {provide: WeatherForecastWindSpeedGraphService, useValue: weatherForecastWindSpeedGraphServiceMock},
        {provide: WeatherForecastCommunicationService, useValue: weatherForecastCommunicationServiceMock}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastWindSpeedGraphComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    component.selectedForecast = of({})
    weatherForecastCommunicationServiceMock.getWeatherForecasts.and.returnValue(of([]))
    weatherForecastWindSpeedGraphServiceMock.getPlotData.and.returnValue(of([]))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
