import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  previous;

  constructor() { }

  OpenAgmInfoWindow(infoWindow, gm) {
    if (this.previous) {
      this.CloseLatestAgmInfoWindow();
    }
    this.previous = infoWindow;

    gm.lastOpen = infoWindow;
    infoWindow.open();
  }

  CloseAgmInfoWindow(infoWindow) {
    if (infoWindow !== undefined) {
      infoWindow.close();
      infoWindow = undefined;
    }
  }

  CloseLatestAgmInfoWindow() {
    if (this.previous !== undefined) {
      this.previous.close();
      this.previous = undefined;
    }
  }
}
