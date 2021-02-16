import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dof6, DofType, ForecastLimit, ForecastOperation, ForecastResponseObject } from '../models/forecast-response.model';
import { ForecastResponseService } from '../models/forecast-response.service';
  

@Component({
  selector: 'app-mo4-light',
  templateUrl: './mo4-light.component.html',
  styleUrls: ['./mo4-light.component.scss']
})
export class Mo4LightComponent implements OnInit {
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

    public limits: ForecastLimit[] = [{type: 'Disp', dof: 'Heave', value: 1.2}];
    public selectedHeading = 112;
    public selectedOperation: ForecastOperation = null;
  
    public startTimeInput = {hour: null, mns: null}
    public stopTimeInput = {hour: null, mns: null}
    public date = null;
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

    initRoute() {
      return this.route.params.pipe(map(params => {
        if (!params.project_id) return this.routeService.routeToForecast();
        this.project_id = parseInt(params.project_id);
      }))
    }
  
    loadData() {
      // ToDo: we should only get the project list once
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
          this.date = this.dateService.matlabDatenumToYMD(responseTimes[0]);
          this.minForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[0]);
          this.maxForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[responseTimes.length-1]);
          this.parseResponse();
        }
      })
    }
  
    setLimitsFromOpsPreference(op: ForecastOperation) {
      // Service?
      this.limits = [];
      let dofPreference = op.client_preferences.Points_Of_Interest.P1.Degrees_Of_Freedom;
      for (let dof in Object.keys(dofPreference)) {
        for (let type in Object.keys(dofPreference[dof])) {
          let tf = dofPreference[dof][type];
          if (tf) {
            this.limits.push({
              dof: dof as Dof6,
              type: type as DofType,
              value: 1,
            })
          }
        }
      }
    }
  
    routeToProject(project_id: number) {
      this.routeService.routeToForecast(project_id);
    }
  
    onTimeChange() {
      if ( this.date
        && inRange(this.startTimeInput.hour, 0, 24)
        && inRange(this.startTimeInput.mns, 0, 59)
        && inRange(this.stopTimeInput.hour, 0, 24)
        && inRange(this.stopTimeInput.mns, 0, 59)
      ) {
        const matlabDate = this.dateService.ngbDateToMatlabDatenum(this.date);
        this.startTime = matlabDate + this.startTimeInput.hour/24 +this.startTimeInput.mns/24/60;
        this.stopTime = matlabDate + this.stopTimeInput.hour/24 +this.stopTimeInput.mns/24/60;
        const duration = this.stopTime - this.startTime;
        this.formattedDuration = this.dateService.formatMatlabDuration(duration)
      }
    }

    parseResponse() {
      if (this.response) {
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
        let headingIdx = this.getHeadingIdx(POI.Heading);
        // this.workabilityAlongSelectedHeading = this.workability.map(row => row[headingIdx]);
        this.WorkabilityAlongSelectedHeading = this.Workability[headingIdx]
      } else {
        this.Workability = null
      }
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
  
  function inRange(num: number, min: number, max: number) {
    return typeof(num) == 'number'
      && num >= min
      && num <= max
  }
  
  interface YMD {
    year: number;
    month: number;
    day: number;
  }