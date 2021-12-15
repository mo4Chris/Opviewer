import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ForecastOperation } from '../models/forecast-response.model';
import { orderBy } from 'lodash'

export interface Client {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  consumer_id: number;
}

export type viewModel = ForecastOperation & {
  client: Client;
}


@Injectable()

export class ForecastDashboardUtilsService {

  sortProductList(viewModel: viewModel[]): viewModel[]{
    return orderBy(viewModel, ['active', 'client_id'], ['desc', 'asc'])
    
  }

  createViewModel(clientList$: Observable<Client[]>, forecastOperationList$: Observable<ForecastOperation[]>): Observable<viewModel[]> {
    return forkJoin([
      forecastOperationList$,
      clientList$,
    ]).pipe(
      map(([forecastOperationList, clientList]) => {
        return this._createProjectsClientList(forecastOperationList, clientList)
      })
    )
  }

  _createProjectsClientList(forecastOperations: ForecastOperation[], clientList: Client[]): viewModel[] {
    return forecastOperations.map(forecastOperation => {
      return {
        ...forecastOperation,
        client: this._getClient(clientList, forecastOperation)
      }
    })
  }

  _getClient(clientList: Client[], forecastOperation: ForecastOperation): Client {
    return clientList.find(client => {
      return `${forecastOperation.client_id}` === `${client.id}`
    })
  }
}
