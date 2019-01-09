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

  GetDecimalValueForNumber(value: any) {
    var type = typeof(value);
    if(type == typeof(0)) {
        value = Math.round(value * 10) / 10;
    }
    else if(type == typeof("")) {
      var num = +value;
      value = num.toFixed(1);
    }
    return value;
  }
}
