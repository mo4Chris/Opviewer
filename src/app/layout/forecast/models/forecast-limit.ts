import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { Dof6, DofType } from './forecast-response.model';

@Injectable({
  providedIn: 'root'
})
export class ForecastMotionLimit {
  Type: DofType | 'Slip' | 'Wave' | 'Wind';
  Dof: Dof6 | WaveType | WindType;
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
    if (!this.isValid) throw new Error('Invalid limit config')
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
        return '%';
      case 'Wave':
        switch (this.Dof) {
          case 'Hs':
            return 'm';
          case 'Hmax':
            return 'm';
          case 'Tp':
            return 's';
          case 'Tz':
            return 's';
        }
      case 'Wind':
        switch (this.Dof) {
          case 'Speed':
            return 'm/s';
          case 'Gust':
            return 'm/s';
        }
      default:
        console.error(`Unsupported unit for type ${this.Type} and dof ${this.Dof}`);
        return '';
    }
  }
  public get isDofType() {
    return this.Type == 'Acc' || this.Type == 'Vel' || this.Type == 'Disp';
  }
  public get isValid() {
    if (!(this.Value > 0)) return false;
    switch (this.Type) {
      case 'Acc': case 'Disp': case 'Vel':
        return ['Heave', 'Roll', 'Pitch', 'Yaw', 'Sway', 'Surge'].some(o => o == this.Dof)
      case 'Wave':
        return ['Hs', 'Tp', 'Tz', 'Hmax'].some(o => o == this.Dof)
      case 'Wind':
        return ['Speed', 'Gust'].some(o => o == this.Dof)
      case 'Slip':
        return true;
      default:
        return false;
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

export interface ForecastLimitInputs {
  Type: DofType | 'Slip' | 'Wave' | 'Wind';
  Dof: Dof6 | WaveType | WindType;
  Value: number;
  Unit?: string;
}

export type WaveType = 'Hs' | 'Hmax' | 'Tp' | 'Tz';
export type WindType = 'Speed' | 'Gust';
