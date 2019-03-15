import { FleetRequestModule } from './fleet-request.module';

describe('FleetRequestModule', () => {
    let usersModule: FleetRequestModule;

    beforeEach(() => {
        usersModule = new FleetRequestModule();
    });

    it('should create an instance', () => {
        expect(usersModule).toBeTruthy();
    });
});
