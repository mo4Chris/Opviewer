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
    height: 500,
    width: 700,
    style: { margin: 'auto' },
    center: true,
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
  };

  ngOnChanges() {
    this.validateInput();
    this.parsedData = [{
      x: this.xData,
      y: this.yData,
      z: this.zData,
      type: 'contour',
      zmin: 0,
      zmid: 80,
      zmax: this.zMax,
      colorbar: {
        tickvals: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax/10) : undefined,
        ticktext: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax/10).map(e => `${e}%`) : undefined,
      }
    }];
    this.PlotLayout.xaxis.title = this.xLabel;
    this.PlotLayout.yaxis.title = this.yLabel;
    this.PlotLayout.title = this.title;
    console.log('Surface-plot onchanges')
    console.log(this.parsedData[0])
  }

  public onPlotlyInit(event) {
    console.log('Plotly is initialized')
    this.loaded = true;
  }

  validateInput() {
    const xLen = this.xData.length;
    const yLen = this.yData.length;
    assert(this.zData.length == yLen, 'Length of yData should match zData.length');
    this.zData.forEach((z, i) => {
      assert(z.length == xLen, `Length of xData should match zData[${i}].length`);
    })
  }

  initTestData() {
    // Should be removed prior to any PR
    this.zData = [];
    this.xData = this.calcService.linspace(5, 20);
    this.yData = this.calcService.linspace(0, 18, 2)
    this.yData.forEach(y => {
      let temp = this.xData.map(x => {
        return <number> x+y;
      })
      this.zData.push(temp)
    })
  }
}

function assert(condition: boolean, message="assertion failed") {
  if (!condition) {
    throw(new Error(message))
  }
}