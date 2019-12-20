import { Component, OnInit, Input } from '@angular/core';
import { SovWaveSpectum } from '../../sovreport/sovreport.component';
import { CalculationService } from '../../../../../supportModules/calculation.service';
import { DatetimeService } from '../../../../../supportModules/datetime.service';

@Component({
  selector: 'app-wave-spectrum-component',
  templateUrl: './wave-spectrum-component.component.html',
  styleUrls: ['./wave-spectrum-component.component.scss']
})
export class WaveSpectrumComponentComponent implements OnInit {
  @Input() WaveSpectrum: SovWaveSpectum;
  chart;
  data: any[] = [];
  frames: any[] = [];
  loaded = true;
  plotLayout = {
    height: 600,
    width: 600,
    xaxis: {
      visible: false
    },
    yaxis: {
      visible: false
    },
    coloraxis: {
      showscale: false,
    },

  };

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService
  ) { }

  ngOnInit() {
    console.log('On init:');
    console.log(this.WaveSpectrum);
    // const size = 100, x = new Array(size), y = new Array(size), z = new Array(size);

    // for (let i = 0; i < size; i++) {
    //   x[i] = y[i] = -2 * Math.PI + 4 * Math.PI * i / size;
    //   z[i] = new Array(size);
    // }

    const size = 100;
    const size_2 = (size - 1) / 2;
    const x = this.calcService.linspace(-size_2, size_2, 1);
    const y = this.calcService.linspace(-size_2, size_2, 1);
    const z = new Array(size);

    for (let i = 0; i < size; i++) {
      z[i] = new Array(size);
      for (let j = 0; j < size; j++) {
        const r2 = x[i] * x[i] + y[j] * y[j];
        z[i][j] = Math.sin(x[i]) * Math.cos(y[j]) * Math.sin(r2) / Math.log(r2 + 1);
      }
    }
    // this.data = [{
    //   x: x,
    //   y: y,
    //   z: z,
    //   type: 'heatmap'
    // }];
    this.WaveSpectrum.spectrum.forEach((_spectrum: number[][], _i: number) => {
      const dset = [{
          x: x,
          y: y,
          z: this.limitByRadius(x, y, _spectrum, 50),
          type: 'contour',
          name: this.dateService.MatlabDateToJSTime(this.WaveSpectrum.time[_i])
        }];
      if (_i === 0) {
        this.data = dset;
      }
      this.frames.push({
        data: dset,
        name: dset[0].name,
      });
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

  createSpectralFrame(_index: number) {
    // Renders a single frame

    setTimeout(() => {
      this.createSpectralFrame(_index + 1 % this.WaveSpectrum.spectrum.length);
    }, 100);
  }

  onPlotlyInit(figure: {data: any, layout: any, frames: any}) {
    console.log('------');
    console.log(figure);
    console.log(this);
    figure.frames = this.frames;

    const div = document.getElementsByClassName('spectrum')[0];
    console.log(div);
  }
}
