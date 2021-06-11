import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './usermanagement.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonService } from '@app/common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { mockedObservable } from '@app/models/testObservable';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

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
    spyOn(CommonService.prototype, 'getVessel').and.returnValue(
      mockedObservable(user.userBoats)
    );
    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    spyOn(component['route'], 'params').and.returnValue(
      mockedObservable(user.username)
    );
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(component.allowed_vessels?.length).toBeGreaterThan(0);
  });

  it('should save on click', () => {
    const ret_val = mockedObservable({data: 'Great success'});
    const saveSpy = spyOn(MockedCommonService.prototype, 'saveUserVessels').and.returnValue(ret_val)
    const btn = <HTMLButtonElement> locate('button')
    btn.click()
    expect(saveSpy).toHaveBeenCalled();
  })


  function locate(locator: string) {
    const nativeElt = <HTMLElement> fixture.nativeElement;
    return nativeElt.querySelector(locator);
  }
});
