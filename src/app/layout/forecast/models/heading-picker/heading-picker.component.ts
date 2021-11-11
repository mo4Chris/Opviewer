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
        visible: true,
        range: [-70, 100],
        tickvals: [0, 100],
        ticktext: ['', '']
      },
      angularaxis: {
        tickmode: 'array',
        tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
        ticktext: ['0', '45', '90', '135', '180', '225', '270', '315'],
        direction: 'clockwise',
        tickfont: {
          size: 10
        },
        gridcolor: 'white'
      } as any
    },
    images: [
      {
        x: 0.5,
        y: 0.5,
        sizex: 0.35,
        sizey: 0.35,
        source: "assets/images/WTG.png",
        xanchor: "center",
        yanchor: "middle",
      }
    ],
  };

  public config = {
    staticPlot: false,
    displayModeBar: false
  };

  constructor() {}

  ngOnChanges() {
    this.updatePolarPlot();
  }

  updatePolarPlot() {
    this.data = [
      {
        type: "scatterpolar",
        mode: "lines",
        r: [100, 15, 15, 100],
        theta: [0, 1, 9, 9],
        fill: "toself",
        fillcolor: 'orange',
        showlegend: false,
        line: {
          color: 'grey'
        }
      },{
        name: "10-20° gangway limit: 80%",
      type: "scatterpolar",
      mode: "lines",
      r: [100, 20, 20, 100],
      theta: [11, 11, 19, 19],
      fill: "toself",
      showlegend: false,
      fillcolor: 'orange',
      line: {
        color: 'green'
      }
    },
    {
      type: "scatterpolar",
      mode: "lines",
      r: [100, 0, 0, 100],
      theta: [21, 21, 29, 29],
      fill: "toself",
      showlegend: false,
      fillcolor: 'red',
      line: {
        color: 'grey'
      }
    },
    {
      type: "scatterpolar",
      mode: "lines",
      r: [100, 60, 60, 100],
      theta: [31, 31, 39, 39],
      fill: "toself",
      showlegend: false,
      fillcolor: 'grey',
      line: {
        color: 'grey'
      }
    },
    {
      name:'Blow-on',
      type: "scatterpolar",
      mode: "lines",
      showlegend: true,
      r: [-70, 200, 200, -70],
      theta: [230,230, 315, 315],
      fill: "toself",
      fillcolor: 'rgba(0,0,0,0.2)',
      line: {
        color: 'rgba(0,0,0,0.1)'
        }
    },
    {
      name:'Drift-off',
      type: "scatterpolar",
      mode: "lines",
      showlegend: true,
      r: [-70, 200, 200, -70],
      theta: [45,45, 135, 135],
      fill: "toself",
      fillcolor: 'rgba(0,0,200,0.1)',
      line: {
        color: 'rgba(0,0,200,0.1)'
      }
    },

    {
      name:'Gate A',
      type: "scatterpolar",
      mode: "lines",
      showlegend: true,
      r: [-70, 200, 200, -70],
      theta: [0, 0, 30, 30],
      line: {
        color: 'rgba(0,0,0,1)'
      }
    },
    
    
    {
      type: "scatterpolar",
      mode: "lines",
      r: [100, 19, 19, 100],
      theta: [351, 351, 359, 359],
      fill: "toself",
      showlegend: false,
      
      fillcolor: 'grey',
      line: {
        color: 'grey'
      }
    }];
  }

  onPlotlyInit() {
    this.loaded = true;
  }

}
