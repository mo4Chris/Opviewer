import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { CalculationService } from '@app/supportModules/calculation.service';
import { PlotlyModule } from 'angular-plotly.js';

import { SurfacePlotComponent } from './surface-plot.component';

describe('SurfacePlotComponent', () => {
  let component: SurfacePlotComponent;
  let fixture: ComponentFixture<SurfacePlotComponent>;
  let calc = new CalculationService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SurfacePlotComponent
      ],
      imports: [
        PlotlyModule,
        SupportModelModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurfacePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create w/out data', () => {
    component.xData   = [];
    component.yData   = [];
    component.zData   = [];
    component.xLabel  = 'test_label_x'
    component.yLabel  = 'test_label_y'
    component.title   = 'Test title'
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.parsedData).not.toBeTruthy();
    component.zData = [[]]
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.parsedData).not.toBeTruthy();
  })

  it('should create with data', () => {
    component.xData   = calc.linspace(737000, 737001, 1/10).map(t => datenumToDate(t));
    component.yData   = calc.linspace(0, 40, 10);
    component.zData   = calc.linspace(0, 200, 50).map(e => calc.linspace(e, 200+e, 20));
    component.xLabel  = 'test_label_x'
    component.yLabel  = 'test_label_y'
    component.title   = 'Test title'
    component.ngOnChanges();
    component.onPlotlyInit(null); // Cant wait for the async callback :(
    fixture.detectChanges();
    const layout = component.PlotLayout;
    expect(component).toBeTruthy();
    expect(component.loaded).toBe(true);
    expect(component.parsedData).toBeTruthy();
    expect(component.parsedData.length).toEqual(1);
    expect(component.parsedData.length).toEqual(1);
    expect(layout.xaxis.title).toBe(component.xLabel)
    expect(layout.yaxis.title).toBe(component.yLabel)
    expect(layout.yaxis.title).toBe(component.yLabel)
  })
});

function datenumToDate(serial: number) {
  const time_info = new Date((serial - 719529) * 864e5);
  return time_info;
}


// function initTestData() {
//   // Should be removed prior to any PR
//   this.zData = [];
//   this.xData = this.calcService.linspace(5, 20);
//   this.yData = this.calcService.linspace(0, 18, 2)
//   this.yData.forEach(y => {
//     let temp = this.xData.map(x => {
//       return <number> x+y;
//     })
//     this.zData.push(temp)
//   })
// }