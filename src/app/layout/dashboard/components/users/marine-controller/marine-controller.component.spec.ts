import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineControllerComponent } from './marine-controller.component';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { CommonService } from '../../../../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '../../../../../supportModules/mocked.common.service';
import { UserTestService } from '../../../../../shared/services/test.user.service';

describe('Dashboard MarineController Component', () => {
  let component: MarineControllerComponent;
  let fixture: ComponentFixture<MarineControllerComponent>;
  const token = UserTestService.getMockedAccessToken({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarineControllerComponent ],
      imports: [
        HttpModule,
        RouterTestingModule,
        NgbModule,
      ],
      providers: [
        MockedCommonServiceProvider
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
