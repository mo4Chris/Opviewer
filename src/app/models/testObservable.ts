import { defer, Observable, of } from 'rxjs';

export function mockedObservable(data: any): Observable<any> {
    return of(data);
}

export function mockedPromise(data: any): Promise<any> {
    return Promise.resolve(data)
}