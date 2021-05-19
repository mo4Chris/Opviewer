import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './usermanagement.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonService } from '../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockedUserServiceProvider, UserTestService } from '../../shared/services/test.user.service';
import { mockedObservable } from '../../models/testObservable';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';

describe('UsermanagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  const user = UserTestService.getMockedAccessToken();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule
      ],
        declarations: [UserManagementComponent ],
        providers: [
          MockedCommonServiceProvider,
          MockedUserServiceProvider,
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    spyOn(CommonService.prototype, 'getVessel').and.returnValue(mockedObservable(user.userBoats));
    spyOn(UserManagementComponent.prototype, 'getUsernameFromParameter').and.returnValue(user.username);

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
