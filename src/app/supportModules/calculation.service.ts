import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
  }

  roundNumber(number, decimal = 10, addString:string = '') {
    if (typeof number === 'string' || number instanceof String) {
      return number + addString;
    }
    if (!number) {
      return 'n/a';
    }

    return (Math.round(number * decimal) / decimal) + addString;
  }

  GetDecimalValueForNumber(value: any, endpoint:string = null) {
      let type = typeof (value);
      if (type == "number") {
          value = Math.round(value * 10) / 10;
          if (endpoint != null) {
              value = value + endpoint;
          }
      }
      else if (type == "string" && value != "NaN") {
          let num = +value;
          value = num.toFixed(1);
          if (endpoint != null) {
              value = value + endpoint;
          }
      }
      else if (type == "undefined"){
          value = NaN;
      }
    return value;
  }

  ReplaceEmptyColumnValues(resetObject: any) {
    let keys = Object.keys(resetObject);  
    keys.forEach(key => {
        if(typeof(resetObject[key]) == typeof("")) {
            resetObject[key] = resetObject[key].replace('_NaN_', 'N/a');
        }
    });
    return resetObject;
}

  GetMaxValueInMultipleDimensionArray(array){
    return Math.max(...array.map(e => Array.isArray(e) ? this.GetMaxValueInMultipleDimensionArray(e) : e));
  }

  GetMinValueInMultipleDimensionArray(array){
    return Math.min(...array.map(e => Array.isArray(e) ? this.GetMinValueInMultipleDimensionArray(e) : e));
  }

  GetPropertiesForMap(mapPixelWidth, latitudes, longitudes) {

    function latRad(lat) {
      let sin = Math.sin(lat * Math.PI / 180);
      let radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    let maxLatitude = this.GetMaxValueInMultipleDimensionArray(latitudes);
    let maxLongitude = this.GetMaxValueInMultipleDimensionArray(longitudes);
    let minLatitude = this.GetMinValueInMultipleDimensionArray(latitudes);
    let minLongitude = this.GetMinValueInMultipleDimensionArray(longitudes);

    let WORLD_DIM = { height: 256, width: 256 };
    let ZOOM_MAX = 21;

    let latFraction = (latRad(maxLatitude) - latRad(minLatitude)) / Math.PI;

    let lngDiff = maxLongitude - minLongitude;
    let lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

    //height of agm map
    let latZoom = zoom(440, WORLD_DIM.height, latFraction);
    let lngZoom = zoom(mapPixelWidth, WORLD_DIM.width, lngFraction);

    const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX);
    const avgLatitude = (minLatitude + maxLatitude) / 2;
    const avgLongitude = (minLongitude + maxLongitude) / 2;

    return { 'zoomLevel': zoomLevel, 'avgLatitude': avgLatitude, 'avgLongitude': avgLongitude };
  }
}
