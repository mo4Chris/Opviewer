import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { PlotlySupportService } from '@app/supportModules/plotly.support.service';
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
    private plotlyService: PlotlySupportService
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
      this.setXLimits();
    } else {
      this.MaxWorkability = 'N/a';
    }
  }

  computeMaxWorkability() {
    if (!this.startTime || !this.stopTime) return this.MaxWorkability = 'select a valid time frame';
    const start_num = this.dateService.matlabDatenumToDate(this.startTime).valueOf();
    const stop_num = this.dateService.matlabDatenumToDate(this.stopTime).valueOf();
    const sidx = this.time.findIndex(t => t.valueOf() > start_num);
    const eidx = this.time.findIndex(t => t.valueOf() > stop_num);
    const workabilityDuringOperation = this.workabilityAlongHeading.slice(sidx, eidx);
    if (eidx - sidx < 1) return this.MaxWorkability = 'N/a';
    this.MaxWorkability = this.calcService.roundNumber(Math.max(...workabilityDuringOperation), 1, '%');
  }

  computeGraphData() {
    const yLimit = 100;
    const areas = this.plotlyService.createAreaLines(
      this.time,
      this.workabilityAlongHeading,
      (_, y) => y < yLimit
    );
    this.parsedData = [{
      x: areas.green.map(g => g.x),
      y: areas.green.map(g => g.y>0 ? g.y : null),
      type: 'scatter', // This is a line
      name: 'Workability - under limit',
      connectgaps: false,
      mode: 'lines',
      line: {
        color: 'green',
      },
    }, {
      x: areas.red.map(g => g.x),
      y: areas.red.map(g => g.y>0 ? g.y : null),
      type: 'scatter', // This is a line
      name: 'Workability - over limit',
      mode: 'lines',
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


  private parseTime(t: number) {
    return this.dateService.matlabDatenumToDate(t);
  }
  onPlotlyInit() {
    this.loaded = true;
  }

  private setXLimits() {
    this.plotlyService.setXLimits(this.time, this.PlotLayout);
  }
}

