import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StringMutationService {

    constructor() { }

    changeToNicename(name, capitalize = false) {
        if (name && name != '') {
            if (isNaN(name)) {
                const frags = name.split('_');
                if (capitalize) {
                    for (let i = 0; i < frags.length; i++) {
                        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                    }
                }
                return frags.join(' ');
            }
            return name;
        }
        return '-';
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        if (!a) {
            return -1 * (isAsc ? 1 : -1);
        } else if (!b) {
            return 1 * (isAsc ? 1 : -1);
        }
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
