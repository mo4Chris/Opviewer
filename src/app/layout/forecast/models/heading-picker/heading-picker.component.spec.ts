import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PlotComponent } from 'angular-plotly.js';
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

  it('should trigger plot redraw on update', () => {
    let spy = spyOn(component, 'updatePolarPlot')
    component.heading = 10;
    component.ngOnChanges();
    expect(spy).toHaveBeenCalled();
  })

  // it('should emit on change', async(() => {
  //   let emitter = spyOn(component.headingChange, 'emit');
  //   component.heading = 234;
  //   fixture.detectChanges();
  //   component.ngOnChanges();
  //   let select = fixture.nativeElement.querySelector('button');
  //   select.dispatchEvent(new Event('click'));
  //   fixture.detectChanges();
  //   expect(emitter).toHaveBeenCalled();
  // }))
});
