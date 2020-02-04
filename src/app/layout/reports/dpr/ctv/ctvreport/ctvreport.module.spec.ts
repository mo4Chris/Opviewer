import { CtvreportModule } from './ctvreport.module';

describe('CtvreportModule', () => {
  let ctvreportModule: CtvreportModule;

  beforeEach(() => {
    ctvreportModule = new CtvreportModule();
  });

  it('should create an instance', () => {
    expect(ctvreportModule).toBeTruthy();
  });
});
