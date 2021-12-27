import { WeatherForecastUtilsService } from './weather-forecast-utils.service';

describe('WeatherForecastUtilsService', () => {
  let service: WeatherForecastUtilsService;

  beforeEach(() => {
    service =new WeatherForecastUtilsService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});
