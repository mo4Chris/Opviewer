import { ClientOverviewModule } from './client-overview.module';

describe('UsersManagementModule', () => {
    let testModule: ClientOverviewModule;

    beforeEach(() => {
        testModule = new ClientOverviewModule();
    });

    it('should create an instance', () => {
        expect(testModule).toBeTruthy();
    });
});
