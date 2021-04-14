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

  // private Kmin = 0;
  // private Kmax = 3.4438;
  private Kmax = 28.9;

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
      title: 'Tx [1/s]',
      showgrid: false,
      zeroline: false,
    },
    yaxis: {
      visible: false,
      title: 'Ty [1/s]',
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
      xshift: 3,
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
      xshift: -5,
      font: { size: 20 }
    },
    this.makeCircleTextAnnotation(5, '5s'),
    this.makeCircleTextAnnotation(10, '10s'),
    this.makeCircleTextAnnotation(15, '15s'),
    this.makeCircleTextAnnotation(20, '20s'),
    this.makeCircleTextAnnotation(25, '25s'),
  ],
    shapes: [
      this.makeCircle(this.Kmax, {width: 5}),
      this.makeCircle(5, {width: 1, color: 'white'}),
      this.makeCircle(10, {width: 1, color: 'white'}),
      this.makeCircle(15, {width: 1, color: 'white'}),
      this.makeCircle(20, {width: 1, color: 'white'}),
      this.makeCircle(25, {width: 1, color: 'white'}),
      this.makeLine(0),
      this.makeLine(90),
    ],
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

  makeLine(angle, font = <any> {width: 1, color: "white"}) {
    const x0 = Math.cos(angle * Math.PI / 180) * this.Kmax;
    const y0 = Math.sin(angle * Math.PI / 180) * this.Kmax;
    console.log(x0, y0)
    const out = {
      type: <'line'> 'line',
      x0: -x0,
      x1: x0,
      y0: -y0,
      y1: y0,
      line: font
    }
    // type: 'line',
    // x0: -this.Kmax,
    // x1: this.Kmax,
    // y0: 0,
    // y1: 0,
    // line: { width: 1 },
    return out;
  }
  makeCircle(radius = this.Kmax, font = <any> {width: 5, color: "black"}) {
    const out = {
      type: <'circle'> 'circle',
      x0: -radius,
      x1: radius,
      y0: -radius,
      y1: radius,
      line: font
    }
    return out;
  }

  makeCircleTextAnnotation(value = 5, txt = '5s') {
    return {
      text: txt,
      showarrow: false,
      x: 0,
      y: -value,
      xanchor: <any> 'left',
      yanchor: <any> 'top',
      font: <any> {
        color: "white",
        size: 8,
      }
    }
  }
}
