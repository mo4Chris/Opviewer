import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';

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
  public parsedData;
  public loaded = false;

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
    console.log(this)
    if (this.hasData) {
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
    this.parsedData = [{
      x: this.time,
      y: this.workabilityAlongHeading,
      type: "line",
      min: 0,
      max: 200,
    }]
  }

  onPlotlyInit() {
    this.loaded = true;
  }
}
