import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

const FixedCoordinateLength = 6;


@Injectable({
  providedIn: 'root'
})
export class GpsService {

  constructor(
    private settings: SettingsService
  ) { }

  private isValidCoordinate(ll: number) {
    return (typeof ll == 'number') && (ll >= -180) && (ll <= 180)
  }

  formatLng(lng: number) {
    switch (this.settings.unit_latlng) {
      case 'DMS':
        return this.lonToDms(lng)
      case 'fractional':
        return lng.toFixed(FixedCoordinateLength);
    }
  }
  formatLat(lat: number) {
    switch (this.settings.unit_latlng) {
      case 'DMS':
        return this.latToDms(lat)
      case 'fractional':
        return lat.toFixed(FixedCoordinateLength);
    }
  }
  formatCoordinates(lat: number | {lat: number, lng: number}, lng?: number) {
    if (typeof lat == 'number') {
      return {
        lat: this.latToDms(lat),
        lng: this.lonToDms(lng)
      }
    } else {
      return {
        lat: this.latToDms(lat.lat),
        lng: this.lonToDms(lat.lng)
      }
    }
  }

  toDegreesMinutesAndSeconds(coordinate: number) {
    if (!this.isValidCoordinate(coordinate)) return 'N/a'
    let absolute = Math.abs(coordinate);
    let degrees = Math.floor(absolute);
    let minutesNotTruncated = (absolute - degrees) * 60;
    let minutes = Math.floor(minutesNotTruncated);
    let seconds = Math.round((minutesNotTruncated - minutes) * 60);
    return degrees + "° " + minutes + "′ " + seconds + "″";
  }
  latToDms(lat: number) {
    if (!this.isValidCoordinate(lat)) return 'N/a'
    let latitude = this.toDegreesMinutesAndSeconds(lat);
    let latitudeCardinal = lat >= 0 ? "N" : "S";
    return latitude + " " + latitudeCardinal
  }  
  lonToDms(lng: number) {
    if (!this.isValidCoordinate(lng)) return 'N/a'
    let longitude = this.toDegreesMinutesAndSeconds(lng);
    let longitudeCardinal = lng >= 0 ? "E" : "W";
    return longitude + " " + longitudeCardinal;
  }
  toDMS(lat: number, lng: number) {
    return `${this.latToDms(lat)}\n${this.lonToDms(lng)}`;
  }
}
