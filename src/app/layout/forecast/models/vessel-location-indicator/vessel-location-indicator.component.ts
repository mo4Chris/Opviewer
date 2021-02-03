import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Plotly from 'plotly.js'

@Component({
  selector: 'app-vessel-location-indicator',
  templateUrl: './vessel-location-indicator.component.html',
  styleUrls: ['./vessel-location-indicator.component.scss']
})
export class VesselLocationIndicatorComponent implements OnInit {
  @Input() Length = 20;
  @Input() Width = 10;
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
    title: 'Test graph',
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    },
    scene: {
      aspectmode: "data"
    }
  };
  private VesselTrace: Plotly.Data;

  constructor(
    private calcService: CalculationService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(change: SimpleChange) {
    // if (change && (change['Length'] ||  change['Height'] ||  change['Width'])) {
    // }
    this.calcVesselTrace();
    if (this.X && this.Y && this.Z) {
      console.log('Setting plot data')
      this.plotData = [{
        mode: 'markers',
        type: 'scatter3d',
        x: [this.X],
        y: [this.Y],
        z: [this.Z],
        marker: { size: 12 },
        name: 'Point of interest'
      }, this.VesselTrace];
      // }]
      this.plotLayout.xaxis.title = this.xLabel;
      this.plotLayout.yaxis.title = this.yLabel;
      console.log(this.plotData)
    }
  }

  calcVesselTrace() {
    this.VesselTrace = {
      x: [0, 10, 14, 10,  0, 0, 0, 10, 14, 10,  0, 0],
      y: [5,  5,  0, -5, -5, 5, 5,  5,  0, -5, -5, 5],
      z: [1,  1,  1,  1,  1, 1, 2,  2,  2,  2,  2, 2],
      // x: [0, 0, 1, 1, 0, 0, 1, 1],
      // y: [0, 1, 1, 0, 0, 1, 1, 0],
      // z: [0, 0, 0, 0, 1, 1, 1, 1],
      // x: [0, 1, 2, 0, 0],
      // y: [0, 0, 1, 2, 0],
      // z: [0, 2, 0, 1, 0],
      opacity: 0.5,
      type: 'mesh3d',
      name: 'Vessel outline'
    }
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }
}
