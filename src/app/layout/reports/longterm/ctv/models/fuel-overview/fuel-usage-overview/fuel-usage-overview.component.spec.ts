import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelUsageOverviewComponent } from './fuel-usage-overview.component';

describe('FuelUsageOverviewComponent', () => {
  let component: FuelUsageOverviewComponent;
  let fixture: ComponentFixture<FuelUsageOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelUsageOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelUsageOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
