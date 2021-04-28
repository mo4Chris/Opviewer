import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { RawWaveData } from '@app/models/wavedataModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { SettingsService } from '@app/supportModules/settings.service';
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
  @Input() weather: RawWaveData;
  @Input() spectrum: number[][][];

  private Kmax = 28.8;
  public parsedData: Plotly.Data[];
  public spectrumIndex = 0;
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
      range: [-1.15 * this.Kmax, 1.15*this.Kmax]
    },
    yaxis: {
      visible: false,
      title: 'Ty [1/s]',
      showgrid: false,
      zeroline: false,
      range: [-1.15 * this.Kmax, 1.15*this.Kmax]
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
      this.makeDonut(this.Kmax, 1.05*this.Kmax), // Hides the rough outer edges of the voided spectrum
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
  public PlotlyOptions: Partial<Plotly.Config> = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'zoomIn2d', 'zoomOut2d'],
    displaylogo: false
  }


  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private settings: SettingsService,
  ) {
  }

  public get spectrumValid() {
    if (!Array.isArray(this.spectrum)) return false;
    return this.spectrum.some(_spec => {
      return Array.isArray(_spec) && _spec.length>0
    })
  }
  public get active_hs() {
    const Hs = this?.weather?.Hs[this.spectrumIndex]
    return this.calcService.getDecimalValueForNumber(Hs, ' m')
  }
  ngOnChanges(): void {
    this.loaded = false;
    if (this.k_x == null || !this.spectrumValid) return
    this.plotViaIndex();
    this.setSliderSteps();
    this.loaded = true;
  }

  plotViaIndex() {
    const index = this.spectrumIndex;
    const delta = (this.k_x[1] - this.k_x[0]) / 2;
    const k = this.calcService.linspace(this.k_x[0], this.k_x[this.k_x.length-1], delta)
    const x = this.calcService.interp1(this.k_x, this.k_y, k)
    const y = this.calcService.interp1(this.k_y, this.k_y, k)
    const z_temp = this.calcService.interp2(this.k_x, this.k_y, this.spectrum[index], k, k)
    const z = z_temp.map(zz => zz.map(z => Math.log(1 + z)));
    const R2 = 1.03 * this.Kmax ** 2;

    z.reverse();
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

    this.parsedData = []
    if (typeof this.weather.waveDir?.[index] == "number") {
      this.makeHeadingMarker(this.weather.waveDir[index], 'Mean wave direction', 'red')
    }

    if (typeof this.weather.wavePeakDir?.[index] == "number") {
      this.makeHeadingMarker(this.weather.wavePeakDir[index], 'Peak wave direction', 'green')
    }

    this.parsedData.push(spectrum_heatmap_trace);
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
    const new_index = event.step._index;
    if (!(new_index >= 0)) return;
    this.spectrumIndex = new_index;
    this.plotViaIndex()
  }

  private makeLine(angle, font = <any> {width: 1, color: "white"}) {
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
  private makeCircle(radius = this.Kmax, font = <any> {width: 5, color: "black"}) {
    return {
      type: <'circle'> 'circle',
      x0: -radius,
      x1: radius,
      y0: -radius,
      y1: radius,
      line: font
    }
  }
  private makeDonut(rMin: number, mMax: number) {
    const sq = 0.55; // Some stupid constant needed to make these curves work as we cannot use A
    return {
      type: <'path'> 'path',
      path: `M ${rMin},0
        C ${rMin},${sq*rMin} ${sq*rMin},${rMin} 0,${rMin}
        C -${sq*rMin},${rMin} -${rMin},${sq*rMin} -${rMin},0
        C -${rMin},-${sq*rMin} -${sq*rMin},-${rMin} 0,-${rMin}
        C ${sq*rMin},-${rMin} ${rMin},-${sq*rMin} ${rMin},0
        Z
        M ${mMax},0
        C ${mMax},${sq*mMax} ${sq*mMax},${mMax} 0,${mMax}
        C -${sq*mMax},${mMax} -${mMax},${sq*mMax} -${mMax},0
        C -${mMax},-${sq*mMax} -${sq*mMax},-${mMax} 0,-${mMax}
        C ${sq*mMax},-${mMax} ${mMax},-${sq*mMax} ${mMax},0
        Z
        `,
      fillcolor: 'white',
      line: {
        width: 0
      }
    }
  }
  private makeCircleTextAnnotation(value = 5, txt = '5s') {
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
  private makeTextAnnotation(opts) {
    const defaults = {
      text: 'TEST',
      showarrow: false,
      x: 0,
      y: 0,
      font: { size: 20 }
    }
    return {... defaults, ... opts};
  }
  private makeHeadingMarker(angle: number, direction = 'Mean wave direction', color = 'green') {
    let r = [1.15 * this.Kmax, 1.05 * this.Kmax, 1.15 * this.Kmax];
    let ang = [angle+3,angle,angle-3];
    const meanWaveMarker = drawHeadingMarker(r, ang, {
      text: `${direction}: ${angle.toFixed(0)}&#xb0;`
    })
    this.parsedData.push(meanWaveMarker)
    function drawHeadingMarker(r: number[], ang_degs: number[], config: Partial<PlotData> = {}): Partial<PlotData> {
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
        fillcolor: color,
        line: {
          width: 0,
        },
        mode: 'none',
        fill: 'toself',
        hoveron: 'fills',
        hoverinfo: 'text',
        text: direction
      };
      return {... defaults, ... config}
    }
  }
}
