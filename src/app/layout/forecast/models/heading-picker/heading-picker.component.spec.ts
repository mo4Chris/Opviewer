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
    fixture.detectChanges();
    expect(component).toBeTruthy();
    let canvas = fixture.nativeElement.querySelector('plotly-plot');
    expect(canvas).toBeTruthy(); // Note: ploty itself is mocked!
  });

  it('should trigger plot redraw on confirm', () => {
    let spy = spyOn(component, 'updatePolarPlot')
    let select = fixture.nativeElement.querySelector('button');
    select.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  })

  it('should emit on change', async(() => {
    let emitter = spyOn(component.headingChange, 'emit');
    component.heading = 234;
    fixture.detectChanges();
    component.ngOnChanges();

    let select = fixture.nativeElement.querySelector('button');
    select.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(emitter).toHaveBeenCalled();
  }))
});
