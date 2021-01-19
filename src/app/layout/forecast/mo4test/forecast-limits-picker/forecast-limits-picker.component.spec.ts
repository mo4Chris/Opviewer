import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastLimitsPickerComponent } from './forecast-limits-picker.component';

describe('ForecastLimitsPickerComponent', () => {
  let component: ForecastLimitsPickerComponent;
  let fixture: ComponentFixture<ForecastLimitsPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastLimitsPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastLimitsPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
