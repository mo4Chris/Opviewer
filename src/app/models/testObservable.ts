import { defer, Observable, of } from "rxjs";

export function mockedObservable(data: any): Observable<any> {
    return of(data);
}
