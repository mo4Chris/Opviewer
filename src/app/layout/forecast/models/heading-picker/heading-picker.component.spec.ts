import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotComponent, PlotlyModule } from 'angular-plotly.js';
import { MockComponents } from 'ng-mocks';

import { HeadingPickerComponent } from './heading-picker.component';

describe('HeadingPickerComponent', () => {
  let component: HeadingPickerComponent;
  let fixture: ComponentFixture<HeadingPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        HeadingPickerComponent,
        MockComponents(
          PlotComponent
        )
      ],
      imports: [
        CommonModule,
        NgbModule,
        FormsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create w/out data', () => {
    component.ngOnChanges()
    expect(component).toBeTruthy();
  });

  it('should create with data', () => {
    component.heading = 100;
    component.ngOnChanges()
    expect(component).toBeTruthy();
  });

  it('should trigger plot redraw on confirm', () => {
    let spy = spyOn(component, 'updatePolarPlot')
    component.onConfirm()
    expect(spy).toHaveBeenCalled();
  })
});
