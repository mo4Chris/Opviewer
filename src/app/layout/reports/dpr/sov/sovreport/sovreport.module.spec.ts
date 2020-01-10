import { SovreportModule } from './sovreport.module';

describe('SovreportModule', () => {
  let sovreportModule: SovreportModule;

  beforeEach(() => {
    sovreportModule = new SovreportModule();
  });

  it('should create an instance', () => {
    expect(sovreportModule).toBeTruthy();
  });
});
