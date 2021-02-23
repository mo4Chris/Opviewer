import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { AppModule } from '@app/app.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { AuthService } from '@app/auth.service';
import { Router } from '@angular/router';
import { mockedObservable } from '@app/models/testObservable';
import { AlertService } from '@app/supportModules/alert.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule,
        AppModule,
      ],
      declarations: [
        SignupComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authSpy = spyOn(AuthService.prototype, 'registerUser').and.returnValue(mockedObservable({
      data: 'User registration tested!'
    }));
  });

  it('should create as admin', () => {
    component.permission.admin = true;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.businessNames.length).toBeGreaterThan(0);
  });

  it('should reroute w/out userCreate rights', () => {
    component.permission.admin = false;
    component.permission.userCreate = false;
    const routerSpy = spyOn(Router.prototype, 'navigate');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should create w/ userCreate rights', async (done) => {
    component.permission.admin = false;
    component.permission.userCreate = true;
    const routerSpy = spyOn(Router.prototype, 'navigate');
    const onRegistrationSpy = spyOn(SignupComponent.prototype, 'onRegistration').and.callThrough();
    const alertSpy = spyOn(AlertService.prototype, 'sendAlert');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(routerSpy).not.toHaveBeenCalled();

    component.registerUserData = {
      permissions: 'Vessel master',
      email: 'test@test.nl',
      client: 'test company 1',
    };
    const btn = fixture.nativeElement.querySelector('#register');
    btn.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    expect(onRegistrationSpy).toHaveBeenCalled();
    expect(authSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalled();
    done();
  });
});
