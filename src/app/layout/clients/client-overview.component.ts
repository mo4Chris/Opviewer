import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { forkJoin } from 'rxjs';
import { ForecastOperation } from '../forecast/models/forecast-response.model';
import { type } from 'node:os';

@Component({
  selector: 'app-client-overview',
  templateUrl: './client-overview.component.html',
  styleUrls: ['./client-overview.component.scss'],
  animations: [routerTransition()]
})
export class ClientOverviewComponent implements OnInit {
  clients: Client[] = [];

  constructor(
    private newService: CommonService,
    public permission: PermissionService,
    public alert: AlertService,
  ) { }

  ngOnInit() {
    forkJoin([
      this.newService.getClientList(),
      this.newService.getForecastClientList()
    ]).subscribe(([admin, forecast]: [AdminClient[], ForecastClient[]]) => {
      this.clients = admin.map(_client => {
        const fc = forecast.find(_f => _f.id == _client.forecast_client_id)
        console.log('fc', fc)
        return {
          name: _client.client_name,
          client_id: _client.client_id,
          forecast_client_id: fc == null ? -1 : _client.forecast_client_id,
        }
      });
      forecast.forEach(_f => {
        const match = admin.find(_client => _f.id == _client.forecast_client_id)
        if (match != null) return;
        this.clients.push({
          name: _f.name,
          client_id: null,
          forecast_client_id: _f.id
        })
      });
    })
  }

}

type IsoString = string;
interface Client {
  name: string;
  client_id: number;
  forecast_client_id: number;
}
interface AdminClient {
  client_name: string;
  client_id: number;
  forecast_client_id: number;
  client_children: any;
  client_permissions: any;
}
interface ForecastClient {
  id: number;
  name: "Demo";
  projects: ForecastOperation[];
  start_date: IsoString;
  end_date: IsoString;
}
