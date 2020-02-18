import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementComponent } from './usermanagement.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserManagementRoutingModule } from './usermanagement-routing.module';
import { PageHeaderModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonService } from '../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { UserService } from '../../shared/services/user.service';
import { UserTestService } from '../../shared/services/test.user.service';
import { mockedObservable } from '../../models/testObservable';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';

describe('UsermanagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  const user = UserTestService.getMockedAccessToken();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PageHeaderModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpModule
      ],
        declarations: [UserManagementComponent ],
        providers: [MockedCommonServiceProvider],
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    // spyOn(CommonService.prototype, 'checkUserActive').and.returnValue(mockedObservable(true));
    // spyOn(CommonService.prototype, 'getUserByUsername').and.returnValue(mockedObservable([user]));
    spyOn(CommonService.prototype, 'getVesselsForCompany').and.returnValue(mockedObservable(user.userBoats));

    spyOn(UserManagementComponent.prototype, 'getUsernameFromParameter').and.returnValue(user.username);

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.tokenInfo = user;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
