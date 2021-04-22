import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Dof6, DofType } from './forecast-response.model';

@Injectable({
  providedIn: 'root'
})
export class ForecastMotionLimit {
  Type: DofType;
  Dof: Dof6;
  Value: number;

  constructor(
    inputs?: ForecastLimitInputs,
  ) {
    if (!inputs) return;
    this.Type = inputs.Type ?? null;
    this.Dof = inputs.Dof ?? null;
    if (!inputs.Unit) {
      const calcService = new CalculationService;
      this.Value = calcService.switchUnits(inputs.Value, inputs.Unit, this.Unit);
    } else {
      this.Value = inputs.Value;
    }
  }

  public get Unit() {
    switch (this.Type) {
      case null:
        return '-';
      case 'Acc':
        switch (this.Dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm/s²';
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg/s²';
        }
      case 'Vel':
        switch (this.Dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm/s';
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg/s';
        }
      case 'Disp':
        switch (this.Dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm';
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg';
        }
      default:
        console.error(`Unsupported unit for type ${this.Type} and dof ${this.Dof}`);
        return '';
    }
  }
  public toObject() {
    return {
      Type: this.Type,
      Dof: this.Dof,
      Value: this.Value,
      Unit: this.Unit
    }
  }
}

interface ForecastLimitInputs {
  Type: DofType;
  Dof: Dof6;
  Value: number;
  Unit?: string;
}
