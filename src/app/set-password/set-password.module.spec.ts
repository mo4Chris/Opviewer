import { SetPasswordModule } from './set-password.module';

describe('SignupModule', () => {
  let setPasswordModule: SetPasswordModule;

  beforeEach(() => {
    setPasswordModule = new SetPasswordModule();
  });

  it('should create an instance', () => {
      expect(setPasswordModule).toBeTruthy();
  });
});
