import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { PlotlyModule } from 'angular-plotly.js';

import { VesselLocationIndicatorComponent } from './vessel-location-indicator.component';

describe('VesselLocationIndicatorComponent', () => {
  let component: VesselLocationIndicatorComponent;
  let fixture: ComponentFixture<VesselLocationIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PlotlyModule,
        SupportModelModule,
      ],
      declarations: [ VesselLocationIndicatorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselLocationIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should draw a vessel when coordinates are zero', () => {
    component.X = 0;
    component.Y = 0;
    component.Z = 0;
    expect(component.hasData).toBeTruthy();
    const change: any = {Length: <any> 1};
    component.ngOnChanges(change);
    expect(component['VesselTrace']).toBeTruthy();
  });
});
