import { FleetsModule } from './fleets.module';

describe('FleetsModule', () => {
    let usersModule: FleetsModule;

    beforeEach(() => {
        usersModule = new FleetsModule();
    });

    it('should create an instance', () => {
        expect(usersModule).toBeTruthy();
    });
});
