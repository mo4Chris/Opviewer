import { HttpClientModule } from '@angular/common/http';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { mockedObservable } from '@app/models/testObservable';
import { PlotlyModule } from 'angular-plotly.js';
import { VesselLocationIndicatorComponent } from './vessel-location-indicator.component';

const pts = require('assets/models/hull_pts.json')
const triags = require('assets/models/hull_pts.json')

describe('VesselLocationIndicatorComponent', () => {
  let component: VesselLocationIndicatorComponent;
  let fixture: ComponentFixture<VesselLocationIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PlotlyModule,
        SupportModelModule,
        HttpClientModule
      ],
      declarations: [ VesselLocationIndicatorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselLocationIndicatorComponent);
    component = fixture.componentInstance;
    spyOn(component['http'], 'get').and.returnValues(
      mockedObservable(pts),
      mockedObservable(triags)
    )
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(pts).toBeTruthy();
    expect(triags).toBeTruthy();
  });

  it('should draw a vessel when coordinates are zero', async () => {
    component.X = 0;
    component.Y = 0;
    component.Z = 0;
    expect(component.hasData).toBeTruthy();
    const change: any = {Length: <any> 1};
    await component.ngOnChanges(change);
    expect(component['VesselTrace']).toBeTruthy();
    expect(component.plotData).toBeTruthy();
  });
});
