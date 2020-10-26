import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FleetsComponent } from './fleets.component';
import { CommonService } from '../../../common.service';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../../shared';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserTestService } from '../../../shared/services/test.user.service';
import { UserService } from '../../../shared/services/user.service';
import { mockedObservable } from '../../../models/testObservable';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

describe('FleetComponent', () => {
    let component: FleetsComponent;
    let fixture: ComponentFixture<FleetsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
              FormsModule,
              NgbModule,
              PageHeaderModule,
              RouterTestingModule,
              HttpModule,
              BrowserAnimationsModule
            ],
            providers: [MockedCommonServiceProvider],
            declarations: [FleetsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
        spyOn(FleetsComponent.prototype, 'getMsg');
        spyOn(CommonService.prototype, 'getCompanies').and.returnValue(mockedObservable([]));
        spyOn(CommonService.prototype, 'getTurbineWarranty').and.returnValue(mockedObservable(['Windcat_mcTesty']));
        spyOn(CommonService.prototype, 'getTurbineWarrantyForCompany').and.returnValue(mockedObservable(['Windcat_mcTesty']));
        spyOn(FleetsComponent.prototype, 'redirectFleetAvailability');
        // spyOn(FleetsComponent.prototype, 'redirectFleetLog');
        // spyOn(FleetsComponent.prototype, 'redirectFleetRequest');

        fixture = TestBed.createComponent(FleetsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
