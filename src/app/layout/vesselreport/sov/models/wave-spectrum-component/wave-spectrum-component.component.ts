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
  plotLayout = {
    title: 'Test',
    height: 600,
    width: 600,
    xaxis: {
      visible: false
    },
    yaxis: {
      visible: false
    },
    colorbar: {
      nticks: 10,
      tickmode: 'array',
      tickvals: this.calcService.linspace(0, 500, 50),
      ticktext: ['0', '', '', '', '', '', 'medium', '', '', '', 'high'],
      showticklabels: false,
    },
    autocolorscale: false,
    colorscale: 'Electric',
  };
  color = colormap({
    colormap: 'jet',
    nshades: 50,
    format: 'rgb',
    alpha: 1,
  })

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService
  ) {
  }

  ngOnInit() {
    console.log('On init:');
    console.log(this.WaveSpectrum);

    const size = 100;
    const size_2 = (size - 1) / 2;
    const x = this.calcService.linspace(-size_2, size_2, 1);
    const y = this.calcService.linspace(-size_2, size_2, 1);
    this.WaveSpectrum.spectrum.forEach((_spectrum: number[][], _i: number) => {
      const dset: PlotlyJS.Frame = {
          data: [{
            x: x,
            y: y,
            z: this.limitByRadius(x, y, _spectrum, 50),
            type: 'contour',
          }],
          name: this.dateService.MatlabDateToJSTime(this.WaveSpectrum.time[_i]),
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
    console.log(PlotlyJS.addFrames);
    PlotlyJS.addFrames('SOV_waveSpectrum', this.frames);
    setTimeout(() => {
      this.startAnimation();
    }, 500);
  }
}
