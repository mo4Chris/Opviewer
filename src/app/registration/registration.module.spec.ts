import { RegistrationModule } from './registration.module';

describe('RegistrationModule', () => {
  let signupModule: RegistrationModule;

  beforeEach(() => {
    signupModule = new RegistrationModule();
  });

  it('should create an instance', () => {
    expect(signupModule).toBeTruthy();
  });
});
