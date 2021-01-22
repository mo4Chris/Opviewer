import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ForecastLimitsPickerComponent } from './forecast-limits-picker.component';

describe('ForecastLimitsPickerComponent', () => {
  let component: ForecastLimitsPickerComponent;
  let fixture: ComponentFixture<ForecastLimitsPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastLimitsPickerComponent ],
      imports:[
        CommonModule,
        NgbModule,
        FormsModule,
      ]
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
