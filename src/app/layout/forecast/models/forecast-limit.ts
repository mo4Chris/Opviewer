import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Dof6, DofType } from './forecast-response.model';

@Injectable({
  providedIn: 'root'
})
export class ForecastMotionLimit {
  Type: DofType | 'Slip';
  Dof: Dof6;
  Value: number;

  constructor(
    inputs?: ForecastLimitInputs,
  ) {
    if (!inputs) return;
    this.Type = inputs.Type ?? null;
    this.Dof = inputs.Dof ?? null;
    if (inputs.Unit) {
      const calcService = new CalculationService;
      this.Value = calcService.switchUnits(inputs.Value, inputs.Unit, this.SimpleUnit);
    } else {
      this.Value = inputs.Value;
    }
  }

  public get Unit() {
    if (!this.Type) return '-';
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
      case 'Slip':
        return '%'
      default:
        console.error(`Unsupported unit for type ${this.Type} and dof ${this.Dof}`);
        return '';
    }
  }
  private get SimpleUnit() {
    const NiceUnit = this.Unit
    switch (NiceUnit) {
      case 'm/s²':
        return 'm\/s2';
      case 'deg/s²':
        return 'deg\/s2';
      case 'm/s':
        return 'm\/s';
      case 'deg/s':
        return 'deg\/s';
    }
    return NiceUnit;
  }
  public toObject() {
    return {
      Type: this.Type,
      Dof: this.Dof,
      Value: this.Value,
      Unit: this.SimpleUnit,
    }
  }
}

interface ForecastLimitInputs {
  Type: DofType | 'Slip';
  Dof: Dof6;
  Value: number;
  Unit?: string;
}
