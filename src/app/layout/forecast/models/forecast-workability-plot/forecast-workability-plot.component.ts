import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as Plotly from 'plotly.js'

@Component({
  selector: 'app-forecast-workability-plot',
  templateUrl: './forecast-workability-plot.component.html',
  styleUrls: ['./forecast-workability-plot.component.scss'],
})
export class ForecastWorkabilityPlotComponent implements OnChanges {
  @Input() workabilityAlongHeading: number[];
  @Input() time: Date[];
  @Input() startTime: Date;
  @Input() stopTime: Date;

  public MaxWorkability = '';
  public parsedData: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    yaxis: {
      range: [0, 200]
    }
  }

  constructor(
    private calcService: CalculationService,
    private ref: ChangeDetectorRef,
  ) { }

  public get hasData() {
    return Array.isArray(this.workabilityAlongHeading) 
      && this.workabilityAlongHeading.some(e => e > 0) 
      && this.workabilityAlongHeading.length == this.time.length
  }

  ngOnChanges() {
    if (this.hasData) {

      // this.time = this.time.slice(160, 170)
      // this.workabilityAlongHeading = this.workabilityAlongHeading.slice(160, 170);

      this.computeMaxWorkability();
      this.computeGraphData();
    } else {
      this.MaxWorkability = 'N/a'
    }
  }

  computeMaxWorkability() {
    let sidx = this.time.findIndex(t => t > this.startTime);
    let eidx = this.time.length - this.time.reverse().findIndex(t => t > this.startTime) - 1;
    let workabilityDuringOperation = this.workabilityAlongHeading.slice(sidx, eidx)
    this.MaxWorkability = this.calcService.roundNumber(Math.max(...workabilityDuringOperation), 1, '%');
  }

  computeGraphData() {
    const yLimit = 100;
    let limits = this.getStartAndEndPoints(this.workabilityAlongHeading, yLimit);
    let areas = createPlotyAreaLines(this.time, this.workabilityAlongHeading, this.workabilityAlongHeading.map(y => y<yLimit))
    console.log(areas)
    this.parsedData = [{
      x: this.time,
      // y: this.workabilityAlongHeading.map(y => (y > yLimit) ? NaN : y),
      y: limits.green,
      type: 'scatter', // This is a line
      name: 'Workability',
      connectgaps: false,
      showlegend: false,
      line: {
        color: 'green',
      },
      // fill: 'tozeroy',
    }, {
      x: this.time,
      y: limits.red,
      type: 'scatter', // This is a line
      name: 'Workability',
      showlegend: false,
      connectgaps: false,
      line: {
        color: 'red',
      },
      // fill: 'tozeroy',
    },
    {
      x: areas.green.map(g=> g.x),
      y: areas.green.map(g=> g.y),
      type: 'scatter', // This is a line
      name: 'GreenArea',
      hoverinfo: 'none',
      connectgaps: false,
      showlegend: false,
      line: {
        color: 'green',
      },
      mode: 'none',
      fill: 'tozeroy',
    }, {
      x: areas.red.map(g=> g.x),
      y: areas.red.map(g=> g.y),
      type: 'scatter', // This is a line
      name: 'RedArea',
      hoverinfo: 'none',
      showlegend: false,
      connectgaps: false,
      line: {
        color: 'red',
        width: 0
      },
      mode: 'none',
      fill: 'tozeroy',
      text: '',
    },
  ]
  }

  onPlotlyInit() {
    this.loaded = true;
  }

  getStartAndEndPoints(datas: number[], limit: number) {
    const valid = datas.map(e => e <= limit);
    let greens = valid;
    let reds = valid.map(v => !v);
    for (let i = valid.length - 1; i>0; i--) {
      if (greens[i] && reds[i-1]){
        reds[i] = true;
      } else if (reds[i] && greens[i-1]){
        greens[i] = true;
      }
    }
    return {
      green: datas.map((d,i) => greens[i] ? d : NaN),
      red: datas.map((d,i) => reds[i] ? d : NaN),
    };
  }
}

function createPlotyAreaLines(xVals: any[], yVals: number[], condition: boolean[]) {
  let prev = condition[0];
  const greens: {x: any, y: number}[] = [];
  const reds: {x: any, y: number}[] = [];
  if (condition[0]) {
    greens.push({
      x: xVals[0],
      y: yVals[0]
    })
  } else {
    reds.push({
      x: xVals[0],
      y: yVals[0]
    })
  }

  const maxLength = Math.min(xVals.length, yVals.length);
  for (let i=1; i<maxLength; i++) {
    let curr = condition[i];
    console.log(xVals[i],curr, curr==prev, yVals[i])
    if (curr == prev) {
      if (curr) {
        greens.push({
          x: xVals[i],
          y: yVals[i],
        })
      } else {
        reds.push({
          x: xVals[i],
          y: yVals[i],
        })
      }
    } else {
      if (curr) {
        reds.push({
          x: xVals[i],
          y: yVals[i],
        })
        reds.push({
          x: xVals[i],
          y: 0,
        })
        greens.push({
          x: xVals[i],
          y: 0,
        });
        greens.push({
          x: xVals[i],
          y: yVals[i],
        });
      } else {
        greens.push({
          x: xVals[i],
          y: yVals[i],
        })
        greens.push({
          x: xVals[i],
          y: 0,
        })
        reds.push({
          x: xVals[i],
          y: 0,
        });
        reds.push({
          x: xVals[i],
          y: yVals[i],
        });
      }
    }
    prev = curr;
  }
  return {
    green: greens,
    red: reds,
  }
}