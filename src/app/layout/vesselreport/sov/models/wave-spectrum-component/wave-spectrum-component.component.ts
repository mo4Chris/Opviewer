import { Component, OnInit, Input } from '@angular/core';
import { SovWaveSpectum } from '../../sovreport/sovreport.component';
import { CalculationService } from '../../../../../supportModules/calculation.service';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import * as colormap from 'colormap';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';

@Component({
  selector: 'app-wave-spectrum-component',
  templateUrl: './wave-spectrum-component.component.html',
  styleUrls: ['./wave-spectrum-component.component.scss']
})
export class WaveSpectrumComponentComponent implements OnInit {
  @Input() WaveSpectrum: SovWaveSpectum;
  chart;
  data: PlotlyJS.Data[] = [];
  frames: PlotlyJS.Frame[] = [];
  loaded = true;

  useInterpolation = true;
  Kmax = 2.096;
  Kmin = 0.127

  plotLayout = {
    // General settings for the graph
    height: 600,
    width: 600,
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
    // All the annotations for the plot go here (ie. the north east south west signs)
    annotations: [{
      text: 'N',
      showarrow: false,
      x: 0,
      y: this.Kmax,
      yanchor: 'bottom',
      font: {size: 20}
    },{
      text: 'E',
      showarrow: false,
      x: this.Kmax,
      y: 0,
      xanchor: 'left',
      font: {size: 20}
    },{
      text: 'S',
      showarrow: false,
      x: 0,
      y: -this.Kmax,
      yanchor: 'top',
      font: {size: 20}
    },{
      text: 'W',
      showarrow: false,
      x: - this.Kmax,
      y: 0,
      xanchor: 'right',
      font: {size: 20}
    }],
    // Supportings shapes (ie. outer edge to hide the interpolation) go here
    shapes: [{
      type: 'circle',
      x0: -this.Kmax,
      x1: this.Kmax,
      y0: -this.Kmax,
      y1: this.Kmax,
      line: {width: 3},
    },{
      type: 'circle',
      x0: -this.Kmin,
      x1: this.Kmin,
      y0: -this.Kmin,
      y1: this.Kmin,
      fillcolor: "rgba(0,0,0,1)",
    },{
      type: 'line',
      x0: 0,
      x1: 0,
      y0: -this.Kmax,
      y1: this.Kmax,
      line: {width: 1},
    },{
      type: 'line',
      x0: -this.Kmax,
      x1: this.Kmax,
      y0: 0,
      y1: 0,
      line: {width: 1},
    }],
    // Add images, menus or sliders if desired (eg. a ship in the middle?)
    // images: [],
    // updatemenus: [],
    // sliders:[],
  };

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService
  ) { }

  ngOnInit() {
    console.log('On init:');
    console.log(this.WaveSpectrum);

    const N = this.WaveSpectrum.spectrum[0].length;
    const step = 2 * this.Kmax / (N - 1);
    const x = this.calcService.linspace(-this.Kmax, this.Kmax, step);
    const y = this.calcService.linspace(-this.Kmax, this.Kmax, step);
    let _x: number[], _y: number[];
    if (this.useInterpolation) {
      _x = this.calcService.linspace(-this.Kmax, this.Kmax, step / 4);
      _y = this.calcService.linspace(-this.Kmax, this.Kmax, step / 4);
    } else {
      _x = x;
      _y = y;
    }
    this.WaveSpectrum.spectrum.forEach((_spectrum: number[][], _i: number) => {
      if (this.useInterpolation) {
        // Interpolating spectrum
        _spectrum = this.calcService.interp2(x, y, _spectrum, _x, _y);
      }
      _spectrum = this.limitByRadius(_x, _y, _spectrum, this.Kmax);
      const dset: PlotlyJS.Frame = {
          data: [{
            type: 'heatmap',
            x: _x,
            y: _y,
            z: _spectrum,
            textposition: 'bottom',
            meta: {
              date: this.dateService.MatlabDateToJSTime(this.WaveSpectrum.time[_i])
            },
            colorbar: {
              nticks: 3,
              // tickmode: 'Array',
              // tickvals: this.calcService.linspace(0, 1000, 100),
              // ticktext: ['No waves', 'Some energy', 'High energy']
              title: {
                text: 'Energy density',
                titleside: 'Right',
              }
            },
            // colorscale: 'jet',
            // zauto: false,
            // zmax: 300,
            // zmin: 0,
          }, 
          {
            type: 'scatter',
            mode: 'text',
            x: [0],
            y: [1.2 * this.Kmax],
            text: [this.dateService.MatlabDateToUnixEpoch(this.WaveSpectrum.time[_i]).format('HH:mm')],
            textfont: { size: 20},
            hoverinfo: 'skip', // Disables hover over the manually crafted title
          },
        ],
          text: 'Hi2',
          group: 'norsea',
        };
      if (_i === 0) {
        this.data = dset.data;
      }
      this.frames.push(dset);
    });
  }

  private limitByRadius(x: number[], y: number[], z: number[][], r: number): number[][] {
    // Sets all datapoints outside radius to none
    const R = r ** 2;
    for (let _i = 0; _i < x.length; _i++) {
      for (let _j = 0; _j < y.length; _j++) {
        if ((x[_i] ** 2 + y[_j] ** 2) > R) {
          z[_i][_j] = undefined;
        }
      }
    }
    return z;
  }

  startAnimation() {
    // console.log(this);
    PlotlyJS.animate('SOV_waveSpectrum', null, {
      transition: {
        duration: 500,
        easing: 'cubic',
      },
      frame: {
        duration: 500,
        redraw: false
      },
      mode: 'immediate',
    });
  }

  onPlotlyInit(figure: {data: any, layout: any, frames: any}) {
    console.log('------');
    console.log(figure);
    console.log(this);
    PlotlyJS.addFrames('SOV_waveSpectrum', this.frames);
    setTimeout(() => {
      this.startAnimation();
    }, 500);
  }
}
