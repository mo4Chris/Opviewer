import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FleetRequestComponent } from './fleet-request.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from '../../../common.service';
import { UserTestService } from '../../../shared/services/test.user.service';
import { UserService } from '../../../shared/services/user.service';
import { mockedObservable } from '../../../models/testObservable';
import { MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';

describe('FleetRequestComponent', () => {
    let component: FleetRequestComponent;
    let fixture: ComponentFixture<FleetRequestComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule,
                HttpClientModule,
                FormsModule,
                PageHeaderModule,
                RouterTestingModule,
                BrowserAnimationsModule,
                NgMultiSelectDropDownModule,
              ],
            providers: [MockedCommonServiceProvider],
            declarations: [FleetRequestComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
        spyOn(FleetRequestComponent.prototype, 'getBoats');
        spyOn(CommonService.prototype, 'getCompanies').and.returnValue(mockedObservable([]));
        fixture = TestBed.createComponent(FleetRequestComponent);
        component = fixture.componentInstance;
        component.boats = [];
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});
