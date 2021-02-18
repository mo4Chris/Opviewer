import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ForecastOperation, ForecastResponseObject } from '../models/forecast-response.model';
import { ForecastResponseService } from '../models/forecast-response.service';
import { ForecastOperationSettings } from '../forecast-ops-picker/forecast-ops-picker.component'
import { ForecastMotionLimit } from '../models/forecast-limit';

@Component({
  selector: 'app-mo4-light',
  templateUrl: './mo4-light.component.html',
  styleUrls: ['./mo4-light.component.scss']
})
export class Mo4LightComponent implements OnInit, OnChanges {
    private client_id: number;
    private project_id: number;
    
    public showContent = false;
    public vessels: string[] = []; // Not used
    public operations: ForecastOperation[] = []; // Change to projects?
    public response: ForecastResponseObject;

    public ReponseTime: Date[];
    public Workability: number[][];
    public WorkabilityHeadings: number[];
    public WorkabilityAlongSelectedHeading: number[];

    public limits: ForecastMotionLimit[] = [];
    public selectedHeading = 112;
    public selectedOperation: ForecastOperation = null;
  
    public minForecastDate: YMD;
    public maxForecastDate: YMD;
    public startTime: number;
    public stopTime: number;
    public formattedDuration: string = 'N/a';
  
    constructor(
      private newService: CommonService,
      private dateService: DatetimeService,
      private routeService: RouterService,
      private responseService: ForecastResponseService,
      private matService: MatrixService,
      private route: ActivatedRoute,
    ) {
    }
  
    ngOnInit() {
      this.initRoute().subscribe(() => {
        this.loadData();
      });
    }

    ngOnChanges() {
    }

    initRoute() {
      return this.route.params.pipe(map(params => {
        if (!params.project_id) return this.routeService.routeToForecast();
        this.project_id = parseInt(params.project_id);
      }))
    }
  
    loadData() {
      // ToDo: only rerout if no permission to forecasting module
      forkJoin([
        this.newService.getForecastProjectList(),
        this.newService.getForecastVesselList(), // Tp
        this.newService.getForecastWorkabilityForProject(this.project_id),
      ]).subscribe(([projects, vessels, responses]) => {
        this.vessels = vessels;
        this.response = responses[0];
        this.operations = projects;
        this.showContent = true;
        if (this.response) {
          let responseTimes = this.response.response.Points_Of_Interest.P1.Time;
          this.minForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[0]);
          this.maxForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[responseTimes.length-1]);

          const currentOperation = this.operations.find(op => op.id == this.project_id);
          this.limits = this.responseService.setLimitsFromOpsPreference(currentOperation);

          this.parseResponse();
        } else {
          this.response = null;
          this.Workability = null;
          this.limits = [];
        }
      }, error => {
        this.routeService.routeToAccessDenied();
      })
    }
  
  
    routeToProject(project_id: number) {
      this.routeService.routeToForecast(project_id);
    }
  
    onProjectSettingsChange(settings: ForecastOperationSettings) {
      this.startTime = settings.startTime;
      this.stopTime = settings.stopTime;
      this.setWorkabilityAlongHeading();
    }

    parseResponse() {
      if (!this.response || this.limits.length==0) return this.Workability = null;
      const POI = this.response.response.Points_Of_Interest.P1;
      const response = POI.Response;
      this.ReponseTime = POI.Time.map(matlabtime => this.dateService.matlabDatenumToDate(matlabtime));
      this.WorkabilityHeadings = POI.Heading;
      const limiters = this.limits.map(limit => {
        return this.responseService.computeLimit(response[limit.type], limit.dof, limit.value)
      })
      this.Workability = this.matService.scale(
        this.matService.transpose(
          this.responseService.combineWorkabilities(limiters)
        ),
        100
      );
      this.setWorkabilityAlongHeading();
    }

    setWorkabilityAlongHeading() {
      console.log('UPDATING WORKABILITY')
      const POI = this.response.response.Points_Of_Interest.P1;
      let headingIdx = this.getHeadingIdx(POI.Heading);
      this.WorkabilityAlongSelectedHeading = this.Workability[headingIdx]
    }
  
    getHeadingIdx(headings: number[]): number {
      let d = 360;
      let hIdx = null;
      headings.forEach((h, i) => {
        let dist = Math.abs(h - this.selectedHeading);
        if (dist < d) {
          hIdx = i;
          d = dist;
        }
      })
      return hIdx;
    }
  }
  
  interface YMD {
    year: number;
    month: number;
    day: number;
  }