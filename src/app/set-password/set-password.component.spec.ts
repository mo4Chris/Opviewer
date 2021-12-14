import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SetPasswordComponent } from './set-password.component';
import { CommonService } from '@app/common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/auth.service';
import { UserTestService } from '@app/shared/services/test.user.service';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { mockedObservable } from '@app/models/testObservable';
import * as twoFactor from 'node-2fa';
import { RouterService } from '@app/supportModules/router.service';

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;
  let routerSpy: jasmine.Spy;
  const userToken = UserTestService.getMockedAccessToken();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        NgbModule,
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        NgxQRCodeModule,
      ],
      declarations: [ SetPasswordComponent ],
      providers: [ CommonService, AuthService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    spyOn(AuthService.prototype, 'getRegistrationInformation').and.returnValue(mockedObservable(userToken))
    spyOn(SetPasswordComponent.prototype, 'initParameters').and.callFake(() => {
      component.token = 'aratherrandomhashedtoken';
      component.username = userToken.username;
      return mockedObservable(null); // Need to return observable
    })
    routerSpy = spyOn(RouterService.prototype, 'route');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create link for QR code', () => {
    component.QRCode = '';
    component.createQrCode();
    fixture.detectChanges();
    expect(component.QRCode).toMatch('otpauth://totp/' + userToken.username);
  });

  it('should create QRCode', async () => {
    component.QRCode = '';
    component.createQrCode();
    component.initiate2fa = true;
    component.requires2fa = true;
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    await expect(compiled.querySelector('#QRCodeMain')).toBeTruthy();
  });

  it('should not create QRCode', async () => {
    component.QRCode = '';
    component.createQrCode();
    component.initiate2fa = false;
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    await expect(compiled.querySelector('#QRCodeMain')).toBeNull();
  });

  it('should add 2fa content if required', fakeAsync(() => {
    component.requires2fa = true;
    component.secretAsBase32 = 'test';
    component.passwords = {
      confirm2fa: '123456',
      password: 'aV@l1dPass',
      confirmPassword: 'aV@l1dPass'
    }
    let isvalid = false;
    spyOn(twoFactor, 'verifyToken').and.returnValue(true);
    let spy = spyOn(AuthService.prototype, 'setUserPassword').and.callFake(_req => {
      isvalid = _req.secret2fa != null;
      return mockedObservable(null);
    })
    fixture.detectChanges()
    component.setUserPassword();
    expect(spy).toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalled();
    tick(10000)
    expect(routerSpy).toHaveBeenCalled();
    expect(isvalid).toBeTruthy();
  }))

  it('should not add 2fa content if disabled', fakeAsync(() => {
    component.requires2fa = false;
    component.secretAsBase32 = undefined;
    component.passwords = {
      confirm2fa: null,
      password: 'aV@l1dPass',
      confirmPassword: 'aV@l1dPass'
    }
    let isvalid = false;
    spyOn(twoFactor, 'verifyToken').and.returnValue(true);
    let spy = spyOn(AuthService.prototype, 'setUserPassword').and.callFake(_req => {
      isvalid = _req.secret2fa == undefined;
      return mockedObservable(null);
    })
    fixture.detectChanges()
    component.setUserPassword();
    expect(spy).toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalled();
    tick(10000)
    expect(routerSpy).toHaveBeenCalled();
    expect(isvalid).toBeTruthy();
  }))
});
