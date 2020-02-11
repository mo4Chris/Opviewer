import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiemensKpiOverviewComponent } from './siemens-kpi-overview.component';

describe('SiemensKpiOverviewComponent', () => {
  let component: SiemensKpiOverviewComponent;
  let fixture: ComponentFixture<SiemensKpiOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiemensKpiOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiemensKpiOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
