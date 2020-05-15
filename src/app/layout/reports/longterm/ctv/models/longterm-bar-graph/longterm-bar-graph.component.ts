import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ComprisonArrayElt, RawScatterData } from '../../../models/scatterInterface';
import { LongtermVesselObjectModel } from '../../../longterm.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js';
import { SettingsService } from '@app/supportModules/settings.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { CommonService } from '@app/common.service';
import { catchError, map } from 'rxjs/operators';
import { LongtermProcessingService, LongtermScatterValueArray } from '../../../models/longterm-processing-service.service';
import { now } from 'moment';

@Component({
  selector: 'app-longterm-bar-graph',
  templateUrl: './longterm-bar-graph.component.html',
  styleUrls: ['./longterm-bar-graph.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongtermBarGraphComponent implements OnChanges {
  @Input() data: ComprisonArrayElt
  @Input() fromDate: NgbDate;
  @Input() toDate: NgbDate;
  @Input() vesselObject: LongtermVesselObjectModel;
  @Input() vesselLabels: string[] = ['Placeholder A', 'Placeholder B', 'Placeholder C'];

  @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToVesselreport: EventEmitter<{ mmsi: number, matlabDate: number }> = new EventEmitter<{ mmsi: number, matlabDate: number }>();

  @ViewChild('canvas') canvas: ElementRef;
  private context: CanvasRenderingContext2D;

  hasData: boolean;
  info: string;
  chart: Chart;
  axisType: any;

  constructor(
    private calcService: CalculationService,
    private dateService: DatetimeService,
    private settings: SettingsService,
    private newService: CommonService,
    private parser: LongtermProcessingService,
  ) { }

  ngOnChanges() {
    this.context = (<HTMLCanvasElement> this.canvas.nativeElement).getContext('2d');
    if (this.chart) {
      this.reset();
    }

    this.info = this.data.info || 'N/a';
    const query = {
      mmsi: this.vesselObject.mmsi,
      dateMin: this.vesselObject.dateMin,
      dateMax: this.vesselObject.dateMax,
      reqFields: [this.data.x, this.data.y],
      x: this.data.x,
      y: this.data.y,
    }
    
    this.parser.load(query, this.data.dataType).pipe(map(
      (rawScatterData: RawScatterData[]) => this.parseRawData(rawScatterData)
    ), catchError(error => {
      console.log('error: ' + error);
      throw error;
    })).subscribe(parsedData => {
      this.hasData = parsedData.some(_parsed => {
        return true
        // return _parsed.trend.length > 1 || _parsed.outliers.length > 0
      })
      if (this.hasData) {
        let dsets = [];
        // parsedData.forEach((vesseldata, i) => {
        //   dsets.push(this.parser.createChartlyLine(vesseldata.trend, i, {label: this.vesselLabels[i], borderWidth: 3}))
        //   dsets.push(this.parser.createChartlyLine(vesseldata.ub, i, {label: this.vesselLabels[i], fill: '+1'})) // Fills area until lower bound
        //   dsets.push(this.parser.createChartlyLine(vesseldata.lb, i, {label: this.vesselLabels[i]}))
        //   dsets.push(this.parser.createChartlyScatter(vesseldata.outliers, i, {label: this.vesselLabels[i]}))
        // });
        // this.createChart({
        //   axisType: this.parser.getAxisType(dsets),
        //   datasets: dsets,
        //   comparisonElt: this.data
        // })
      }
    })
  }

  parseRawData(rawScatterData: RawScatterData[]) {
    return rawScatterData.map((data) => {
      return data;
    });
  }
  
  createChart(args: ScatterArguments) {
    const dateService = this.dateService;
    const createNewLegendAndAttach = this.parser.createNewLegendAndAttach;
  }

  buildAxisFromType(Label: String, axisId: string) {
    return [{
      id: axisId,
      ticks: {
        beginAtZero: true,
      },
      scaleLabel: {
        display: true,
        labelString: Label
      }
    }];
  }

  reset() {
    this.chart.destroy();
  }

}



interface ScatterArguments {
  axisType: { x: string, y: string };
  datasets: LongtermScatterValueArray[];
  comparisonElt: ComprisonArrayElt;
  bins?: number[];
}

interface ScatterDataElt {
  x: number | Date;
  y: number | Date;
  key?: string;
  callback?: Function;
}


interface LegendEntryCallbackElement {
  // Number of dataset
  datasetIndex: number;
  // Label that will be displayed
  text: string;
  // Fill style of the legend box
  fillStyle: any;
  // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
  hidden: boolean;
  // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
  lineCap: string;
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
  lineDash: number[];
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
  lineDashOffset: number;
  // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
  lineJoin: string;
  // Width of box border
  lineWidth: number;
  // Stroke style of the legend box
  strokeStyle: any;
  // Point style of the legend box (only used if usePointStyle is true)
  pointStyle: string;
}
