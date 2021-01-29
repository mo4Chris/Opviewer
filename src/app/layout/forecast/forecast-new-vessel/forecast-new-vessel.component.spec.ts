import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastNewVesselComponent } from './forecast-new-vessel.component';

describe('ForecastNewVesselComponent', () => {
  let component: ForecastNewVesselComponent;
  let fixture: ComponentFixture<ForecastNewVesselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastNewVesselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastNewVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
