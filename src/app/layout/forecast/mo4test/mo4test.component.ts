import { Component, OnChanges, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Dof6, DofType, ForecastLimit, ForecastOperation, ForecastResponseObject } from '../models/forecast-response.model';


@Component({
  selector: 'app-mo4test',
  templateUrl: './mo4test.component.html',
  styleUrls: ['./mo4test.component.scss']
})
export class Mo4testComponent implements OnInit, OnChanges {
  client_id = 2; // This should be made dynamic
  
  selectedVesselId = 1;
  private users;
  private clients;
  public showContent = false;
  public vessels: string[] = [];
  public operations: ForecastOperation[] = [];
  public response: ForecastResponseObject;
  public limits: ForecastLimit[] = [{type: 'Disp', dof: 'Heave', value: 1.2}]
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
    private calcService: CalculationService,
  ) {
  }

  ngOnInit() {
    this.loadData()
  }

  ngOnChanges() {
  }

  loadData() {
    forkJoin([
      this.newService.getForecastUserList(),
      this.newService.getForecastClientList(),
      this.newService.getForecastProjectList(),
      this.newService.getForecastVesselList(),
      this.newService.getForecastWorkabilityForProject(3),
      this.newService.getForecastProjectsForClient(this.client_id),
    ]).subscribe(([users, clients, projects, vessels, responses, client_projects]) => {
      this.users = users;
      this.clients = clients;
      this.vessels = vessels;
      this.response = responses[0];
      this.operations = projects;
      this.showContent = true;
      if (this.response) {
        let responseTimes = this.response.response.Points_Of_Interest.P1.Time;
        this.date = this.dateService.matlabDatenumToYMD(responseTimes[0]);
        this.minForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[0]);
        this.maxForecastDate = this.dateService.matlabDatenumToYMD(responseTimes[responseTimes.length-1]);
      }
    })
  }

  setLimitsFromOpsPreference(op: ForecastOperation) {
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