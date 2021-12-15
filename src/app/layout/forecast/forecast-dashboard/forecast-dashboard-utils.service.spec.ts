import { Observable, of } from 'rxjs';
import { ForecastOperation } from '../models/forecast-response.model';

import { Client, ForecastDashboardUtilsService, viewModel } from './forecast-dashboard-utils.service';

describe('ForecastDashboardUtilsService', () => {
  let service: ForecastDashboardUtilsService;

  beforeEach(() => {
    service = new ForecastDashboardUtilsService()
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sortProductList', () => {
    it('should sort products based on clientId and active status', () => {
      const viewModel: viewModel[] = [
        { client_id: 1, active: true },
        { client_id: 1, active: false },
        { client_id: 2, active: false },
        { client_id: 2, active: true },
        { client_id: 2, active: false },
        { client_id: 1, active: true }] as viewModel[];

      const actual = service.sortProductList(viewModel)
      const expected = [
        { client_id: 1, active: true },
        { client_id: 1, active: true },
        { client_id: 2, active: true },
        { client_id: 1, active: false },
        { client_id: 2, active: false },
        { client_id: 2, active: false },
      ] as viewModel[]

      expect(actual).toEqual(expected)
    })
  })


  // testing observables: https://medium.com/angular-in-depth/how-to-test-observables-a00038c7faad
  describe('createViewModel()', () => {
    it('should return a list of products containing the client information', (done) => {
      const clientList$: Observable<Client[]> = of([{ id: 2, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[]);
      const productList$: Observable<ForecastOperation[]> = of([{ client_id: 2 }] as ForecastOperation[])

      const actual = service.createViewModel(clientList$, productList$)
      const expected = [
        {
          client_id: 2,
          client: {
            id: 2, name: 'alala'
          }
        }
      ] as viewModel[]

      actual.subscribe(result => {
        expect(result).toEqual(expected)
        done();
      })
    })

    it('should return a list of products containing the client with value undefined if client could not be matched', (done) => {
      const clientList$: Observable<Client[]> = of([{ id: 4, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[]);
      const productList$: Observable<ForecastOperation[]> = of([{ client_id: 2 }] as ForecastOperation[])

      const actual = service.createViewModel(clientList$, productList$)
      const expected = [
        {
          client_id: 2,
          client: undefined
        }
      ] as viewModel[]

      actual.subscribe(result => {
        expect(result).toEqual(expected)
        done();
      })
    })
  })

  describe('_createProjectsClientList()', () => {
    it('should return a list of products containing the client information', () => {
      const clientList: Client[] = [{ id: 2, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[];
      const productList: ForecastOperation[] = [{ client_id: 2 }] as ForecastOperation[]

      const actual = service._createProjectsClientList(productList, clientList)
      const expected = [
        {
          client_id: 2,
          client: {
            id: 2, name: 'alala'
          }
        }
      ] as viewModel[]

      expect(actual).toEqual(expected);
    })

    it('should return a list of products containing the client with value undifend if client could not be matched', () => {
      const clientList: Client[] = [{ id: 4, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[];
      const productList: ForecastOperation[] = [{ client_id: 2 }] as ForecastOperation[]

      const actual = service._createProjectsClientList(productList, clientList)
      const expected = [
        {
          client_id: 2,
          client: undefined
        }
      ] as viewModel[]

      expect(actual).toEqual(expected);
    })
  })

  describe('_getClient()', () => {
    it('should return a client if client in clientList can be matched to a certain product', () => {
      const clientList: Client[] = [{ id: 2, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[];
      const productList: ForecastOperation = { client_id: 2 } as ForecastOperation

      const actual = service._getClient(clientList, productList)
      const expected = { id: 2, name: 'alala' } as Client

      expect(actual).toEqual(expected);
    })

    it('should return undefined if client in clientList can not be matched to a certain product', () => {
      const clientList: Client[] = [{ id: 2, name: 'alala' }, { id: 3, name: 'loeloe' }] as Client[];
      const productList: ForecastOperation = { client_id: 10000 } as ForecastOperation

      const actual = service._getClient(clientList, productList)
      const expected = undefined;

      expect(actual).toEqual(expected);
    })
  })
});
