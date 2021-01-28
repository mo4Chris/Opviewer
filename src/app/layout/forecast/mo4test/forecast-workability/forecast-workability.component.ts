import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { ForecastLimit, ForecastResponseObject } from '../../models/forecast-response.model';
import { ForecastResponseService } from '../../models/forecast-response.service';

@Component({
  selector: 'app-forecast-workability',
  templateUrl: './forecast-workability.component.html',
  styleUrls: ['./forecast-workability.component.scss']
})
export class ForecastWorkabilityComponent implements OnChanges {
  @Input() response: ForecastResponseObject;
  @Input() heading: number = 0;
  @Input() limits: ForecastLimit[]
  public workability: number[][];
  public workabilityAlongSelectedHeading: number[];
  public time: Date[];
  public workabilityHeadings: number[];

  constructor(
    private responseService: ForecastResponseService,
    private dateService: DatetimeService,
    private matService: MatrixService,
  ) { }

  ngOnChanges() {
    if (this.response) {
      const POI = this.response.response.Points_Of_Interest.P1;
      const response = POI.Response;
      this.time = POI.Time.map(matlabtime => this.dateService.MatlabDateToUnixEpochViaDate(matlabtime));
      this.workabilityHeadings = POI.Heading;
      const limiters = this.limits.map(limit => {
        return this.responseService.computeLimit(response[limit.type], limit.dof, limit.value)
      })
      this.workability = this.matService.scale(
        this.matService.transpose(
          this.responseService.combineWorkabilities(limiters)
        ),
        100
      );
      let headingIdx = this.getHeadingIdx(POI.Heading);
      // this.workabilityAlongSelectedHeading = this.workability.map(row => row[headingIdx]);
      this.workabilityAlongSelectedHeading = this.workability[headingIdx]
    }
  }

  getHeadingIdx(headings: number[]) {
    let d = 360;
    let hIdx = null;
    headings.forEach((h, i) => {
      let dist = Math.abs(h - this.heading);
      if (dist < d) {
        hIdx = i;
        d = dist;
      }
    })
    return hIdx;
  }
}
