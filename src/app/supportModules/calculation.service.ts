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
}
