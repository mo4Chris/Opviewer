import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
  }

  roundNumber(number, decimal = 10, addString = '') {
    if (typeof number === 'string' || number instanceof String) {
      return number;
    }
    if (!number) {
      return 'n/a';
    }

    return (Math.round(number * decimal) / decimal) + addString;
  }

  GetDecimalValueForNumber(value: any, endpoint:string = null) {
    var type = typeof(value);
    if(type == typeof(0)) {
        value = Math.round(value * 10) / 10;
        if(endpoint != null) {
          value = value + endpoint;
        }
    }
    else if(type == typeof("") && value != "NaN") {
      var num = +value;
      value = num.toFixed(1);
      if(endpoint != null) {
        value = value + endpoint;
      }
    }
    return value;
  }

  ReplaceEmptyColumnValues(resetObject: any) {
    var keys = Object.keys(resetObject);  
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
      var sin = Math.sin(lat * Math.PI / 180);
      var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var maxLatitude = this.GetMaxValueInMultipleDimensionArray(latitudes);
    var maxLongitude = this.GetMaxValueInMultipleDimensionArray(longitudes);
    var minLatitude = this.GetMinValueInMultipleDimensionArray(latitudes);
    var minLongitude = this.GetMinValueInMultipleDimensionArray(longitudes);

    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    var latFraction = (latRad(maxLatitude) - latRad(minLatitude)) / Math.PI;

    var lngDiff = maxLongitude - minLongitude;
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

    //height of agm map
    var latZoom = zoom(440, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapPixelWidth, WORLD_DIM.width, lngFraction);

    const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX);
    const avgLatitude = (minLatitude + maxLatitude) / 2;
    const avgLongitude = (minLongitude + maxLongitude) / 2;

    return { 'zoomLevel': zoomLevel, 'avgLatitude': avgLatitude, 'avgLongitude': avgLongitude };
  }
}
