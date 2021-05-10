import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { CommonService } from '../../common.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsersRoutingModule } from './users-routing.module';
import { UserTestService } from '../../shared/services/test.user.service';
import { mockedObservable } from '../../models/testObservable';
import { UserService } from '../../shared/services/user.service';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
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

  beforeEach(async(() => {
    spyOn(CommonService.prototype, 'checkUserActive').and.returnValue(mockedObservable(true));
    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    spyOn(CommonService.prototype, 'getUsers').and.returnValue(mockedObservable([]));
    spyOn(CommonService.prototype, 'getUsersForCompany').and.returnValue(mockedObservable([]));

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
