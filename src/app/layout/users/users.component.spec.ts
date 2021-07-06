import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsersRoutingModule } from './users-routing.module';
import { UserTestService } from '@app/shared/services/test.user.service';
import { UserService } from '@app/shared/services/user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { UserModel } from '@app/models/userModel';
import { RouterService } from '@app/supportModules/router.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let routingSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        PageHeaderModule,
        HttpClientModule,
        RouterTestingModule,
        UsersRoutingModule,
        BrowserAnimationsModule],
      declarations: [ UsersComponent ],
      providers: [MockedCommonServiceProvider],
    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    routingSpy = spyOn(RouterService.prototype, 'routeToManageUser')

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.userData.length).toBeGreaterThan(0);
  });

  it('should redirect to usermanagement component', () => {
    expect(routingSpy).not.toHaveBeenCalled();
    const btn = <HTMLButtonElement> locate('#set-vessels');
    btn.click();
    expect(routingSpy).toHaveBeenCalled();
  })

  it('should set users (in)active', () => {
    let setActiveSpy = spyOn(component, 'setActive')
    let setInactiveSpy = spyOn(component, 'setInactive')

    const btn = <HTMLButtonElement> locate('#set-user-inactive')
    expect(btn).toBeTruthy('Set inactive btn not found')
    btn.click();
    expect(setActiveSpy).not.toHaveBeenCalled();
    expect(setInactiveSpy).toHaveBeenCalled();
  })

  describe('should sort correctly', () => {
    beforeEach(() => {
      component.userData = [
        newUser('Alfa', 'Type_Beta', 'Client_C'),
        newUser('Beta', 'Type_Delta', 'Client_A'),
        newUser('Charly', 'Type_Alfa', 'Client_B'),
      ];
      fixture.detectChanges();
    })

    it('on name', () => {
      const btn = <HTMLButtonElement> locate('#username');
      btn.click();
      expect(component.sort.isAsc).toEqual(true);
      expect(component.userData[0].username).toEqual('Alfa')
      btn.click();
      expect(component.sort.isAsc).toEqual(false);
      expect(component.userData[0].username).toEqual('Charly')
    })

    it('on client', () => {
      const btn = <HTMLButtonElement> locate('#client');
      btn.click();
      expect(component.userData[0].username).toEqual('Beta')
      btn.click();
      expect(component.userData[0].username).toEqual('Alfa')
    })

    it('on account type', () => {
      const btn = <HTMLButtonElement> locate('#usertype');
      btn.click();
      expect(component.userData[0].username).toEqual('Charly')
      btn.click();
      expect(component.userData[0].username).toEqual('Beta')
    })
  })

  function locate(locator: string) {
    const nativeElt = <HTMLElement> fixture.nativeElement;
    return nativeElt.querySelector(locator);
  }
});

function newUser(name: string, user_type: string, client: string) {
  return <UserModel> {
    active: true,
    boats: [{mmsi: 1, nicename: 'test boat'}],
    client_id: client.length,
    client_name: client,
    permission: <any> {
      admin: false,
      user_type: user_type
    },
    userID: name.length,
    username: name,
    vessel_ids: [1],
  }
}
