import { Injectable } from '@angular/core';
import * as L from "leaflet";
import { DatetimeService } from '@app/supportModules/datetime.service';

@Injectable({
  providedIn: 'root'
})
export class OsmGenerateIconsService {

  constructor(
    private dateTimeService: DatetimeService,
  ) { }

  getCorrectColorIcon(timestamp) {
    const lastUpdatedHours = this.dateTimeService.hoursSinceTimeString(timestamp);
    const color = lastUpdatedHours < 1 ? 'grn' : lastUpdatedHours < 6 ? 'ylw' : 'red'

    return L.icon({
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      iconUrl: `assets/images/${color}-circle.png`
    })
  }

  getCorrectSmallIcon(icon) {

    return L.icon({
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      iconUrl: `assets/images/${icon}.png`
    })
  }

  getMarkerClustererIcon(clustererIcon) { 
    return {
      iconCreateFunction: function (cluster) {
        const icon = L.divIcon({
          iconSize: [0, 0],
          iconAnchor: [16, 16],
          html: `<div style="
          width: 32px;
          height: 32px;
          line-height: 32px;
          background-image: url('http://localhost:4200/assets/clusterer/${clustererIcon}.png');
          background-size: cover; 
          text-align: center;
      ">` + cluster.getChildCount() + '</div>'
        });
        return icon;
      }
    }
  }

}
