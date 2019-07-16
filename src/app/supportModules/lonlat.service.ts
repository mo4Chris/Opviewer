import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class LonlatService {

    lonlatarrayToLatLngArray(input) {
        const latlngArray: Array<google.maps.LatLng> = [];
        let latlng;
        input.lon.forEach((lon, index) => {
            if (input.lat[index][0]) {
                latlng = {
                    lat: input.lat[index][0],
                    lng: lon[0]
                };
            } else {
                    latlng = {
                        lat: input.lat[index],
                        lng: lon
                    };
            }
            latlngArray.push(latlng);
        });
        return latlngArray;
    }
  }
