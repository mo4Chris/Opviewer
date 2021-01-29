import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';

@Component({
  selector: 'app-surface-plot',
  templateUrl: './surface-plot.component.html',
  styleUrls: ['./surface-plot.component.scss']
})
export class SurfacePlotComponent implements OnChanges {
  @Input() xLabel: string;
  @Input() yLabel: string;
  @Input() xData: (number | string | Date)[];
  @Input() yData: number[];
  @Input() zData: number[][];
  @Input() zMax?: number;
  @Input() title: string = 'Workability plot'
  @Input() useInterpolation = true;

  constructor(
    private calcService: CalculationService,
  ) {
    // this.initTestData();
  }

  public loaded = false;
  public parsedData: PlotlyJS.Data[];
  public PlotLayout = {
    // General settings for the graph
    title: 'Test graph',
    responsive: true,
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
    }
  };

  ngOnChanges() {
    if (this.xData && this.xData.length >0 && this.yData.length > 0) {
      this.validateInput()
      this.parsedData = [{
        x: this.xData,
        y: this.yData,
        z: this.zData,
        type: 'contour',
        zmin: 0,
        zmid: 80,
        zmax: this.zMax,
        colorscale: [[0, 'rgb(0,130,0)'], [0.25, 'rgb(130,255,0)'], [0.45, 'rgb(255,255,0)'], [0.65, 'rgb(255,130,0)'], [0.85, 'rgb(255,50,50)'], [1, 'rgb(220,0,0)']],
        colorbar: {
          tickvals: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax/10) : undefined,
          ticktext: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax/10).map(e => `${e}%`) : undefined,
        }
      }];
      this.PlotLayout.xaxis.title = this.xLabel;
      this.PlotLayout.yaxis.title = this.yLabel;
      this.PlotLayout.title = this.title;
    }
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }

  validateInput() {
    const xLen = this.xData.length;
    const yLen = this.yData.length;
    assert(this.zData.length == yLen, `Length of yData should match zData.length, ${this.zData.length}/${yLen}`);
    this.zData.forEach((z, i) => {
      assert(z.length == xLen, `Length of xData should match zData[${i}].length, ${z.length}/${xLen}`);
    })
  }
}

function assert(condition: boolean, message="assertion failed") {
  if (!condition) {
    throw(new Error(message))
  }
}