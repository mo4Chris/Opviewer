import { Component, OnInit } from '@angular/core';
import { _def } from '@angular/core/src/view/provider';
import { CommonService } from '@app/common.service';
import { forkJoin } from 'rxjs';
import { Dof6, ForecastResponseObject } from '../models/forecast-response.model';

type ForecastType = 'Disp' | 'Vel' | 'Acc'
export interface ForecastLimits {
  type: ForecastType,
  dof: Dof6,
  value: number
}

@Component({
  selector: 'app-mo4test',
  templateUrl: './mo4test.component.html',
  styleUrls: ['./mo4test.component.scss']
})
export class Mo4testComponent implements OnInit {
  selectedVesselId = 1;
  public vessels: string[] = [];
  public response: ForecastResponseObject;
  public limits: ForecastLimits[] = [{type: 'Disp', dof: 'heave', value: 1.2}]

  constructor(
    private newService: CommonService,
  ) {
    console.log('INIT MO4 LIGHT TEST COMPONENT')
  }

  ngOnInit() {
    // this.newService.getForecastConnectionTest().subscribe(test => {
    //   console.log(test)
      
    // })
    this.loadData()
  }

  loadData() {
    forkJoin(
      this.newService.getForecastUserList(),
      this.newService.getForecastClientList(),
      this.newService.getForecastProjectList(),
      this.newService.getForecastVesselList(),
      this.newService.getForecastWorkabilityForProject(3),
    ).subscribe(([users, clients, projects, vessels, responses]) => {
      console.log(users)
      console.log(clients)
      console.log(projects)
      console.log(vessels)
      console.log(responses[0])
      this.vessels = vessels;
      this.response = responses[0];
    })
  }


  onChange() {
    console.log('Callback on change :)')
  }
}
