import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }

  OpenAgmInfoWindow(infoWindow, gm) {
    if (gm.lastOpen != null) {
      gm.lastOpen.close();
    }
  
    gm.lastOpen = infoWindow;
    infoWindow.open();
  }

  CloseAgmInfoWindow(infoWindow) {
    if(infoWindow != null) {
      infoWindow.close();
    }
  }

}
