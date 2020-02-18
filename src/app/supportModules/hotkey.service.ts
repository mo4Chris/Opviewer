import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DOCUMENT, EventManager } from '@angular/platform-browser';

interface Options {
    keys: string;  // Keys on which the shortcut triggers
    element?: any;  // Element on which the shortcut is active when triggered
    preventDefault?: boolean; // prevents any other callbacks that would trigger via the hotkey by default
}

// Example: hotkey.addShortcut({keys: 'control.p'})

@Injectable({ providedIn: 'root' })
export class Hotkeys {
    defaults: Partial<Options> = {
        element: this.document,
        preventDefault: true,
    };

    constructor(
      private eventManager: EventManager,
      @Inject(DOCUMENT) private document: Document
    ) {}

    addShortcut(options: Partial<Options>): Observable<KeyboardEvent> {
        const merged = { ...this.defaults, ...options };
        const event = `keydown.${merged.keys}`;

        return new Observable (observer => {
            const handler = (e) => {
                if (merged.preventDefault) {
                    e.preventDefault();
                }
                observer.next(e);
            };

            const dispose = this.eventManager.addEventListener(
                merged.element, event, handler
            );

            return () => {
                dispose();
            };
        });
    }
}
