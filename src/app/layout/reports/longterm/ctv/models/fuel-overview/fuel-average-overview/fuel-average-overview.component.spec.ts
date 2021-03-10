import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelAverageOverviewComponent } from './fuel-average-overview.component';

describe('FuelAverageOverviewComponent', () => {
  let component: FuelAverageOverviewComponent;
  let fixture: ComponentFixture<FuelAverageOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelAverageOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelAverageOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
