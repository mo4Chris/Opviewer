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
                latlngArray[i].time = t[0] || t;
            });
        }
        return latlngArray;
    }


    // Geo functions functions
    latlngdist(from: { lat: number, lng: number }, to: { lat: number, lng: number }) {
        // Returns distance between 2 latlng points in km
        const R = 6371.0; // Radius of the earth in km
        const dLat = deg2rad(to.lat - from.lat);  // deg2rad below
        const dLon = deg2rad(to.lng - from.lng);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(deg2rad(from.lat)) * Math.cos(deg2rad(to.lat)) *
            Math.sin(dLon / 2) ** 2
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    latlngcentroid(google_latlngs: { lat: number, lng: number }[]) {
        let latXTotal = 0;
        let latYTotal = 0;
        let lonDegreesTotal = 0;
        let cnt = 0;
        let currentLatLong: { lat: number, lng: number };
        for (let i = 0; currentLatLong = google_latlngs[i]; i++) {
            const latDegrees = currentLatLong.lat;
            const lonDegrees = currentLatLong.lng;

            if (latDegrees > -180 && lonDegrees > -180) {
                const latRadians = Math.PI * latDegrees / 180;
                latXTotal += Math.cos(latRadians);
                latYTotal += Math.sin(latRadians);
                lonDegreesTotal += lonDegrees;
                cnt ++;
            }
        }

        const finalLatRadians = Math.atan2(latYTotal, latXTotal);
        const finalLatDegrees = finalLatRadians * 180 / Math.PI;
        const finalLonDegrees = lonDegreesTotal / cnt;
        return { lat: finalLatDegrees, lng: finalLonDegrees };
    }
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

type latlngArrayModel = { lat: number, lng: number, time?: number }[];

