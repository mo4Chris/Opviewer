import { Component, OnChanges, OnInit } from '@angular/core';
import { _def } from '@angular/core/src/view/provider';
import { CommonService } from '@app/common.service';
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

  constructor(
    private newService: CommonService,
  ) {
  }

  ngOnInit() {
    this.loadData()
  }

  ngOnChanges() {
  }

  loadData() {
    console.log('Start loading...')
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
}
