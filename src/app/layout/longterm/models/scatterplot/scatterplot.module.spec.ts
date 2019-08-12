import { ScatterplotComponent } from './scatterplot.component';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';

describe('VesselreportModule', () => {
  let scatterplotModule: ScatterplotComponent;
  const calcService = new CalculationService();
  const dateService = new DatetimeService();

  beforeEach(() => {
    const vesselObject = {mmsi: [123456789], dateMin: 1, dateMax: 10, dateNormalMin: 'Test_min', dateNormalMax: 'Test_max'};
    const compArray = [
      { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer' }
    ];
    scatterplotModule = new ScatterplotComponent(vesselObject, compArray, calcService, dateService);
  });

  it('should create an instance', () => {
    expect(scatterplotModule).toBeTruthy();
  });
});
