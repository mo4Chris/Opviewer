import { Injectable } from '@angular/core';
import { MatrixService } from '@app/supportModules/matrix.service';
import { ForecastMotionLimit } from './forecast-limit';
import { Dof6, Dof6Array, DofType, ForecastOperation } from './forecast-response.model'


const DOF_INDICES = {'Surge': 0, 'Sway': 1, 'Heave': 2, 'Roll': 3, 'Pitch': 4, 'Yaw': 5}
type Matrix = number[][];
@Injectable({
  providedIn: 'root'
})
export class ForecastResponseService {

  constructor(
    private matService: MatrixService,
  ) {
  }

  computeLimit(response: Dof6Array, limiter: Dof6, limitValue: number): Matrix {
    const dofIndex = DOF_INDICES[limiter];
    return response.map(row => {
      return row.map(elt => {
        return elt[dofIndex] / limitValue;
      })
    })
  }

  combineWorkabilities(datas: Matrix[]): Matrix {
    if (!Array.isArray(datas) || !Array.isArray(datas[0]) || !Array.isArray(datas[0][0])) {
      return [[]];
    }
    const numX = datas[0].length;
    const numY = datas[0][0].length;
    let output = this.matService.zeros(numX, numY);
    for (let i=0; i<datas.length; i++) {
      output = this.matService.elementwiseMax(output, datas[i])
    }
    return output;
  }
  
  setLimitsFromOpsPreference(op: ForecastOperation): ForecastMotionLimit[] {
    const limits = new Array<ForecastMotionLimit>();
    let dofPreference = op.client_preferences.Points_Of_Interest.P1.Degrees_Of_Freedom;
    const dofKeys = Object.keys(dofPreference)
    dofKeys.forEach(dof => {
      for (let type in Object.keys(dofPreference[dof])) {
        if (!dofPreference[dof][type]) continue;
        limits.push(
          new ForecastMotionLimit({
            dof: dof as Dof6,
            type: type as DofType,
            value: 1,
          })
        )
      }
    });
    return limits;
  }
}
