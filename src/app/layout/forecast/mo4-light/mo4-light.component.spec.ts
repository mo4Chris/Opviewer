import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockComponents } from 'ng-mocks';
import { ForecastOpsPickerComponent } from '../forecast-ops-picker/forecast-ops-picker.component';
import { ForecastWorkabilityComponent } from '../mo4test/forecast-workability/forecast-workability.component';
import { HeadingPickerComponent } from '../models/heading-picker/heading-picker.component';
import { SurfacePlotComponent } from '../models/surface-plot/surface-plot.component';

import { Mo4LightComponent } from './mo4-light.component';

describe('Mo4LightComponent', () => {
  let component: Mo4LightComponent;
  let fixture: ComponentFixture<Mo4LightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Mo4LightComponent,
        MockComponents(
          ForecastOpsPickerComponent,
          HeadingPickerComponent,
          SurfacePlotComponent,
          ForecastWorkabilityComponent,
        )
      ],
      imports: [
        CommonModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4LightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
