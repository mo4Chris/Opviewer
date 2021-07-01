import { Injectable, Component, NgZone } from '@angular/core';
import { isString } from '@ng-bootstrap/ng-bootstrap/util/util';


const DEFAULT_TIMEOUT = 7000;
const DEFAULT_ERROR_TIMEOUT = 20000;

@Injectable({
    providedIn: 'root',
})
export class AlertService {
  active = false;
  text = '';
  type: AlertTypeOptions;
  timeout = DEFAULT_TIMEOUT;

  private timeoutRef: NodeJS.Timeout = null;

  constructor(
    private ngZone: NgZone
  ) {
  }

  sendAlert(opts: AlertOptions = {text: 'Missing alert message'}) {
      const defaultOptions: AlertOptions = {
        text: '<No text provided>',
        type: 'success',
        timeout: (opts.type === 'danger') ? DEFAULT_ERROR_TIMEOUT : this.timeout,
      };
      opts = {...defaultOptions, ...opts};
      if (opts.type === 'danger' || !this.active) {
        this.changeAlert(opts);
      } else if (this.type === 'danger') {
        return;
      } else if (opts.type === 'warning') {
        this.changeAlert(opts);
      } else if (this.type === 'warning') {
        return;
      } else {
        this.changeAlert(opts);
      }
  }

  clear() {
    if (this.timeoutRef) { clearTimeout(this.timeoutRef); }
    this.timeoutRef = null;
    this.active = false;
  }

  private changeAlert({text, type, timeout}: AlertOptions) { // Destructuring
    if (this.timeoutRef) { clearTimeout(this.timeoutRef); }
    this.active = true;
    this.text = this._formatText(text);
    this.type = type;
    this.timeout = timeout;
    if (timeout) {
      this.ngZone.runOutsideAngular(() => {
        this.timeoutRef = setTimeout(() => {
          this.active = false;
        }, this.timeout);
      })
    }
  }

  private _formatText(text: string | Error | {err: string} | {error: string}): string {
    if (typeof text == 'string') return text;
    if (typeof text  == 'object') {
      if (typeof text['error'] == 'string') return text['error'];
      if (typeof text['err'] == 'string') return text['err'];
      if (typeof text['message'] == 'string') return text['message'];
    }
    return 'Unknown message'
  }
}


type AlertTypeOptions = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';
interface AlertOptions {
  text: any;
  type?: AlertTypeOptions;
  timeout?: number;
}
