import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';


@Component({
  selector: 'app-wave-spectrum',
  templateUrl: './wave-spectrum.component.html',
  styleUrls: ['./wave-spectrum.component.scss']
})
export class SovWaveSpectrumComponent implements OnChanges {
  @Input() omega: number[];
  @Input() heading: number[];
  @Input() spectrum: number[][];

  
  public parsedData: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    showlegend: false,
    height: 400,
    width: 400,
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
    }
  };

  constructor() {
    console.log(this)
  }

  ngOnChanges(): void {
    this.loaded = false;
    if (this.omega == null) return
    this.parsedData = [{
      type: <any> "barpolar",
      r: this.omega,
      theta: this.heading,
    }];
    this.loaded = true;
  }

  public onPlotlyInit() {
    console.log('PLOTLY wave spectrum init')
  }
}
