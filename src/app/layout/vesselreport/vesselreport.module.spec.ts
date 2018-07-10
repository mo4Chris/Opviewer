import { VesselreportModule } from './vesselreport.module';

describe('VesselreportModule', () => {
  let vesselreportModule: VesselreportModule;

  beforeEach(() => {
    vesselreportModule = new VesselreportModule();
  });

  it('should create an instance', () => {
    expect(vesselreportModule).toBeTruthy();
  });
});
