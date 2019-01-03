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
    if(typeof(value) == typeof(0)) {
        value = Math.round(value * 10) / 10;
    }
    return value;
  }
}
