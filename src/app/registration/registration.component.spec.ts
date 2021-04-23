import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationComponent } from './registration.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { AppModule } from '@app/app.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { AuthService } from '@app/auth.service';
import { Router } from '@angular/router';
import { mockedObservable } from '@app/models/testObservable';
import { AlertService } from '@app/supportModules/alert.service';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
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
        RegistrationComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    authSpy = spyOn(AuthService.prototype, 'registerDemoUser').and.returnValue(mockedObservable({
      data: 'User registration tested!'
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call correct service on register', () => {

    component.registerUserData = {
      email: 'test@testerson.nl',
      password: 'test1234',
      client: 'MO4',
      confirmPassword: 'test1234',
      name: 'Actual Human',
      company: 'Picobello BV',
      job_title: 'Opperbaas',
      phoneNumber: '',
      agreeDataPolicy: true
    }

    const btn = fixture.nativeElement.querySelector('#register');
    btn.click();
    fixture.detectChanges();
    expect(authSpy).toHaveBeenCalled();
  });

});
