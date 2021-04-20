import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { CalculationService } from '@app/supportModules/calculation.service';
import { PlotlyModule } from 'angular-plotly.js';
import { SurfacePlotComponent } from './surface-plot.component';

describe('SurfacePlotComponent', () => {
  let component: SurfacePlotComponent;
  let fixture: ComponentFixture<SurfacePlotComponent>;
  const calc = new CalculationService();

  beforeEach(waitForAsync(() => {
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

  it('should create w/out data', async () => {
    component.xData   = [];
    component.yData   = [];
    component.zData   = [];
    component.xLabel  = 'test_label_x';
    component.yLabel  = 'test_label_y';
    component.title   = 'Test title';
    component.ngOnChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.parsedData).not.toBeTruthy();
    component.zData = [[]];
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.parsedData).not.toBeTruthy();
  });

  it('should create with data', async () => {
    component.xData   = calc.linspace(737000, 737001, 1 / 10).map(t => datenumToDate(t));
    component.yData   = calc.linspace(0, 40, 10);
    component.zData   = calc.linspace(0, 200, 50).map(e => calc.linspace(e, 200 + e, 20));
    component.xLabel  = 'test_label_x';
    component.yLabel  = 'test_label_y';
    component.title   = 'Test title';
    component.ngOnChanges();
    await fixture.whenStable();
    const layout = component.PlotLayout;
    expect(component).toBeTruthy();
    expect(component.loaded).toBe(true);
    expect(component.parsedData).toBeTruthy();
    expect(component.parsedData.length).toEqual(1);
    expect(component.parsedData.length).toEqual(1);
    expect(layout.xaxis.title['text']).toBe(component.xLabel);
    expect(layout.yaxis.title['text']).toBe(component.yLabel);
    expect(layout.yaxis.title['text']).toBe(component.yLabel);
  });

  it('should render a graph', async () => {
    component.xData   = calc.linspace(737000, 737001, 1 / 10).map(t => datenumToDate(t));
    component.yData   = calc.linspace(0, 40, 10);
    component.zData   = calc.linspace(0, 200, 50).map(e => calc.linspace(e, 200 + e, 20));
    component.xLabel  = 'test_label_x';
    component.yLabel  = 'test_label_y';
    component.title   = 'Test title';

    component.ngOnChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement;
    const svg = el.querySelector('svg');
    expect(svg).toBeTruthy();
  });
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
