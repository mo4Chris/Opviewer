import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CommonService } from '@app/common.service';
import { VesselObjectModel } from '@app/supportModules/mocked.common.service';
import { isArray } from 'util';
import { routerTransition } from '@app/router.animations';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-wave-spectrum-component',
  templateUrl: './wave-spectrum-component.component.html',
  styleUrls: ['./wave-spectrum-component.component.scss', '../../sovreport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WaveSpectrumComponentComponent implements OnInit, OnChanges {
  @Input() vesselObject: VesselObjectModel;
  
  waveSpectrum: SovWaveSpectum;
  loaded = false;
  data: PlotlyJS.Data[] = [];
  frames: PlotlyJS.Frame[] = [];
  animateActive = false;
  useInterpolation = true;
  smoothFactor = 2;
  Kmax = 2.096; // Size of outer circle
  Kmin = 0.127; // Size of inner circle
 
  plotLayout = {
   
    // General settings for the graph
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
    
    // All the annotations for the plot go here (ie. the north east south west signs)
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
    
    // Supportings shapes (ie. outer edge to hide the interpolation) go here
    shapes: [{
      type: 'circle',
      x0: -this.Kmax,
      x1: this.Kmax,
      y0: -this.Kmax,
      y1: this.Kmax,
      line: { width: 5 },
    }, {
      type: 'circle',
      x0: -this.Kmin,
      x1: this.Kmin,
      y0: -this.Kmin,
      y1: this.Kmin,
      fillcolor: 'rgba(0,0,0,1)',
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
    
    // Add images, menus or sliders if desired (eg. a ship in the middle?)
    // images: [],
    updatemenus: [{
      x: 1.2,
      y: -0.15,
      type: 'buttons',
      yanchor: 'middle',
      buttons: [{
        method: 'animate',
        label: 'Animate',
        args: [null, {
          mode: 'immediate',
          frame: {
            duration: 200,
            redraw: true
          },
          transition: {
            duration: 1000,
            easing: 'circle',
            ordering: 'traces first',
          }
        }],
      }]
      // buttons: [{
      //   method: 'update',
      //   label: 'update',
      //   args: [null, {
      //     mode: 'immediate',
      //     frame: {
      //       duration: 200,
      //       redraw: true
      //     },
      //     transition: {duration: 0}
      //   }],
      // }]
    }],
    sliders: [{
      x: 0.5,
      y: -0.1,
      xanchor: 'center',
      yanchor: 'middle',
      currentvalue: {
        xanchor: 'center',
        visible: true,
        font: { size: 20 },
      },
      steps: [], // The slider steps are added dynamically
    }],
  };

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private newService: CommonService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // ToDo: Validate that this makes sense
    // this.ngZone.runOutsideAngular(() => this.paint());
    // requestAnimationFrame outide angular zone
  }

  ngOnChanges() {
    // Setting the source name
    this.loaded = false;
    this.newService.getSovWaveSpectrum(this.vesselObject).subscribe((spectrums: SovWaveSpectum[]) => {
      if (isArray(spectrums) && spectrums.length > 0) {
        this.waveSpectrum = spectrums[0];
        this.parseSpectrum();
        this.loaded = true;
        this.ref.detectChanges();
      } else {
        console.error('Received invalid wave spectrum!');
      }
    });
  }

  parseSpectrum() {
    this.plotLayout.annotations.forEach(_annot => {
      if (_annot.name && _annot.name === 'source') {
        _annot.text = 'Source: ' + this.waveSpectrum.source;
      }
    });
    const N = this.waveSpectrum.spectrum[0].length;
    const step = 2 * this.Kmax / (N - 1);
    const x = this.calcService.linspace(-this.Kmax, this.Kmax, step);
    const y = this.calcService.linspace(-this.Kmax, this.Kmax, step);
    let _x: number[], _y: number[];
    if (this.useInterpolation) {
      _x = this.calcService.linspace(-this.Kmax, this.Kmax, step / this.smoothFactor);
      _y = this.calcService.linspace(-this.Kmax, this.Kmax, step / this.smoothFactor);
    } else {
      _x = x;
      _y = y;
    }
    const sliderSteps = [];
    const headings = this.waveSpectrum.heading;
    this.waveSpectrum.spectrum.forEach((_spectrum: number[][], _i: number) => {
      if (this.useInterpolation) {
        _spectrum = this.calcService.interp2(x, y, _spectrum, _x, _y);
      }
      _spectrum = this.limitByRadius(_x, _y, _spectrum, this.Kmax);
      const timeString = this.dateService.MatlabDateToCustomJSTime(this.waveSpectrum.time[_i], 'HH:mm');
      const heading_radians = headings && headings[_i] ? headings[_i] * Math.PI / 180 : 0;
      const dset: PlotlyJS.Frame = {
        data: [{
          type: 'heatmap',
          x: _x,
          y: _y,
          z: _spectrum,
          colorbar: {
            nticks: 5,
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
          hoverinfo: 'skip',
          zsmooth: 'fast',
          connectgaps: false,
        // Ongoing plotly issue: Cannot have scatter plots as well as contours or heatmaps in the same animation
        // },
        // {
        //   type: 'scatter',
        //   mode: 'lines',
        //   hovertext: ['', 'Vessel heading', ''],
        //   hoverinfo: 'text',
        //   x: [Math.sin(heading_radians - 0.05) * 1.03 * this.Kmax, Math.sin(heading_radians) * 1.08 * this.Kmax, Math.sin(heading_radians + 0.05) * 1.03 * this.Kmax],
        //   y: [Math.cos(heading_radians - 0.05) * 1.03 * this.Kmax, Math.cos(heading_radians) * 1.08 * this.Kmax, Math.cos(heading_radians + 0.05) * 1.03 * this.Kmax],
        //   line: {
        //     width: 5,
        //     color: 'red',
        //   }
        }],
        name: timeString,
        group: timeString,
      };
      sliderSteps.push({
        method: 'animate', // 'animate',
        label: timeString,
        vertical: true,
        args: [[timeString], {
          mode: 'immediate',
          transition: {
            duration: 0,
            ordering: 'traces first',
          },
          frame: {
            duration: 300,
            redraw: true,
          },
        }],
      });
      // sliderSteps.push({
      //   method: 'restyle', // 'animate',
      //   label: timeString,
      //   vertical: true,
      //   args: [[timeString], {
      //     mode: 'immediate',
      //     transition: { duration: 300 },
      //     frame: { duration: 300 },
      //   }],
      // });
      if (_i === 0) {
        this.data = dset.data;
      }
      this.frames.push(dset);
    });
    this.plotLayout.sliders[0].steps = sliderSteps;
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

  onError(event) {
    console.error('An error occured during SVG plot generation');
    console.log(event);
  }

  // startAnimation() {
  //   PlotlyJS.animate('SOV_waveSpectrum', null, {
  //     transition: {
  //       duration: 200,
  //     },
  //     frame: {
  //       duration: 200,
  //       redraw: false
  //     },
  //     mode: 'afterall',
  //     execute: true,
  //   });
  // }
  // stopAnimation() {
  //   PlotlyJS.animate('SOV_waveSpectrum', [], {
  //     transition: {
  //       duration: 200,
  //     },
  //     mode: 'next',
  //   });
  // }

  onPlotlyInit(figure: { data: any, layout: any, frames: any }) {
    PlotlyJS.addFrames('SOV_waveSpectrum', this.frames);
    // This would be preferably be handled via the scss, but I couldnt make it work
    const svgs = <any>document.getElementsByClassName('svg-container');
    for (let _i = 0; _i < svgs.length; _i++) {
      svgs[_i].style.margin = 'auto';
    }
  }
}

export interface SovWaveSpectum {
  mmsi: number;
  date: number;
  time: number[];
  heading: number[];
  spectrum: number[][][];
  source: string;
}