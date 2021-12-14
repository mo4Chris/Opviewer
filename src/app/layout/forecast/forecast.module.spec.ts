import { ForecastModule } from './forecast.module';

describe('LayoutModule', () => {
    let forecastModule: ForecastModule;

    beforeEach(() => {
      forecastModule = new ForecastModule();
    });

    it('should create an instance', () => {
        expect(forecastModule).toBeTruthy();
    });
});
