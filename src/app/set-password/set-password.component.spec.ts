import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPasswordComponent } from './set-password.component';
import { CommonService } from '../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { HttpModule } from '@angular/http';
import { UserTestService } from '../shared/services/test.user.service';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { mockedObservable } from '../models/testObservable';

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
        HttpModule,
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
});
