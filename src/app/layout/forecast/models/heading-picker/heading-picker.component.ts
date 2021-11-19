import { Component, Input, OnChanges, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-heading-picker',
  templateUrl: './heading-picker.component.html',
  styleUrls: ['./heading-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeadingPickerComponent implements OnChanges {
  @Input() heading = 0;

  public data: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    showlegend: false,
    height: 200,
    width: 200,
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
  public config = {
    staticPlot: true
  };

  constructor() {}

  ngOnChanges() {
    this.updatePolarPlot();
  }

  updatePolarPlot() {
    this.data = [{
      type: 'scatterpolar',
      mode: 'lines',
      name: 'Heading',
      r: [1, 0.7, 0.7, 0.7, 0.7, 1],
      theta: [this.heading, this.heading - 15, (this.heading - 165) % 360, (this.heading + 165) % 360, this.heading + 15, this.heading],
      fill: 'toself',
      fillcolor: 'black',
      line: {
        color: 'black'
      }
    }];
  }

  onPlotlyInit() {
    this.loaded = true;
  }

}