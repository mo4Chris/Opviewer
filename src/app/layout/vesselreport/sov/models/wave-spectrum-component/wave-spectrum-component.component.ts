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
  Kmax = 0.21;

  plotLayout = {
    title: {
      text: 'Test',
      y: 1
    },
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
    },]
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
            x: _x,
            y: _y,
            z: _spectrum,
            type: 'heatmap',
            // name: this.dateService.MatlabDateToJSTime(this.WaveSpectrum.time[_i]),
            name: 'Trace ' + _i,
            textposition: 'bottom',
            text: ['Hi'],
          }],
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
