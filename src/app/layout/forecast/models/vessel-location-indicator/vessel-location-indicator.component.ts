import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Plotly from 'plotly.js/dist/plotly.js';

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
  public plotLayout = {
    // General settings for the graph
    title: 'Test graph',
    xaxis: {
      visible: true,
      title: 'xLabel',
      showgrid: false,
      zeroline: false,
    },
    yaxis: {
      visible: true,
      title: 'yLabel',
      showgrid: false,
      zeroline: false,
    },
    // margin: {
    //   l: 40,
    //   r: 20,
    //   b: 0,
    //   t: 0,
    //   pad: 4
    // },
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
      x: [0, 10, 14, 10, 0, 0],
      y: [5, 5, 0, -5, -5, 5],
      z: [0, 0, 0, 0, 0, 0],
      mode: 'lines',
      type: 'scatter3d',
      name: 'Vessel outline'
    }
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }
}
