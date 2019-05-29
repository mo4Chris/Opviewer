import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  previous;

  constructor() { }

  OpenAgmInfoWindow(infoWindow, gm) {
    console.log(infoWindow)
    console.log(gm)
    if (this.previous) {
      this.closeLatestAgmInfoWindow();
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

  closeLatestAgmInfoWindow() {
    if (this.previous !== undefined) {
      this.previous.close();
      this.previous = undefined;
    }
  }
}
