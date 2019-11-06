import { UserManagementModule } from './usermanagement.module';

describe('UsersManagementModule', () => {
    let testModule: UserManagementModule;

    beforeEach(() => {
        testModule = new UserManagementModule();
    });

    it('should create an instance', () => {
        expect(testModule).toBeTruthy();
    });
});
