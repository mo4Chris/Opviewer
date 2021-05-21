import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Observable, Subscriber, TeardownLogic } from 'rxjs';

@Component({
  selector: 'app-vessel-location-indicator',
  templateUrl: './vessel-location-indicator.component.html',
  styleUrls: ['./vessel-location-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselLocationIndicatorComponent implements OnInit, OnChanges {
  @Input() Length = 70;
  @Input() Width = 20;
  @Input() Height = 10;
  @Input() xLabel = 'X (m)';
  @Input() yLabel = 'Y (m)';
  @Input() zLabel = 'z (m)';
  @Input() X = 1;
  @Input() Y = 2;
  @Input() Z = 3;

  public loaded = false;
  public plotData: Partial<Plotly.PlotData>[] = [{
    mode: 'markers',
    type: 'scatter3d',
    x: [this.X],
    y: [this.Y],
    z: [this.Z],
    marker: { size: 12 },
    name: 'Point of interest'
  }];
  public plotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    title: 'Indication for point of interest',
    scene: {
      aspectmode: 'data',
      camera: {
        center: {
          x: 0.2, y: 0, z: 0,
        },
        eye: {x: 1.5, y: 1.5, z: 1.5},
        up: {x: 0, y: 0, z: 1},
      },
      xaxis: {
        fixedrange: true,
        visible: false
      },
      yaxis: {
        fixedrange: true,
        visible: false
      },
      zaxis: {
        fixedrange: true,
        visible: false
      }
    },
    xaxis: {

      mirror: true,
    },
    hovermode: false,
    shapes: [
      makeLine(0, 1, 0, 0),
      makeLine(1, 1, 0, 1),
      makeLine(1, 0, 1, 1),
      makeLine(0, 0, 0, 1),
    ]
  };
  public plotConfig = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'autoScale3d', 'toggleSpikelines', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'resetCameraLastSave3d', 'hoverClosest3d', 'orbitRotation', 'tableRotation'],
    displaylogo: false
  }
  private VesselTrace: Plotly.PlotData;
  private hull: Observable<Hull> = new Observable(obs => {this.initNodes(obs)});

  public get hasData() {
    const valid = isValidNumber(this.Length, 0, 1000)
    && isValidNumber(this.Width, 0, 1000)
    && isValidNumber(this.Height, 0, 1000)
    && isValidNumber(this.X, 0, this.Length)
    && isValidNumber(this.Y, -this.Width, this.Width)
    && isValidNumber(this.Z, 0, this.Length);
    return valid;
  }

  constructor(
    private http: HttpClient,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // this.initNodes();
  }
  async ngOnChanges(change: SimpleChanges) {
    if (change && (change['Length'] ||  change['Height'] ||  change['Width'])) {
       await this.setVesselTrace();
    }
    if (this.hasData) {
      this.plotData = [{
        mode: 'markers',
        type: 'scatter3d',
        x: [this.X],
        y: [this.Y],
        z: [this.Z],
        marker: { size: 12 },
        name: 'Point of interest'
      }, this.VesselTrace];
      this.ref.detectChanges();
    }
  }

  async setVesselTrace() {
    const hull = await this.hull.toPromise();
    let scaleX = this.Length / (Math.max(...hull.x) - Math.min(...hull.x));
    let scaleY = this.Width / (Math.max(...hull.y) - Math.min(...hull.y));
    let scaleZ = this.Height / (5);
    if (isNaN(scaleX)) scaleX = 1;
    if (isNaN(scaleY)) scaleY = 1;
    if (isNaN(scaleZ)) scaleZ = 1;
    this.VesselTrace = <any> {
      opacity: 0.6,
      type: 'mesh3d',
      name: 'Vessel outline',
      showlegend: true,
      x: hull.x.map(_x => scaleX * _x),
      y: hull.y.map(_y => scaleY * _y),
      z: hull.z.map(_z => scaleZ * _z),
      i: hull.i,
      j: hull.j,
      k: hull.k,
      color: 'gray',
      contour: {
        show: true
      }
    };
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }

  private async initNodes(obs: Subscriber<Hull>) {
    const nodes = <number[][]> await this.http.get('assets/models/hull_pts.json').toPromise();
    const triags = <number[][]> await this.http.get('assets/models/hull_triags.json').toPromise();
    obs.next({
      x: nodes[0],
      y: nodes[1],
      z: nodes[2],
      i: triags.map(_n => _n[0]-1),
      j: triags.map(_n => _n[1]-1),
      k: triags.map(_n => _n[2]-1)
    });
    obs.complete()
  }
}

function isValidNumber(num: number, min?: number, max?: number) {
  if (typeof num != 'number' || isNaN(num)) return false;
  if (min != null && num < min) return false;
  if (max != null && num > max) return false;
  return true;
}
function makeLine(x0: number, x1: number, y0: number, y1: number): Partial<Plotly.Shape> {
  return {
    type: 'line',
    xref: 'paper',
    x0,
    x1,
    y0,
    y1,
    line: {
      width: 1
    }
  }
}

interface Hull {
  x: number[],
  y: number[],
  z: number[],
  i: number[],
  j: number[],
  k: number[]
}
