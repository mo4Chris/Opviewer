import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Plotly from 'plotly.js'

@Component({
  selector: 'app-vessel-location-indicator',
  templateUrl: './vessel-location-indicator.component.html',
  styleUrls: ['./vessel-location-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselLocationIndicatorComponent implements OnChanges {
  @Input() Length = 70;
  @Input() Width = 20;
  @Input() Height = 10;
  @Input() xLabel = 'X (m)';
  @Input() yLabel = 'Y (m)';
  @Input() zLabel = 'z (m)';
  @Input() X: number = 1;
  @Input() Y: number = 2;
  @Input() Z: number = 3;

  public loaded = false;
  public plotData: Plotly.Data[];
  public plotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    title: 'Indication for point of interest',
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    },
    scene: {
      aspectmode: "data",
      camera: {
        center: {
          x: 0.2, y: 0, z: 0,
        },
        eye: {x: 1.5, y: 1.5, z: 1.5},
        up: {x: 0, y: 0, z: 1},
      }
    },
  };
  private VesselTrace: Plotly.Data;

  public get hasData() {
    const valid = isValidNumber(this.Length, 0, 1000)
    && isValidNumber(this.Width, 0, 1000)
    && isValidNumber(this.Height, 0, 1000)
    && isValidNumber(this.X, 0, this.Length)
    && isValidNumber(this.Y, -this.Width, this.Width)
    && isValidNumber(this.Z, 0, this.Length)
    return valid;
  }

  constructor(
    private calcService: CalculationService,
  ) { }

  ngOnChanges(change: SimpleChanges) {
    if (change && (change['Length'] ||  change['Height'] ||  change['Width'])) {
      this.calcVesselTrace();
    }
    if (this.X && this.Y && this.Z) {
      this.plotData = [{
        mode: 'markers',
        type: 'scatter3d',
        x: [this.X],
        y: [this.Y],
        z: [this.Z],
        marker: { size: 12 },
        name: 'Point of interest'
      }, this.VesselTrace];
      this.plotLayout.xaxis.title = this.xLabel;
      this.plotLayout.yaxis.title = this.yLabel;
    }
  }

  calcVesselTrace() {
    let x = [0, 0.7, 0.9, 0.7,  0, 0, 0, 0.7, 1, 0.7,  0, 0.7];
    let y = [1,   1,   0,  -1, -1, 1, 1,   1, 0,  -1, -1,   0];
    let z = [0,   0, 0.2,   0,  0, 0, 1,   1, 1,   1,  1,   0];
    this.VesselTrace = <any> {
      // text: this.calcService.linspace(0, x.length).map(e=> 'Node ' + e.toString()),
      opacity: 0.5,
      type: 'mesh3d',
      name: 'Vessel outline',
      showlegend: true,

      x: x.map(elt => elt * this.Length),
      y: y.map(elt => elt * this.Width / 2),
      z: z.map(elt => elt * this.Height),
      i: [ 0, 1, 11, 11, 4, 5, 1, 1,  6,  4, 4, 2, 2, 2, 7, 7, 10],
      j: [ 1, 2,  3,  4, 5, 6, 5, 2, 10,  9, 9, 3, 8, 8, 8, 9,  6],
      k: [11, 3,  4,  5, 6, 7, 7, 7,  4, 10, 3, 9, 9, 7, 9, 6,  9],
      color: "gray",
    }
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }
}

function isValidNumber(num: number, min?: number, max?: number) {
  let tf = typeof num == 'number';
  if (min) {
    tf = tf && num >= 0;
  }
  if (max) {
    tf = tf && num <= max;
  }
  return tf;
}