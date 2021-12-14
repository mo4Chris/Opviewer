import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppModule } from '@app/app.module';
import { Router } from '@angular/router';

let fixture: ComponentFixture<LoginComponent>;
describe('LoginComponent', () => {
  let component: LoginComponent;
  let routerSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        AppModule,
      ],
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    routerSpy = spyOn(Router.prototype, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger cb on button click', async () => {
    await fixture.whenStable();
    sendDataToInput('input[name="username"]', 'test@test.nl');
    sendDataToInput('input[name="password"]', 'test123');
    sendDataToInput('input[name="confirm2fa"]', 'test2fa');
    const cbSpy = spyOn(component, 'onLoggedin');
    const btn = fixture.nativeElement.querySelector('#loginButton');
    btn.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    expect(cbSpy).toHaveBeenCalled();
    expect(component.loginUserData).toEqual({
      username: 'test@test.nl',
      password: 'test123',
      confirm2fa: 'test2fa'
    });
  });
});

function sendDataToInput(selector: string, text: string) {
  const input = fixture.nativeElement.querySelector(selector);
  input.value = text;
  input.dispatchEvent(new Event('input'));
}
