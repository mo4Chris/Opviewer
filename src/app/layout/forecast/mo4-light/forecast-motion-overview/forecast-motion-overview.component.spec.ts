import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SupportModelModule } from '@app/models/support-model.module';
import { PlotComponent } from 'angular-plotly.js';
import { MockComponents } from 'ng-mocks';
import { Dof6Array } from '../../models/forecast-response.model';
import { SurfacePlotComponent } from '../../models/surface-plot/surface-plot.component';

import { ForecastMotionOverviewComponent } from './forecast-motion-overview.component';

describe('ForecastMotionOverviewComponent', () => {
  let component: ForecastMotionOverviewComponent;
  let fixture: ComponentFixture<ForecastMotionOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SupportModelModule,
        FormsModule,
      ],
      declarations: [
        ForecastMotionOverviewComponent,
        SurfacePlotComponent,
        MockComponents(
          PlotComponent
        ),
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastMotionOverviewComponent);
    component = fixture.componentInstance;
    return fixture.detectChanges();
  });

  it('should create empty', () => {
    expect(component).toBeTruthy();
    component.ngOnChanges();
  });

  it('should create with data', () => {
    component.time = linspace(737700, 737701, 24)
    component.headings = linspace(0, 360, 36)
    const data: Dof6Array = component.time.map(_ => {
      return component.headings.map(__ => {
        return [0, 1, 2, 3, 4, 5]
      })
    })
    component.response = {
      Acc: data,
      Disp: data,
      Vel: data,
    }
    component.startTime = 737700.2
    component.stopTime = 737700.4
    expect(component).toBeTruthy();
    component.ngOnChanges();
    expect(component).toBeTruthy();
  });
});

function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}
