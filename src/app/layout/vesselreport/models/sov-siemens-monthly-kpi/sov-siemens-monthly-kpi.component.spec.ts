import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SOVSiemensMonthlyKPIComponent } from './sov-siemens-monthly-kpi.component';

describe('SOVSiemensMonthlyKPIComponent', () => {
  let component: SOVSiemensMonthlyKPIComponent;
  let fixture: ComponentFixture<SOVSiemensMonthlyKPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SOVSiemensMonthlyKPIComponent ]
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
