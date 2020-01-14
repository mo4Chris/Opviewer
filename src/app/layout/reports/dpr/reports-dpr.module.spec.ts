import { ReportsDprModule } from './reports-dpr.module';

describe('VesselreportModule', () => {
  let vesselreportModule: ReportsDprModule;

  beforeEach(() => {
    vesselreportModule = new ReportsDprModule();
  });

  it('should create an instance', () => {
    expect(vesselreportModule).toBeTruthy();
  });
});
