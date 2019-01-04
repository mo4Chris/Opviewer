import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }

  objectToInt(objectvalue) {
    return parseFloat(objectvalue);
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
