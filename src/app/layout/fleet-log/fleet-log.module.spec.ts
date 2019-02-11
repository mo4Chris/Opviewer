import { FleetLogModule } from './fleet-log.module';

describe('FleetLogModule', () => {
    let usersModule: FleetLogModule;

    beforeEach(() => {
        usersModule = new FleetLogModule();
    });

    it('should create an instance', () => {
        expect(usersModule).toBeTruthy();
    });
});
