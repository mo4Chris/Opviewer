import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsSpecialistComponent } from './logistics-specialist.component';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider, MockedCommonService } from '../../../../../supportModules/mocked.common.service';
import { UserTestService } from '../../../../../shared/services/test.user.service';
import { CommonModule } from '@angular/common';

describe('Dashboard logistic specialist', () => {
  let component: LogisticsSpecialistComponent;
  let fixture: ComponentFixture<LogisticsSpecialistComponent>;
  const token = UserTestService.getMockedAccessToken({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogisticsSpecialistComponent ],
      imports: [
        CommonModule,
        RouterTestingModule,
        NgbModule,
      ],
      providers: [MockedCommonServiceProvider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogisticsSpecialistComponent);
    component = fixture.componentInstance;
    component.tokenInfo = token;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
