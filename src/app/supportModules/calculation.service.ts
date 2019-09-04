import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
  }

  roundNumber(number, decimal = 10, addString: string = '') {
    if (typeof number === 'string' || number instanceof String) {
      if (number === '_NaN_' || number === 'n/a' || number === 'n/a ') {
        return 'N/a';
      } else {
        return number + addString;
      }
    }
    if (!number) {
      return 'N/a';
    }

    return (Math.round(number * decimal) / decimal) + addString;
  }

  GetDecimalValueForNumber(value: any, endpoint: string = null) {
      const type = typeof (value);
      if (type === 'number') {
          value = Math.round(value * 10) / 10;
          if (value - Math.floor(value) === 0 ) {
            value = value + '.0';
          }
          if (endpoint != null) {
              value = value + endpoint;
          }
      } else if (type === 'string' && value !== 'NaN' && value !== 'N/a' && value !== '_NaN_') {
          const num = +value;
          value = num.toFixed(1);
          if (endpoint != null) {
              value = value + endpoint;
          }
      } else if (type === 'undefined') {
          value = 'N/a';
      } else {
        value = 'N/a';
      }

    return value;
  }

  ReplaceEmptyColumnValues(resetObject: any) {
    const keys = Object.keys(resetObject);
    keys.forEach(key => {
        if (typeof(resetObject[key]) === typeof('')) {
            resetObject[key] = resetObject[key].replace('_NaN_', 'N/a');
        }
    });
    return resetObject;
  }

  GetMaxValueInMultipleDimensionArray(array) {
    if (array._ArrayType_ || array.length === 0) {
      return NaN;
    }
    return Math.max(...array.map(e => Array.isArray(e) ? this.GetMaxValueInMultipleDimensionArray(e) : e));
  }

  GetMinValueInMultipleDimensionArray(array) {
    if (array._ArrayType_ || array.length === 0) {
      return NaN;
    }
    return Math.min(...array.map(e => Array.isArray(e) ? this.GetMinValueInMultipleDimensionArray(e) : e));
  }

  GetPropertiesForMap(mapPixelWidth, latitudes, longitudes) {

    function latRad(lat) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const maxLatitude = this.GetMaxValueInMultipleDimensionArray(latitudes);
    const maxLongitude = this.GetMaxValueInMultipleDimensionArray(longitudes);
    const minLatitude = this.GetMinValueInMultipleDimensionArray(latitudes);
    const minLongitude = this.GetMinValueInMultipleDimensionArray(longitudes);

    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    const latFraction = (latRad(maxLatitude) - latRad(minLatitude)) / Math.PI;

    const lngDiff = maxLongitude - minLongitude;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    // height of agm map
    const latZoom = zoom(440, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapPixelWidth, WORLD_DIM.width, lngFraction);

    const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX);
    const avgLatitude = (minLatitude + maxLatitude) / 2;
    const avgLongitude = (minLongitude + maxLongitude) / 2;

    return { 'zoomLevel': zoomLevel, 'avgLatitude': avgLatitude, 'avgLongitude': avgLongitude };
  }

  getNanMean(X: number[], removeNaNs = true) {
    if (removeNaNs) {
      X = X.filter(elt => !isNaN(elt));
    }
    if (X.length < 1) {return NaN; }
    const avg = X.reduce(function (sum, a, i, ar) { sum += a; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
    return avg;
  }

  getNanStd(X: number[], removeNaNs = true) {
    if (removeNaNs) {
      X = X.filter(elt => !isNaN(elt));
    }
    if (X.length < 1) {return NaN; }
    const avg = X.reduce(function (sum, a, i, ar) { sum += a; return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
    const ste = X.reduce(function (sum, a, i, ar) { sum += (a - avg) * (a - avg); return i === ar.length - 1 ? (ar.length === 0 ? 0 : sum / ar.length) : sum; }, 0);
    const std = Math.sqrt(ste);
    return std;
  }

  getNanMax(X: number[], removeNaNs = true) {
    if (removeNaNs) {
      X = X.filter(elt => !isNaN(elt));
    }
    if (X.length < 1) {return NaN; }
    const max = X.reduce((a, b) => Math.max(a, b));
    return max;
  }

  getNanMin(X: number[], removeNaNs = true) {
    if (removeNaNs) {
      X = X.filter(elt => !isNaN(elt));
    }
    if (X.length < 1) {return NaN; }
    const max = X.reduce((a, b) => Math.min(a, b));
    return max;
  }

  parseMatlabArray(A: any) {
    // Parses any of the weird matlab arrays into a 1D array
    let B: number[];
    if (typeof(A) !== 'object' || A._ArrayType_) {
      B = [];
    } else if (typeof(A[0]) !== 'object') {
      B = A;
    } else if (A.length === 1 && A[0].length > 1) {
      B = A[0];
    } else {
      B = A.map(x => x[0]);
    }
    return B;
  }

  linspace(start: number, stop: number, step: number = 1) {
    const linspace = [];
    let curr = start;
    while ( curr <= stop ) {
      linspace.push(curr);
      curr = curr + step;
    }
    return linspace;
  }

  countUniques( myArray: any[]) {
    const counts = {};
    myArray.forEach(elt => {
      counts[elt] = 1 + (counts[elt] || 0);
    });
    return counts;
  }
}
