import { EventEmitter, Component, Input, OnChanges, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';

@Component({
  selector: 'app-heading-picker',
  templateUrl: './heading-picker.component.html',
  styleUrls: ['./heading-picker.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeadingPickerComponent implements OnChanges {
  @Input() heading = 0;
  @Output() headingChanges: EventEmitter<number> = new EventEmitter();

  
  public data: PlotlyJS.Data[];
  public PlotLayout = {
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
        tickfont: {
          size: 8
        },
        dtick: 45,
        direction: "clockwise"
      }
    }
  };

  constructor() {
  }

  ngOnChanges() {
    console.log('Building polar plot!')
    this.data = [{
      type: 'scatterpolar',
      mode: 'lines',
      name: 'Heading',
      r: [1, 0.4, 0.4, 1],
      theta: [this.heading, this.heading-10, this.heading+10, this.heading],
      fill: "toself",
      fillcolor: 'black',
      line: {
        color: 'black'
      }
    }];
    console.log(this.data)
    // PlotlyJS.newPlot('myDiv', this.data, this.PlotLayout)
  }

  onPlotlyInit(plotlyObj) {
    console.log('PLotly header is initialized')
    console.log(plotlyObj)
  }

  onConfirm() {
    this.headingChanges.emit(this.heading)
  }

}
