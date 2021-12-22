import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { forkJoin, Observable } from 'rxjs';
import { ForecastOperation } from '../forecast/models/forecast-response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LicenceTypeDialogComponent } from './licence-type-dialog/licence-type-dialog.component';
import { map } from 'rxjs/operators';
import { orderBy } from 'lodash';
@Component({
  selector: 'app-client-overview',
  templateUrl: './client-overview.component.html',
  styleUrls: ['./client-overview.component.scss'],
})
export class ClientOverviewComponent implements OnInit {
  clients: Client[] = [];
  clients$: Observable<ForecastClient[] & AdminClient[]>;

  constructor(
    private newService: CommonService,
    public permission: PermissionService,
    public alert: AlertService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.clients$ = this.fetchData()
  }

  openLicenceChangeDialog(client) {
    const modalRef = this.modalService.open(LicenceTypeDialogComponent, { size: 'sm', centered: true });
    modalRef.componentInstance.fromParent = client;
    modalRef.result.then((result) => {
      if (result.type === 'succes') {
        this.alert.sendAlert({ text: result.message, type: 'success' });
        this.clients$ = this.fetchData()
      }
      if (result.type === 'error') {
        this.alert.sendAlert({ text: result.message, type: 'danger' });
      }
    }, () => { })
  }

  fetchData() {
    return forkJoin([
      this.newService.getClientList(),
      this.newService.getForecastClientList()
    ]).pipe(
      map(([admin, forecast]: [AdminClient[], ForecastClient[]]) => {
        const clientList: any = admin.map(_client => {
          const fc = forecast.find(_f => _f.id == _client.forecast_client_id)
          return {
            ..._client,
            name: _client.client_name,
            forecast_client_id: fc == null ? -1 : _client.forecast_client_id,
          }
        })
        forecast.forEach(_f => {
          const match = admin.find(_client => _f.id == _client.forecast_client_id)
          if (match != null) return;
          clientList.push({
            ..._f,
            name: _f.name,
            client_id: null,
            forecast_client_id: _f.id
          })
        });
        return clientList
      }), map(data => {
        return orderBy(data, ['name'])
      })
    )
  }
}


type IsoString = string;
export interface Client {
  name: string;
  client_id: number;
  forecast_client_id: number;
  client_permissions: ClientPermissionType
}

type ClientPermissionType = {
  licenceType: string
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
