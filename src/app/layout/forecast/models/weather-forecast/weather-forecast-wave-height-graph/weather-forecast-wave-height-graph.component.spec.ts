import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WeatherForecastCommunicationService } from '../weather-forecast-communication.service';

import { WeatherForecastWaveHeightGraphComponent } from './weather-forecast-wave-height-graph.component';
import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph.service';

describe('WeatherForecastWaveHeightGraphComponent', () => {
  let component: WeatherForecastWaveHeightGraphComponent;
  let fixture: ComponentFixture<WeatherForecastWaveHeightGraphComponent>;
  let weatherForecastWaveHeightGraphServiceMock;
  let weatherForecastCommunicationServiceMock;
  beforeEach(async () => {
    weatherForecastWaveHeightGraphServiceMock = jasmine.createSpyObj('weatherForecastWaveHeightGraph', ['getPlotData'])
    weatherForecastCommunicationServiceMock = jasmine.createSpyObj('weatherForecastCommunicationService', ['getWeatherForecasts'])
    await TestBed.configureTestingModule({
      declarations: [WeatherForecastWaveHeightGraphComponent],
      providers: [{ provide: WeatherForecastWaveHeightGraphService, useValue: weatherForecastWaveHeightGraphServiceMock },
      { provide: WeatherForecastCommunicationService, useValue: weatherForecastCommunicationServiceMock }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherForecastWaveHeightGraphComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.selectedForecast = of({});
    weatherForecastCommunicationServiceMock.getWeatherForecasts.and.returnValue(of([]))
    weatherForecastWaveHeightGraphServiceMock.getPlotData.and.returnValue(of([]))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
