import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { ForecastResponseObject } from '../../models/forecast-response.model';
import { ForecastReponseService } from '../../models/forecast-response.service';
import { ForecastLimits } from '../mo4test.component';

@Component({
  selector: 'app-forecast-workability',
  templateUrl: './forecast-workability.component.html',
  styleUrls: ['./forecast-workability.component.scss']
})
export class ForecastWorkabilityComponent implements OnChanges {
  @Input() response: ForecastResponseObject;
  @Input() heading: number = 0;
  @Input() limits: ForecastLimits[]
  public workability: number[][];
  public workabilityAlongSelectedHeading: number[];
  public time: Date[];
  public workabilityHeadings: number[];

  constructor(
    private responseService: ForecastReponseService,
    private dateService: DatetimeService,
    private matService: MatrixService,
  ) { }

  ngOnChanges() {
    // WooHoo
    if (this.response) {
      console.log("Forecast workability changed")
      const POI = this.response.response.Points_Of_Interest.P1;
      const response = POI.Response;
      console.log(POI)
      this.time = POI.Time.map(matlabtime => this.dateService.MatlabDateToUnixEpochViaDate(matlabtime));
      this.workabilityHeadings = POI.Heading;
      const limiters = this.limits.map(limit => {
        return this.responseService.computeLimit(response[limit.type], limit.dof, limit.value)
      })
      this.workability = this.matService.scale(
        this.matService.transpose(
          this.responseService.combineWorkabilities(limiters)
        )
      , 100);
      console.log(this)
    }
  }

}
