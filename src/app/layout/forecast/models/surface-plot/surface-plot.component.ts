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
  @Input() yLabels: string;
  @Input() xData: (number | Date)[];
  @Input() yData: number[];
  @Input() zData: number[][];
  @Input() title: string = 'Workability plot'
  @Input() useInterpolation = true;

  constructor(
    private calcService: CalculationService,
  ) {
    this.initTestData();
  }

  public loaded = false;
  public parsedData: PlotlyJS.Data[];
  public PlotLayout = {
    // General settings for the graph
    title: 'Test graph',
    height: 500,
    width: 600,
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
    }
  };

  ngOnChanges() {
    this.validateInput();
    this.parsedData = [{
      x: this.xData,
      y: this.yData,
      z: this.zData,
      type: 'contour',
    }];
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
    assert(this.zData.length == yLen);
    this.zData.forEach(z => {
      assert(z.length == xLen)
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