import { FleetavailabilityModule } from './fleetavailability.module';

describe('FleetavailabilityModule', () => {
    let usersModule: FleetavailabilityModule;

    beforeEach(() => {
        usersModule = new FleetavailabilityModule();
    });

    it('should create an instance', () => {
        expect(usersModule).toBeTruthy();
    });
});
