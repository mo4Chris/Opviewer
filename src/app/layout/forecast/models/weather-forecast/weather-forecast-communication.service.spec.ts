import { fakeAsync, tick } from '@angular/core/testing';
import { WeatherForecastCommunicationService } from './weather-forecast-communication.service';
import { WeatherForecast } from './weather-forecast.types';

describe('WeatherForecastCommunicationService', () => {
  let service: WeatherForecastCommunicationService;

  beforeEach(() => {
    service = new WeatherForecastCommunicationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWeatherForecasts', () => {
    it('should retrieve empty array on default', (done) => {
      service.getWeatherForecasts().subscribe(actual => {
        const expected = [];
        expect(actual).toEqual(expected)
        done()
      })
    })

    it('should retrieve data send by the updatedSelectedWeatherForecasts', (done) => {
      service.updatedSelectedWeatherForecasts([{ Air: {} } as WeatherForecast])
      service.getWeatherForecasts().subscribe(actual => {
        const expected = [{ Air: {} } as WeatherForecast];
        expect(actual).toEqual(expected)
        done()
      })
    })
  })
});
