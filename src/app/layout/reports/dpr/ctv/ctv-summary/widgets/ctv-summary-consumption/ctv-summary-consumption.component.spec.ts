import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvSummaryConsumptionComponent } from './ctv-summary-consumption.component';

describe('CtvSummaryConsumptionComponent', () => {
  let component: CtvSummaryConsumptionComponent;
  let fixture: ComponentFixture<CtvSummaryConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CtvSummaryConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvSummaryConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
