import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StringMutationService {

    constructor() { }

    changeToNicename(name) {
        if (name && name != '') {
            if (isNaN(name)) {
                return name.replace(/_/g, ' ');
            }
            return name;
        } else {
            return '-';
        }
    }

    humanize(str) {
        let frags = str.split('_');
        for (let i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    }
}
