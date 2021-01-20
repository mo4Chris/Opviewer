import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  objectToInt(objectvalue): number {
    return parseFloat(objectvalue);
  }

  roundNumber(number, decimal = 10, addString: string = '') {
    if (addString) {
      switch (addString) {
        case 'm2': case ' m2':
          addString = ' m\u00B2';
        case 'm3': case ' m3':
          addString = ' m\u00B3';
      }
    }
    if (typeof number === 'string' || number instanceof String) {
      if (number === '_NaN_' || number === 'n/a' || number === 'n/a ') {
        return 'N/a';
      } else {
        return number + addString;
      }
    }
    if (typeof(number) !== 'number' || isNaN(number)) {
      return 'N/a';
    }
    return (Math.round(number * decimal) / decimal) + addString;
  }

  GetDecimalValueForNumber(value: any, endpoint: string = null): string {
      const type = typeof (value);
      if (type === 'number' && !isNaN(value)) {
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

  GetPropertiesForMap(mapPixelWidth: number, latitudes: number[], longitudes: number[]) {
    function latRad(lat: number) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }
    function zoom(mapPx: number, worldPx: number, fraction: number) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const maxLatitude = this.GetMaxValueInMultipleDimensionArray(latitudes);
    const maxLongitude = this.GetMaxValueInMultipleDimensionArray(longitudes);
    const minLatitude = this.GetMinValueInMultipleDimensionArray(latitudes);
    const minLongitude = this.GetMinValueInMultipleDimensionArray(longitudes);

    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 15;
    const latFraction = (latRad(maxLatitude) - latRad(minLatitude)) / Math.PI;
    const lngDiff = maxLongitude - minLongitude;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    // height of agm map
    const latZoom = zoom(440, WORLD_DIM.height, latFraction);
    let lngZoom = zoom(mapPixelWidth, WORLD_DIM.width, lngFraction);
    if (lngZoom < 0 || isNaN(lngZoom)) {
      lngZoom = ZOOM_MAX;
      console.warn('Received infeasible lng map zoom!');
    }
    const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX);
    const avgLatitude = (minLatitude + maxLatitude) / 2;
    const avgLongitude = (minLongitude + maxLongitude) / 2;

    return {
      'zoomLevel': zoomLevel,
      'avgLatitude': avgLatitude,
      'avgLongitude': avgLongitude,
    };
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
    // Returns rms(X - mean(X))
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
    const linspace = start <= stop ? new Array(Math.floor((stop - start) / step) + 1) : [];
    let curr = start;
    for (let _i = 0; _i < linspace.length; _i++) {
      linspace[_i] = curr;
      curr += step;
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

  sortIndices(arr: any[], sortFcn?: (a: any, b: any) => number): number[] {
    const indices = arr.map((_, _i) => _i);
    if (sortFcn) {
      return indices.sort((a, b) => sortFcn(arr[a], arr[b]) ? -1 : sortFcn(arr[a], arr[b]) ? 1 : 0);
    } else {
      return indices.sort((a, b) => arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0);
    }
  }

  sortViaIndex(arr: any[], indices: number[]) {
    const out = [];
    indices.forEach(idx => {
      out.push(arr[idx]);
    });
    return out;
  }

  switchUnitAndMakeString(value: number | string, oldUnit: string, newUnit: string): string {
    const newValues = this.switchUnits([+value], oldUnit, newUnit);
    if (newValues && newValues[0] && !isNaN(newValues[0])) {
      return this.GetDecimalValueForNumber(newValues[0], ' ' + newUnit);
    } else {
      return 'N/a';
    }
  }

  switchUnits(vals: number | number[], from: string, to: string) {
    if (from === to) {
      return vals;
    }
    switch (from) {
      case 'km/h': case 'm/s': case 'knots': case 'knt': case 'mph': case 'knot': case 'mp/h':
        return this.switchSpeedUnits(vals, from, to);
      case 'km': case 'm': case 'cm': case 'mile': case 'NM':
        return this.switchDistanceUnits(vals, from, to);
      case 'mns': case 'minute': case 'hour': case 'day': case 'week': case 'sec': case 'second': case 's':
        return this.switchDurationUnits(vals, from, to);
      case 'rad': case 'deg':
        return this.switchDirectionUnits(vals, from, to);
      case 'kg': case 'ton': case 'tons':
        return this.switchWeightUnits(vals, from, to);
      case 'liter': case 'm3':
        return this.switchVolumeUnits(vals, from, to);
      default:
        console.error('Invalid unit "' + from + '"!');
        return vals;
    }
  }

  switchDistanceUnits(vals: number | number[], from: string, to: string) {
    const getFactor = (type: string) => {
      switch (type) {
        case 'm':
          return 1;
        case 'km':
          return 1000;
        case 'mile':
          return 1609;
        case 'NM': case 'nautical mile': case 'nmi':
          return 1852;
        case 'cm':
          return 1 / 100;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(from) / getFactor(to);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  switchSpeedUnits(vals: number | number[], from: string, to: string) {
    const getFactor = (type: string) => {
      switch (type) {
        case 'm/s':
          return 1;
        case 'knt': case 'knots': case 'knot':
          return 1.9438445;
        case 'kmh': case 'km/h':
          return 3.6;
        case 'mph': case 'mp/h':
          return 2.2369363;
        case 'ft/s':
          return 3.2808399;
        case 'mach':
          return 0.0030184123;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(to) / getFactor(from);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  switchDurationUnits(vals: number|number[], from: string, to: string) {
    // For now this function does NOT accept time objects!
    const getFactor = (type: string) => {
      switch (type) {
        case 'second': case 'sec': case 's':
          return 1 / 60;
        case 'minute': case 'mns': case 'min': case 'minutes':
          return 1;
        case 'hour':
          return 60;
        case 'day':
          return 60 * 24;
        case 'week':
            return 60 * 24 * 7;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(from) / getFactor(to);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  switchDirectionUnits(vals: number | number[], from: string, to: string) {
    // For now this function does NOT accept time objects!
    const getFactor = (type: string) => {
      switch (type) {
        case 'deg': case 'degree':
          return 360;
        case 'rad': case 'radial':
            return 2 * Math.PI;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(to) / getFactor(from);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  switchVolumeUnits(vals: number |  number[], from: string, to: string) {
    // For now this function does NOT accept time objects!
    const getFactor = (type: string) => {
      switch (type) {
        case 'liter': case 'ltr':
          return 1;
        case 'm3': case 'cubmeter':
          return 1000;
        case 'bucket':
          return 10;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(from) / getFactor(to);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  switchWeightUnits(vals: number | number[], from: string, to: string) {
    // For now this function does NOT accept time objects!
    const getFactor = (type: string) => {
      switch (type) {
        case 'kg':
          return 1;
        case 'gram':
          return 0.001;
        case 'ton': case 'tons':
          return 1000;
        default:
          console.error('Invalid unit "' + type + '"!');
          return 1;
      }
    };
    const Q = getFactor(from) / getFactor(to);
    if (Array.isArray(vals)) {
      return vals.map(elt => typeof(elt) === 'number' ? elt * Q : elt);
    } else {
      return typeof(vals) === 'number' ? vals * Q : vals;
    }
  }

  interp1(x: number[], y: number[], xnew: number[]) {
    // Fast 1d interpolation without checks
    const ynew: number[] = new Array(xnew.length);
    let _x = {pl: 0, il: 0, ph: 0, ih: 0};
    for (let i = 0; i < xnew.length; i++) {
      _x = getBounds(x, xnew[i], _x.il);
      ynew[i] = _x.pl * y[_x.il] + _x.ph * y[_x.ih];
    }
    return ynew;
  }

  interp2(x: number[], y: number[], z: number[][], xnew: number[], ynew: number[]): number[][] {
    // Performs 2d interpolation without proper checks. Computation of _y can still be improved
    // to run in linear rather than quadratic time
    const znew: number[][] = new Array(xnew.length);
    let _x = {pl: 0, il: 0, ph: 0, ih: 0}, _y = {pl: 0, il: 0, ph: 0, ih: 0};
    for (let i = 0; i < xnew.length; i++) {
      znew[i] = new Array(ynew.length);
      _x = getBounds(x, xnew[i], _x.il);
      _y = {
        pl: 0,
        il: 0,
        ph: 0,
        ih: 0,
      };
      for (let j = 0; j < ynew.length; j++) {
        _y = getBounds(y, ynew[j], _y.il);
        znew[i][j] = _x.pl * _y.pl * z[_x.il][_y.il] + _x.pl * _y.ph * z[_x.il][_y.ih] + _x.ph * _y.pl * z[_x.ih][_y.il] + _x.ph * _y.ph * z[_x.ih][_y.ih];
      }
    }
    return znew;
  }

  fillArray(value: any, len: number) {
    if (len === 0) { return []; }
    let a = [value];
    while (a.length * 2 <= len) { a = a.concat(a); }
    if (a.length < len) { a = a.concat(a.slice(0, len - a.length)); }
    return a;
  }
}

function getBounds(arr: number[], point: number, prev: number = 0) {
  // Helper function for interp2
  for (let _i = prev; _i < arr.length; _i++) {
    if (point <= arr[_i]) {
      if (point === arr[_i]) {
        return {
          pl: 0,
          il: 0,
          ph: 1,
          ih: _i,
        };
      } else {
        if (_i === 0) {
          return {
            pl: NaN,
            il: 0,
            ph: 0,
            ih: 0,
          };
        } else {
          const ratio = (point - arr[_i - 1]) / (arr[_i] - arr[_i - 1]);
          return {
            pl: 1 - ratio,
            il: _i - 1,
            ph: ratio,
            ih: _i
          };
        }
      }
    }
  }
  return {
    pl: NaN,
    il: 0,
    ph: 0,
    ih: 0,
  };
}
