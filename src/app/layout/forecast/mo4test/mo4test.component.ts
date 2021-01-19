import { Component, OnInit } from '@angular/core';
import { _def } from '@angular/core/src/view/provider';
import { CommonService } from '@app/common.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mo4test',
  templateUrl: './mo4test.component.html',
  styleUrls: ['./mo4test.component.scss']
})
export class Mo4testComponent implements OnInit {
  selectedVesselId = 1;
  vessels = [];

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
    ).subscribe(([users, clients, projects, vessels]) => {
      console.log(users)
      console.log(clients)
      console.log(projects)
      console.log(vessels)
      this.vessels = vessels;
    })
  }


  onChange() {
    console.log('Callback on change :)')
  }
}
