import { Injectable, Component } from '@angular/core';


@Injectable({
    providedIn: 'root',
})
export class AlertService {
    // To use this class, add the following code to your html, where alert is the name of the AlertService.
    // <ngb-alert *ngIf="alert.active" class="userCreateAlert" [type]="alert.type" (close)="alert.active=false">{{ alert.text }}</ngb-alert>
    active = false;
    text = '';
    type = '';
    timeout = 2000;

    private timeoutRef: NodeJS.Timeout = null;

    constructor() {
        // this.addHTMLCode();
    }

    sendAlert(opts: AlertOptions = {}) {
        const defaultOptions: AlertOptions = {
          text: '<No text provided>',
          type: 'success',
          timeout: this.timeout,
        };
        opts = {...defaultOptions, ...opts};
        if (this.timeoutRef) {
          clearTimeout(this.timeoutRef);
        }
        this.active = true;
        this.text = opts.text;
        this.type = opts.type;
        this.timeout = opts.timeout;
        this.timeoutRef = setTimeout(() => {
          this.active = false;
        }, this.timeout);
    }

    // private addHTMLCode() {
    //     const popupCode = '<ngb-alert display="true" class="userCreateAlert"' +
    //     '[type]="success" style="position: fixed;bottom: 0px;right:0px">Test</ngb-alert>';
    //     // document.body.append(popupCode);
    //     const node = document.createElement('div');
    //     node.innerHTML = popupCode;
    //     document.body.insertBefore(node, null);
    //     console.log(node)
    //     console.log(node.parentNode)
    // }
}


type AlertTypeOptions = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';
interface AlertOptions {
  text?: string;
  type?: AlertTypeOptions;
  timeout?: number;
}
