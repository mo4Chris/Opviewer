import { Component, OnInit, Input } from '@angular/core';
import { SovWaveSpectum } from '../../sovreport/sovreport.component';
import Plotly from 'plotly.js';
import { CalculationService } from '../../../../../supportModules/calculation.service';

@Component({
  selector: 'app-wave-spectrum-component',
  templateUrl: './wave-spectrum-component.component.html',
  styleUrls: ['./wave-spectrum-component.component.scss']
})
export class WaveSpectrumComponentComponent implements OnInit {
  @Input() WaveSpectrum: SovWaveSpectum;
  chart;
  data: any[];
  loaded = true;
  plotLayout = {
    height: 600,
    width: 600,
  };

  constructor(
    private calcService: CalculationService
  ) { }

  ngOnInit() {
    console.log('On init:');
    console.log(this.WaveSpectrum);
    // const size = 100, x = new Array(size), y = new Array(size), z = new Array(size);

    // for (let i = 0; i < size; i++) {
    //   x[i] = y[i] = -2 * Math.PI + 4 * Math.PI * i / size;
    //   z[i] = new Array(size);
    // }

    // for (let i = 0; i < size; i++) {
    //   for (let j = 0; j < size; j++) {
    //     const r2 = x[i] * x[i] + y[j] * y[j];
    //     z[i][j] = Math.sin(x[i]) * Math.cos(y[j]) * Math.sin(r2) / Math.log(r2 + 1);
    //   }
    // }
    const x = this.calcService.linspace(-49.5, 49.5, 1);
    const y = this.calcService.linspace(-49.5, 49.5, 1);

    this.data = [];
    this.WaveSpectrum.spectrum.forEach((_spectrum, _i) => {
      this.data.push({
        x: x,
        y: y,
        z: _spectrum,
        type: 'contour'
      });
    });
  }

  createSpectralFrame(_index: number) {
    // Renders a single frame

    setTimeout(() => {
      this.createSpectralFrame(_index + 1 % this.WaveSpectrum.spectrum.length);
    }, 100);
  }

  onPlotlyInit(figure, _div) {
    console.log('------');
    console.log(figure);
    console.log(_div);
    console.log(this);
  }
}
