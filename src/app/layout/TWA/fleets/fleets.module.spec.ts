import { FleetsModule } from './fleets.module';
import { FleetsComponent } from './fleets.component';
import { CommonService } from '../../common.service';
import { mockedObservable } from '../../models/testObservable';

describe('FleetsModule', () => {
    let testModule: FleetsModule;

    beforeEach(() => {
        testModule = new FleetsModule();
        spyOn(CommonService.prototype, 'getCompanies').and.returnValue(mockedObservable([]));
        spyOn(CommonService.prototype, 'getTurbineWarrantyOne').and.returnValue(mockedObservable([]));
        spyOn(CommonService.prototype, 'getTurbineWarranty').and.returnValue(mockedObservable([]));
    });

    it('should create', () => {
        expect(testModule).toBeTruthy();
    });
});
