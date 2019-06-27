import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  previous;

  constructor() { }

  OpenAgmInfoWindow(infoWindow, gm, map = null, marker = null) {
    if (this.previous) {
      this.closeLatestAgmInfoWindow();
    }
    this.previous = infoWindow;
    gm.lastOpen = infoWindow;
    if (map) {
      infoWindow.open(map, marker);
    } else {
      infoWindow.open();
    }
  }

  CloseAgmInfoWindow(infoWindow) {
    if (infoWindow !== undefined) {
      infoWindow.close();
      infoWindow = undefined;
    }
  }

  closeLatestAgmInfoWindow() {
    if (this.previous !== undefined) {
      this.previous.close();
      this.previous = undefined;
    }
  }
}
