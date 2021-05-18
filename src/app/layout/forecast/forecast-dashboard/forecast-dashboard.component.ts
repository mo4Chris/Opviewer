import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
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

  constructor(
    public routerService: RouterService,
    private newService: CommonService,
    public permission: PermissionService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.permission.admin) {
      return forkJoin([
        this.newService.getForecastClientList(),
        this.newService.getForecastProjectList(),
      ]).subscribe(([clients, projects]) => {
        this.clients = clients;
        this.projects = projects;
      });
    }
    forkJoin([
      this.newService.getForecastProjectList(),
    ]).subscribe(([projects]) => {
      this.projects = projects;
    });
  }

  onEditUsers(client: Client) {
    console.error('Not yet implemented!');
  }

  routeToProjectOverview(project_name: string) {
    this.routerService.routeToForecastProjectOverview(project_name);
  }
  routeToProject(project_id: number) {
    this.routerService.routeToForecast(project_id);
  }
  public getClient(client_id: number) {
    const client = this.clients.find(c => c.id == client_id);
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
