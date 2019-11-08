import { defer } from "rxjs";


export function mockedObservable(data: any) {
    return defer(() => Promise.resolve(data));
}
