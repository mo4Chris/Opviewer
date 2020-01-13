import { ReportDprModule } from './report-dpr.module';

describe('VesselreportModule', () => {
  let vesselreportModule: ReportDprModule;

  beforeEach(() => {
    vesselreportModule = new ReportDprModule();
  });

  it('should create an instance', () => {
    expect(vesselreportModule).toBeTruthy();
  });
});
