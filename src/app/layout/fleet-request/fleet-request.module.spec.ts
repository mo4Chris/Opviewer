import { FleetRequestModule } from './fleet-request.module';

describe('FleetRequestModule', () => {
    let testModule: FleetRequestModule;

    beforeEach(() => {
        testModule = new FleetRequestModule();
    });

    it('should create an instance', () => {
        expect(testModule).toBeTruthy();
    });
});
