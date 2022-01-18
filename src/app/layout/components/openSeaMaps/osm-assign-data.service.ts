import { Injectable } from '@angular/core';
import { CommonService } from '@app/common.service';
import { marker, polygon, polyline } from 'leaflet';
import { map, take } from 'rxjs/operators';
import { OsmGenerateIconsService } from './osm-generate-icons.service';

@Injectable({
  providedIn: 'root'
})
export class OsmAssignDataService {

  constructor(
    private commonService: CommonService,
    private osmIconService: OsmGenerateIconsService,
  ) { }

  //Data retrieval functions
  retrieveLatestVesselLocation() {
    return this.commonService.getLatestBoatLocation().pipe(
      this.assignFieldsVesselLocation(),
      map(elements => elements.map(element => {
        return this.createMarker(element.lat, element.lon, this.osmIconService.getCorrectColorIcon(element.timestamp), element.vessel_name);
      })),
      take(1)
    )
  }

  retrieveHarbourLocations() {
    return this.commonService.getHarbourLocations().pipe(
      this.assignFieldsHarbourLocation(),
      map(elements => elements.map(element => {
        return this.createMarker(element.lat, element.lon, this.osmIconService.getCorrectSmallIcon('marina'), element.location_name);
      })),
      take(1)
    )
  }

  retrieveWindfarmLocations() {
    return this.commonService.getParkLocations().pipe(
      this.assignFieldsWindfarmLocation(),
      map(elements => elements.map(element => {
        return this.createMarker(element.lat, element.lon, this.osmIconService.getCorrectSmallIcon('windTurbine'), element.site_name);
      })),
      take(1)
    )
  }

  retrieveWindfarmOutline() {
    return this.commonService.getParkLocations().pipe(
      this.assignFieldsWindfarmOutline(),
      map(elements => elements.map(element => {
        return this.createPolyline(element.latOutline, element.lonOutline, element.site_name)
      })),
      take(1)
    )
  }
  retrieveForecastLocations() {
    return this.commonService.getForecastProjectLocations().pipe(
      this.assignFieldsForecastLocation(),
      map(elements => elements.map(element => {
        return this.createMarker(element.lat, element.lon, this.osmIconService.getCorrectSmallIcon('forecast-location'), element.forecast_name);
      })),
      take(1)
    )
  }

  //data assign functions

  assignFieldsVesselLocation() {
    return map((response: any) => response.map(response => ({
      vessel_name: response.vesselInformation[0],
      lat: response.LAT,
      lon: response.LON,
      timestamp: response.TIMESTAMP,
      mmsi: response._id
    })
    )
    )
  }

  assignFieldsHarbourLocation() {
    return map((response: any) => response.map(response => ({
      location_name: response.name,
      lat: response.centroid.lat,
      lon: response.centroid.lon,
    })
    )
    )
  }

  assignFieldsWindfarmLocation() {
    return map((response: any) => response.map(response => ({
      site_name: response.SiteName,
      lat: response.centroid.lat,
      lon: response.centroid.lon,
    })
    )
    )
  }

  assignFieldsWindfarmOutline() {
    return map((response: any) => response.map(response => ({
      site_name: response.SiteName,
      latOutline: response.outlineLatCoordinates,
      lonOutline: response.outlineLonCoordinates
    })
    )
    )
  }

  assignFieldsForecastLocation() {
    return map((response: any) => response.map(response => ({
      forecast_name: response.nicename,
      lat: response.lat,
      lon: response.lon,
      project_id: response.id
    })
    )
    )
  }

  createMarker(lat, lon, icon, popupText) {
    return marker([lat, lon], { icon: icon }).bindPopup(popupText);
  }

  createPolyline(latOutline, lonOutline, popupText) {
    return polyline(this.createLatLngs(latOutline, lonOutline) ).bindPopup(popupText);
  }
  createLatLngs(latOutline, lonOutline) {
    return latOutline.map((val, index)=>{
      return [val, lonOutline[index]]
    })
  }
}
