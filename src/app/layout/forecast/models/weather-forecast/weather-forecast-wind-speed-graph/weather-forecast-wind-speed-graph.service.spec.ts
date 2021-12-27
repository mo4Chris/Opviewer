import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph.service';

describe('WeatherForecastWindSpeedGraphService', () => {
  let service: WeatherForecastWindSpeedGraphService;

  beforeEach(() => {
    service = new WeatherForecastWindSpeedGraphService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
