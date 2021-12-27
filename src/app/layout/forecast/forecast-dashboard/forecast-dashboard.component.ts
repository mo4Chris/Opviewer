import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { RouterService } from '@app/supportModules/router.service';
import { Observable } from 'rxjs';
import { ForecastOperation } from '../models/forecast-response.model';
import { ForecastDashboardUtilsService, viewModel } from './forecast-dashboard-utils.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-forecast-dashboard',
  templateUrl: './forecast-dashboard.component.html',
  styleUrls: ['./forecast-dashboard.component.scss']
})

export class ForecastDashboardComponent implements OnInit {
  viewModel$: Observable<viewModel[] | ForecastOperation[]>;
  isAdmin: boolean;

  constructor(
    public routerService: RouterService,
    private newService: CommonService,
    public permission: PermissionService,
    private forecastDashboardUtilsService: ForecastDashboardUtilsService
  ) { }

  ngOnInit() {
    this.isAdmin = this.permission.admin
    const clientList$ = this.newService.getForecastClientList();
    const forecastOperationList$ = this.newService.getForecastProjectList();
    const viewModel$ = this.isAdmin ? this.forecastDashboardUtilsService.createViewModel(clientList$, forecastOperationList$) : forecastOperationList$
    this.viewModel$ = viewModel$.pipe(map(this.forecastDashboardUtilsService.sortProductList))
  }

  onEditUsers() {
    console.error('Not yet implemented!');
  }

  routeToProjectOverview(project_name: string) {
    this.routerService.routeToForecastProjectOverview(project_name);
  }

  routeToProject(project_id: number) {
    this.routerService.routeToForecast(project_id);
  }
}

