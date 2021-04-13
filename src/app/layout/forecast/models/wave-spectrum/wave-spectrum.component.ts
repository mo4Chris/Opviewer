import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';


@Component({
  selector: 'app-wave-spectrum',
  templateUrl: './wave-spectrum.component.html',
  styleUrls: ['./wave-spectrum.component.scss']
})
export class SovWaveSpectrumComponent implements OnChanges {
  @Input() k_x: number[];
  @Input() k_y: number[];
  @Input() spectrum: number[][][];

  private Kmin = 0;
  private Kmax = 3.4438;

  public parsedData: Plotly.Data[];
  public spectrumIndex = 1;
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    showlegend: false,
    height: 600,
    width: 600,
    style: { margin: 'auto' },
    center: true,
    xaxis: {
      visible: false,
      title: 'Kx [rad/m]',
      showgrid: false,
      zeroline: false,
    },
    yaxis: {
      visible: false,
      title: 'Ky [rad/m]',
      showgrid: false,
      zeroline: false,
    },
    margin: {
      l: 40,
      r: 20,
      b: 0,
      t: 0,
      pad: 4
    },
    polar: {
      radialaxis: {
        visible: false
      },
      angularaxis: {
        tickmode: 'array',
        tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
        ticktext: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        direction: 'clockwise',
        tickfont: {
          size: 11
        }
      } as any
    },
    annotations: [{
      text: 'N',
      showarrow: false,
      x: 0,
      y: this.Kmax,
      yanchor: 'bottom',
      font: { size: 20 }
    }, {
      text: 'E',
      showarrow: false,
      x: this.Kmax,
      y: 0,
      xanchor: 'left',
      font: { size: 20 }
    }, {
      text: 'S',
      showarrow: false,
      x: 0,
      y: -this.Kmax,
      yanchor: 'top',
      font: { size: 20 }
    }, {
      text: 'W',
      showarrow: false,
      x: - this.Kmax,
      y: 0,
      xanchor: 'right',
      font: { size: 20 }
    }, {
      text: '', // Assigned later
      showarrow: false,
      x: this.Kmax,
      y: -this.Kmax,
      // textangle: 90,
      xanchor: 'right',
      yanchor: 'top',
      name: 'source'
    }],
    shapes: [{
      type: 'circle',
      x0: -this.Kmax,
      x1: this.Kmax,
      y0: -this.Kmax,
      y1: this.Kmax,
      line: { width: 5 },
    }, {
      type: 'line',
      x0: 0,
      x1: 0,
      y0: -this.Kmax,
      y1: this.Kmax,
      line: { width: 1 },
    }, {
      type: 'line',
      x0: -this.Kmax,
      x1: this.Kmax,
      y0: 0,
      y1: 0,
      line: { width: 1 },
    }],
  };


  constructor(
    private calcService: CalculationService,
    private matService: MatrixService,
  ) {
  }

  ngOnChanges(): void {
    console.log(this)
    this.loaded = false;
    if (this.k_x == null) return
    this.switchIndex();
    this.loaded = true;
  }

  switchIndex() {
    const index = this.spectrumIndex-1 || 0;
    const delta = (this.k_x[1] - this.k_x[0]) / 2;
    const k = this.calcService.linspace(this.k_x[0], this.k_x[this.k_x.length-1], delta)
    const x = this.calcService.interp1(this.k_x, this.k_y, k)
    const y = this.calcService.interp1(this.k_y, this.k_y, k)
    const z = this.calcService.interp2(this.k_x, this.k_y, this.spectrum[index], k, k).map(zz => zz.map(z => Math.log(1 + z)));
    const R2 = this.Kmax ** 2;

    x.forEach((_x, ix) => {
      y.forEach((_y, iy) => {
        const r = _x**2 + _y**2;
        if (r > R2) {
          z[ix][iy] = null;
        }
      })
    })

    this.parsedData = <any> [{
      type: 'heatmap',
      x,
      y,
      z,
      showscale: false,
      // colorbar: {
      //   nticks: 5,
      //   // tickmode: 'Array',
      //   // tickvals: this.calcService.linspace(0, 1000, 100),
      //   // ticktext: ['No waves', 'Some energy', 'High energy']
      //   title: {
      //     text: 'Energy density',
      //     titleside: 'Right',
      //   }
      // },
      hoverinfo: 'skip',
      zsmooth: 'fast',
      connectgaps: false,
    }];
  }

  onPlotlyInit() {

  }

}
