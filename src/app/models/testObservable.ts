import { defer, Observable, of } from 'rxjs';

export function mockedObservable<inputType extends any> (data: inputType): Observable<inputType> {
    return of(data);
}

export function mockedPromise<inputType extends any>(data: inputType): Promise<inputType> {
    return Promise.resolve(data);
}
