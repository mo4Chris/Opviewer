import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CtvSummaryConsumptionComponent } from "./ctv-summary-consumption.component";

describe("CtvSummaryConsumptionComponent", () => {
  let component: CtvSummaryConsumptionComponent;
  let fixture: ComponentFixture<CtvSummaryConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CtvSummaryConsumptionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvSummaryConsumptionComponent);
    component = fixture.componentInstance;
    component.data = {
      fuel: {
        startOfDay: 5,
        used: 4,
        bunkered: 3,
        remainingOnBoard: 4,
      },
      water: {
        startOfDay: 5,
        used: 4,
        bunkered: 3,
        remainingOnBoard: 4,
      },
      shorePower: {
        startOfDay: 5,
        used: 4,
        bunkered: 3,
        remainingOnBoard: 4,
      },
    };
    component.date = 737669;
    component.mmsi = 123456789;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
