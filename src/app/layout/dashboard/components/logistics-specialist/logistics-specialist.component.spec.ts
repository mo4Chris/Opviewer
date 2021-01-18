import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticsSpecialistComponent } from './logistics-specialist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { UserTestService } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

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