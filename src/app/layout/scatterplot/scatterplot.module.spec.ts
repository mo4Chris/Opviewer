import { ScatterplotModule } from './scatterplot.module';

describe('VesselreportModule', () => {
  let scatterplotModule: ScatterplotModule;

  beforeEach(() => {
    scatterplotModule = new ScatterplotModule();
  });

  it('should create an instance', () => {
    expect(scatterplotModule).toBeTruthy();
  });
});
