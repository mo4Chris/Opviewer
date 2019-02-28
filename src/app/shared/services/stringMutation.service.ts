import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StringMutationService {

    constructor() { }

    changeToNicename(name, capitalize = false) {
        if (name && name != '') {
            if (isNaN(name)) {
                let frags = name.split('_');
                if(capitalize){
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
}
