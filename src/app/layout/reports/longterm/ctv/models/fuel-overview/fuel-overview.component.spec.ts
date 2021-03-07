import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelOverviewComponent } from './fuel-overview.component';

describe('FuelOverviewComponent', () => {
  let component: FuelOverviewComponent;
  let fixture: ComponentFixture<FuelOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
