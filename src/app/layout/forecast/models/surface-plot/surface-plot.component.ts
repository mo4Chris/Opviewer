import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { MatrixService } from '@app/supportModules/matrix.service';

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

  @Input() lineStyle: Partial<Plotly.ScatterLine> = {
    width: 1,
    color: 'black',
    dash: 'dash'
  }
  @Input() lines: PlotlyLineConfig[]; // Horizontal lines at given yHeight

  @Input() zMax?: number;
  @Input() title = 'Workability plot';
  @Input() useInterpolation = true;
  @Input() config: Partial<Plotly.Config> = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'zoomIn2d', 'zoomOut2d', 'lasso2d', 'select2d'],
    displaylogo: false
  }

  constructor(
    private calcService: CalculationService,
    private matService: MatrixService
  ) {
    // this.initTestData();
  }

  public loaded = false;
  public parsedData: Partial<Plotly.PlotData>[];
  public PlotLayout = {
    // General settings for the graph
    title: 'Test graph',
    // responsive: true,
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
      // zeroline: false,
      automargin: true,
      tick0: 0,
      dtick: 45,
    },
    margin: {
      t: 40,
      b: 40,
      l: 60,
      r: 40
    }
  };
  public get hasData() {
    return this.xData?.length > 0
      && this.yData?.length > 0
      && this.zData?.length > 1
      && this.zData?.[0]?.length > 1;
  }

  ngOnChanges() {
    if (!this.hasData) return;
    this.validateInput();
    this.parsedData = [<any> {
      x: this.xData,
      y: this.yData,
      z: this.matService.transpose(this.zData),
      type: 'contour',
      hoverinfo: 'x+y+z',
      zmin: 0,
      zmid: 80,
      zmax: this.zMax,
      colorscale: [[0, 'rgb(0,130,0)'], [0.25, 'rgb(130,255,0)'], [0.45, 'rgb(255,255,0)'], [0.65, 'rgb(255,130,0)'], [0.85, 'rgb(255,50,50)'], [1, 'rgb(220,0,0)']],
      colorbar: {
        tickvals: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax / 10) : undefined,
        ticktext: this.zMax ? this.calcService.linspace(0, this.zMax, this.zMax / 10).map(e => `${e}%`) : undefined,
      }
    }];
    if (this.lines) this.addLines();

    this.PlotLayout.xaxis.title = this.xLabel;
    this.PlotLayout.yaxis.title = this.yLabel;
    this.PlotLayout.title = this.title;
  }

  public onPlotlyInit(event) {
    this.loaded = true;
  }

  private validateInput() {
    const xLen = this.xData.length;
    const yLen = this.yData.length;
    assert(this.zData.length == xLen, `Length of xData should match zData.length, ${this.zData.length}/${xLen}`);
    this.zData.forEach((z, i) => {
      assert(z.length == yLen, `Length of yData should match zData[${i}].length, ${z.length}/${yLen}`);
    });
  }

  private addLines() {
    const yMax = Math.max(... this.yData)
    this.lines.forEach(_line => {
      switch(_line.Mode){
        case 'Horizontal':
          this.parsedData.push({
            x: [this.xData[0], this.xData[this.xData.length-1]],
            y: [_line.Value, _line.Value],
            type: 'scatter',
            mode: 'text+lines',
            hoverinfo: 'skip',
            name: _line.Name,
            line: this.lineStyle,
            text: [_line.Name, ''],
            textposition: (_line.Value>yMax/2) ? 'bottom right' : 'top right'
          })
      }
    })
  }
}

function assert(condition: boolean, message= 'assertion failed') {
  if (!condition) {
    throw(new Error(message));
  }
}

export interface PlotlyLineConfig {
  Value: number,
  Mode: 'Horizontal',
  Name: string
}
