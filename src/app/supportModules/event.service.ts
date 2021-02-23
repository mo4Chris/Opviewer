import { AgmInfoWindow } from '@agm/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  Previous: AgmInfoWindow;

  constructor() {
  }

  openAgmInfoWindow(infoWindow: AgmInfoWindow | any, gm: AgmMapHtmlReference | any, map: google.maps.Map = null, marker: google.maps.Marker = null) {
    if (this.Previous) {
      this.closeLatestAgmInfoWindow();
    }
    this.Previous = infoWindow;
    gm.lastOpen = infoWindow;
    if (map) {
      infoWindow.open(map, marker);
    } else {
      infoWindow.open();
    }
  }

  closeAgmInfoWindow(infoWindow) {
    if (infoWindow !== undefined) {
      infoWindow.close();
      infoWindow = undefined;
    }
  }

  closeLatestAgmInfoWindow() {
    if (this.Previous !== undefined) {
      this.Previous.close();
      this.Previous = undefined;
    }
  }
}

interface AgmMapHtmlReference {
  lastOpen: AgmInfoWindow;
}
