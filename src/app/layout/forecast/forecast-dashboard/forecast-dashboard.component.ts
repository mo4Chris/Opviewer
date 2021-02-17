import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { RouterService } from '@app/supportModules/router.service';
import { forkJoin } from 'rxjs';
import { ForecastOperation } from '../models/forecast-response.model';

@Component({
  selector: 'app-forecast-dashboard',
  templateUrl: './forecast-dashboard.component.html',
  styleUrls: ['./forecast-dashboard.component.scss']
})
export class ForecastDashboardComponent implements OnInit {
  public projects: ForecastOperation[];
  public clients: Client[];
  public users: any[];

  constructor(
    public routerService: RouterService,
    private newService: CommonService,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin([
      this.newService.getForecastClientList(),
      this.newService.getForecastProjectList(),
      this.newService.getForecastUserList(),
    ]).subscribe(([clients, projects, users]) => {
      this.clients = clients;
      this.projects = projects;
      this.users = users;
    });
  }

  onEditUsers(client: Client) {
    console.error('Not yet implemented!')
  }

  routeToProjectOverview(project_id: number) {
    this.routerService.routeToForecastProjectOverview(project_id);
  }
  routeToProject(project_id: number) {
    this.routerService.routeToForecast(project_id);
  }
  public getClient(client_id: number) {
    const client = this.clients.find(c => c.id == client_id)
    return client ? client.name : 'N/a';
  }
}


interface Client {
  id: number;
  name: string;
  start_date: TimeString;
  end_date: TimeString;
  consumer_id: number;
}

type TimeString = string;