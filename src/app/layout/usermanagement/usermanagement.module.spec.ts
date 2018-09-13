import { UserManagementModule } from './usermanagement.module';

describe('UsersModule', () => {
    let usersModule: UserManagementModule;

    beforeEach(() => {
        usersModule = new UserManagementModule();
    });

    it('should create an instance', () => {
        expect(usersModule).toBeTruthy();
    });
});
