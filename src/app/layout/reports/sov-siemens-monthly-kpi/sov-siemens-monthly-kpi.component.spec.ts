import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SOVSiemensMonthlyKPIComponent } from './sov-siemens-monthly-kpi.component';
import { CommonModule } from '@angular/common';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

describe('SOVSiemensMonthlyKPIComponent', () => {
  let component: SOVSiemensMonthlyKPIComponent;
  let fixture: ComponentFixture<SOVSiemensMonthlyKPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
      ],
      declarations: [
        SOVSiemensMonthlyKPIComponent
      ],
      providers: [
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SOVSiemensMonthlyKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
