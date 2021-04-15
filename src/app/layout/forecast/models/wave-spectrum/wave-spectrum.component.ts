import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { PlotData } from 'plotly.js';


@Component({
  selector: 'app-wave-spectrum',
  templateUrl: './wave-spectrum.component.html',
  styleUrls: ['./wave-spectrum.component.scss']
})
export class SovWaveSpectrumComponent implements OnChanges {
  @Input() time: number[];
  @Input() k_x: number[];
  @Input() k_y: number[];
  @Input() waveDir: number[];
  @Input() wavePeakDir: number[];
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
    radialaxis: {
      'visible': false,
    },
    margin: {
      l: 40,
      r: 20,
      b: 0,
      t: 0,
      pad: 4
    },
    annotations: [
      this.makeTextAnnotation({
        text: 'N',
        x: 0,
        y: this.Kmax,
        yanchor: 'bottom',
      }), this.makeTextAnnotation({
        text: 'E',
        x: this.Kmax,
        y: 0,
        xanchor: 'left',
        xshift: 3,
      }), this.makeTextAnnotation({
        text: 'S',
        x: 0,
        y: -this.Kmax,
        yanchor: 'top',
      }), this.makeTextAnnotation({
        text: 'W',
        x: - this.Kmax,
        y: 0,
        xanchor: 'right',
        xshift: -5,
      }),
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
    sliders: [{
      x: 0.5,
      y: -0.05,
      xanchor: 'center',
      yanchor: 'middle',
      currentvalue: {
        xanchor: 'center',
        visible: true,
        font: { size: 20 },
        offset: 0,
        prefix: '',
        suffix: '',
      },
      steps: [], // The slider steps are added dynamically
    }],
  };


  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private matService: MatrixService,
  ) {
  }

  ngOnChanges(): void {
    console.log(this)
    this.loaded = false;
    if (this.k_x == null) return
    this.plotViaIndex();
    this.setSliderSteps();
    this.loaded = true;
  }

  plotViaIndex() {
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
    const spectrum_heatmap_trace: Partial<PlotData> = {
      type: <any> 'heatmap',
      x,
      y,
      z,
      showscale: false,
      hoverinfo: 'skip',
      zsmooth: 'fast',
      connectgaps: false,
    }

    let meanWaveMarker = null;
    if (this.waveDir?.[index]) {
      const meanWaveDir_deg = this.waveDir[index];
      let r = [1.05 * this.Kmax, 1.15 * this.Kmax, 1.05 * this.Kmax];
      let ang = [meanWaveDir_deg+5,meanWaveDir_deg,meanWaveDir_deg-5];
      meanWaveMarker = this.makeHeadingMarker(r, ang, {
        text: `Mean wave direction: ${meanWaveDir_deg.toFixed(0)}&#xb0;`
      })
    }

    let peakWaveMarker = null;
    if (this.wavePeakDir?.[index]) {
      const peakWaveDir_deg = this.wavePeakDir[index];
      let r = [1.05 * this.Kmax, 1.15 * this.Kmax, 1.05 * this.Kmax];
      const ang = [peakWaveDir_deg+5,peakWaveDir_deg,peakWaveDir_deg-5];
      peakWaveMarker = this.makeHeadingMarker(r, ang, {
        fillcolor: 'green',
        text: `Peak wave direction: ${peakWaveDir_deg.toFixed(0)}&#xb0;`
      })
    }


    this.parsedData = [
      spectrum_heatmap_trace,
      meanWaveMarker,
      peakWaveMarker,
    ];
  }

  setSliderSteps() {
    const steps = [];
    const timeStamps = this.time.map(dnum => {
      const moment = this.dateService.matlabDatenumToMoment(dnum);
      return moment.format('DD-MMM HH:mm')
    });
    timeStamps.forEach((ts, i) => {
      steps.push({
        args: [i],
        label: ts,
        method: 'skip'
      })
    })
    this.PlotLayout.sliders[0].steps = steps;
  }

  onPlotlyInit() {
  }

  public onSliderChange(event: any) {
    console.log('event', event)
    const new_index = event.step._index;
    console.log('new_index', new_index)
    if (!(new_index >= 0)) return;
    this.spectrumIndex = new_index + 1;
    this.plotViaIndex()
  }

  makeLine(angle, font = <any> {width: 1, color: "white"}) {
    const x0 = Math.cos(angle * Math.PI / 180) * this.Kmax;
    const y0 = Math.sin(angle * Math.PI / 180) * this.Kmax;
    return {
      type: <'line'> 'line',
      x0: -x0,
      x1: x0,
      y0: -y0,
      y1: y0,
      line: font
    }
  }
  makeCircle(radius = this.Kmax, font = <any> {width: 5, color: "black"}) {
    return {
      type: <'circle'> 'circle',
      x0: -radius,
      x1: radius,
      y0: -radius,
      y1: radius,
      line: font
    }
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

  makeTextAnnotation(opts) {
    const defaults = {
      text: 'TEST',
      showarrow: false,
      x: 0,
      y: 0,
      font: { size: 20 }
    }
    return {... defaults, ... opts};
  }

  makeHeadingMarker(r: number[], ang_degs: number[], config: Partial<PlotData> = {}): Partial<PlotData> {
    const theta = ang_degs.map(t => (90-t) * Math.PI / 180);
    let x0 = []; let y0 = [];
    theta.forEach((_theta, i) => {
      x0.push(Math.cos(_theta) * r[i]);
      y0.push(Math.sin(_theta) * r[i]);
    })
    const defaults: Partial<PlotData> = {
      type: 'scatter',
      x: x0,
      y: y0,
      fillcolor: 'red',
      line: {
        width: 0,
      },
      mode: 'none',
      fill: 'toself',
      hoveron: 'fills',
      hoverinfo: 'text',
      text: 'Mean wave direction'
    };
    return {... defaults, ... config}
  }
}
