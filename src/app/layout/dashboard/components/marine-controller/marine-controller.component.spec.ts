import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MarineControllerComponent } from './marine-controller.component';

describe('Dashboard MarineController Component', () => {
  let component: MarineControllerComponent;
  let fixture: ComponentFixture<MarineControllerComponent>;
  const token = UserTestService.getMockedAccessToken({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarineControllerComponent ],
      imports: [
        HttpClientModule,
        NgbModule,
        RouterTestingModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(MarineControllerComponent);
    component = fixture.componentInstance;
    component.tokenInfo = token;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
