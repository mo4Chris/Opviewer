import { WeatherForecastUtilsService } from './weather-forecast-utils.service';

describe('WeatherForecastUtilsService', () => {
  let service: WeatherForecastUtilsService;

  beforeEach(() => {
    const commonServiceMock = jasmine.createSpyObj('commonService', ['getWeatherForecasts'])
    service =new WeatherForecastUtilsService(commonServiceMock)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
