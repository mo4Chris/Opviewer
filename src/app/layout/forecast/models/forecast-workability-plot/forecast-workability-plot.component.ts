import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-forecast-workability-plot',
  templateUrl: './forecast-workability-plot.component.html',
  styleUrls: ['./forecast-workability-plot.component.scss'],
})
export class ForecastWorkabilityPlotComponent implements OnChanges {
  @Input() workabilityAlongHeading: number[];
  @Input() time: Date[];
  @Input() startTime: number;
  @Input() stopTime: number;
  @Input() config: Partial<Plotly.Config> = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'zoomIn2d', 'zoomOut2d'],
    displaylogo: false
  }

  public MaxWorkability = '';
  public parsedData: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    yaxis: {
      range: [0, 120],
      title: 'Workability (%)',
      fixedrange: true,
    },
    xaxis: {
      automargin: true,
      type: 'date',
    },
    legend: {
      x: 1,
      y: 1,
      xanchor: 'right',
    },
    margin: {
      t: 40,
      b: 0,
      l: 60,
      r: 40
    }
  };

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
  ) { }

  public get hasData() {
    return Array.isArray(this.time)
      && Array.isArray(this.workabilityAlongHeading)
      && this.workabilityAlongHeading.some(e => e > 0)
      && this.workabilityAlongHeading.length == this.time.length;
  }

  ngOnChanges() {
    if (this.hasData) {
      this.computeMaxWorkability();
      this.computeGraphData();
    } else {
      this.MaxWorkability = 'N/a';
    }
  }

  computeMaxWorkability() {
    if (!this.startTime || !this.stopTime) return this.MaxWorkability = 'select a valid time frame';
    const sidx = this.time.findIndex(t => t.valueOf() > this.startTime);
    const eidx = this.time.findIndex(t => t.valueOf() > this.stopTime) - 1;
    const workabilityDuringOperation = this.workabilityAlongHeading.slice(sidx, eidx);
    if (this.workabilityAlongHeading.length == 0) return this.MaxWorkability = 'N/a';
    this.MaxWorkability = this.calcService.roundNumber(Math.max(...workabilityDuringOperation), 1, '%');
  }

  private parseTime(t: number) {
    return this.dateService.matlabDatenumToDate(t);
  }

  computeGraphData() {
    const yLimit = 100;
    const limits = this.getStartAndEndPoints(this.workabilityAlongHeading, yLimit);
    const areas = createPlotyAreaLines(
      this.time,
      this.workabilityAlongHeading,
      this.workabilityAlongHeading.map(y => y < yLimit)
    );
    this.parsedData = [{
      x: this.time,
      y: limits.green,
      type: 'scatter', // This is a line
      name: 'Workability - under limit',
      connectgaps: false,
      line: {
        color: 'green',
      },
    }, {
      x: this.time,
      y: limits.red,
      type: 'scatter', // This is a line
      name: 'Workability - over limit',
      // showlegend: false,
      connectgaps: false,
      line: {
        color: 'red',
      },
    },
    {
      x: areas.green.map(g => g.x),
      y: areas.green.map(g => g.y),
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
      x: areas.red.map(g => g.x),
      y: areas.red.map(g => g.y),
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
    }];

    if (this.startTime && this.stopTime) {
      this.parsedData.push({
        x: [
          this.parseTime(this.startTime),
          this.parseTime(this.stopTime)
        ],
        y: [200, 200],
        name: 'Selected time frame',
        mode: 'none',
        hoverinfo: 'none',
        line: {
          color: 'black',
        },
        fill: 'tozeroy',
      });
    }
  }

  onPlotlyInit() {
    this.loaded = true;
  }

  getStartAndEndPoints(datas: number[], limit: number) {
    const valid = datas.map(e => e <= limit);
    const greens = valid;
    const reds = valid.map(v => !v);
    for (let i = valid.length - 1; i > 0; i--) {
      if (greens[i] && reds[i - 1]) {
        reds[i] = true;
      } else if (reds[i] && greens[i - 1]) {
        greens[i] = true;
      }
    }
    return {
      green: datas.map((d, i) => greens[i] ? d : NaN),
      red: datas.map((d, i) => reds[i] ? d : NaN),
    };
  }
}

function createPlotyAreaLines(xVals: any[], yVals: number[], condition: boolean[]) {
  let prev = condition[0];
  const greens: { x: any, y: number }[] = [];
  const reds: { x: any, y: number }[] = [];
  if (condition[0]) {
    greens.push({
      x: xVals[0],
      y: yVals[0]
    });
  } else {
    reds.push({
      x: xVals[0],
      y: yVals[0]
    });
  }

  const maxLength = Math.min(xVals.length, yVals.length);
  for (let i = 1; i < maxLength; i++) {
    const curr = condition[i];
    if (curr == prev) {
      if (curr) {
        greens.push({
          x: xVals[i],
          y: yVals[i],
        });
      } else {
        reds.push({
          x: xVals[i],
          y: yVals[i],
        });
      }
    } else {
      if (curr) {
        reds.push({
          x: xVals[i],
          y: yVals[i],
        });
        reds.push({
          x: xVals[i],
          y: 0,
        });
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
        });
        greens.push({
          x: xVals[i],
          y: 0,
        });
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
  };
}
