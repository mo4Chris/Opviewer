import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;
  const userToken = UserTestService.getMockedAccessToken();

  beforeEach(async(() => {
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
    spyOn(SetPasswordComponent.prototype, 'getTokenFromParameter').and.returnValue(userToken);
    spyOn(SetPasswordComponent.prototype, 'getUsernameFromParameter').and.returnValue(userToken.username);
    spyOn(SetPasswordComponent.prototype, 'getUserByToken');
    spyOn(CommonService.prototype, 'get2faExistence').and.returnValue(mockedObservable({secret2fa: 'test123'}));

    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create link for QR code', () => {
    component.QRCode = '';
    component.createQrCode();
    fixture.detectChanges();
    expect(component.QRCode).toBe('otpauth://totp/' + userToken.username + '?secret=' + 'test123' + '&issuer=BMO%20Dataviewer');
  });

  it('should create QRCode', () => {
    component.QRCode = '';
    component.createQrCode();
    component.initiate2fa = true;
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#QRCodeMain')).toBeTruthy();
  });

  it('should not create QRCode', () => {
    component.QRCode = '';
    component.createQrCode();
    component.initiate2fa = false;
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#QRCodeMain')).toBeNull();
  });


});
