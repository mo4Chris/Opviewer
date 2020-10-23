/// <reference types="@types/googlemaps" />
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LonlatService {

    lonlatarrayToLatLngArray(input: { lon: any[], lat: any[], time?: any[] }): latlngArrayModel {
        const latlngArray: latlngArrayModel = [];
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
        if (input.time) {
            input.time.forEach((t, i) => {
                latlngArray[i].time = t[0] || t
            })
        }
        return latlngArray;
    }


    // Geo functions functions
    latlngdist(from: { lat: number, lng: number }, to: { lat: number, lng: number }) {
        // Returns distance between 2 latlng points in km
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(to.lat - from.lat);  // deg2rad below
        var dLon = deg2rad(to.lng - from.lng);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(from.lat)) * Math.cos(deg2rad(to.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    latlngcentroid(google_latlngs: { lat: number, lng: number }[]) {
        var latXTotal = 0;
        var latYTotal = 0;
        var lonDegreesTotal = 0;
        var currentLatLong: { lat: number, lng: number };
        for (var i = 0; currentLatLong = google_latlngs[i]; i++) {
            var latDegrees = currentLatLong.lat;
            var lonDegrees = currentLatLong.lng;

            var latRadians = Math.PI * latDegrees / 180;
            latXTotal += Math.cos(latRadians);
            latYTotal += Math.sin(latRadians);
            lonDegreesTotal += lonDegrees;
        }

        var finalLatRadians = Math.atan2(latYTotal, latXTotal);
        var finalLatDegrees = finalLatRadians * 180 / Math.PI;
        var finalLonDegrees = lonDegreesTotal / google_latlngs.length;
        return { lat: finalLatDegrees, lng: finalLonDegrees };
    }
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

type latlngArrayModel = { lat: number, lng: number, time?: number }[];

