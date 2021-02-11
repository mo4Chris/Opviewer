import { Injectable, Component } from '@angular/core';


const DEFAULT_TIMEOUT = 7000;
const DEFAULT_ERROR_TIMEOUT = 20000;

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    active = false;
    text = '';
    type: AlertTypeOptions = 'success';
    timeout = DEFAULT_TIMEOUT;

    private timeoutRef = null;

    constructor() {
        // this.addHTMLCode();
    }

    sendAlert(opts: AlertOptions = {}) {
        const defaultOptions: AlertOptions = {
          text: '<No text provided>',
          type: 'success',
          timeout: (opts.type == 'danger') ? DEFAULT_ERROR_TIMEOUT : this.timeout,
        };
        opts = {...defaultOptions, ...opts};
        if (this.timeoutRef) {
          clearTimeout(this.timeoutRef);
        }
        if (opts.type === 'danger' || !this.active) {
          this.changeAlert(opts);
        } else if (this.type === 'danger') {
          // Do nothing
        } else if (opts.type === 'warning') {
          this.changeAlert(opts);
        } else if (this.type === 'warning') {
          // Do nothing
        } else {
          this.changeAlert(opts);
        }
    }

    private changeAlert(opts: AlertOptions) {
      this.active = true;
      this.text = opts.text;
      this.type = opts.type;
      this.timeout = opts.timeout;
      this.timeoutRef = setTimeout(() => {
        this.active = false;
      }, this.timeout);
    }
}


type AlertTypeOptions = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';
interface AlertOptions {
  text?: string;
  type?: AlertTypeOptions;
  timeout?: number;
}
