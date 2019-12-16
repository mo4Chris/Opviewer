import { UserSettingsModule } from './user-settings.module';


describe('User settings module', () => {
    let userSettingModule: UserSettingsModule;

    beforeEach(() => {
        userSettingModule = new UserSettingsModule();
    });

    it('should create an instance', () => {
        expect(userSettingModule).toBeTruthy();
    });
});
