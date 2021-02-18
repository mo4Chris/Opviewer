import { Dof6, DofType } from "./forecast-response.model"


export class ForecastMotionLimit {
  type: DofType;
  dof: Dof6;
  value: number;

  constructor ({type, dof, value} = {type: null, dof: null, value: null}) {
    this.type = type;
    this.value = value;
    this.dof = dof;
  }

  public get unit() {
    switch (this.type) {
      case null:
        return '-';
      case 'Acc':
        switch (this.dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm/s²'
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg/s²'
        }
      case 'Vel':
        switch (this.dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm/s'
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg/s'
        }
      case 'Disp':
        switch (this.dof) {
          case null:
            return '-';
          case 'Heave': case 'Surge': case 'Sway':
            return 'm'
          case 'Roll': case 'Pitch': case 'Yaw':
            return 'deg'
        }
      default:
        console.error(`Unsupported unit for type ${this.type} and dof ${this.dof}`)
        return ''
    }
  }
}