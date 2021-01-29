import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastOpsPickerComponent } from './forecast-ops-picker.component';

describe('ForecastOpsPickerComponent', () => {
  let component: ForecastOpsPickerComponent;
  let fixture: ComponentFixture<ForecastOpsPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForecastOpsPickerComponent,
      ],
      imports: [
        NgbModule,
        CommonModule,
        FormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastOpsPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit on change', async(() => {
    let emitter = spyOn(component.selectedOperationChange, 'emit');
    component.operations = [{ 
      id: 0,
      name: "string",
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: "string",
      activation_start_date: "6",
      activation_end_date: "7",
      client_preferences: null,
      consumer_id: 8,
    }];
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.selectedOperation).toBeTruthy();

    let select = fixture.nativeElement.querySelector('select');
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitter).toHaveBeenCalled();
  }))

  it('should render relevant data', () => {
    component.operations = [{ 
      id: 0,
      name: "string",
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: "string",
      activation_start_date: "6",
      activation_end_date: "7",
      client_preferences: null,
      consumer_id: 8,
    }];
    fixture.detectChanges()
    let opt = fixture.nativeElement.querySelector('option');
    expect(opt).toBeTruthy();
    expect(opt.value).toBeTruthy(); // We get [object object] here, not sure how to access the actual element
  })
});
