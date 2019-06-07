import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class LonlatService{
    
    lonlatarrayToLatLngArray(input){
        var latlngArray: Array<google.maps.LatLng> = [];
        var latlng;
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
                    }
            };
            latlngArray.push(latlng);
        });
        return latlngArray
    }
  }