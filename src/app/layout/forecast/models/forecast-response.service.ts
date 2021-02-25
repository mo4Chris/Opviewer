import { Injectable } from '@angular/core';
import { CalculationService } from '@app/supportModules/calculation.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { zip } from 'rxjs';
import { ForecastMotionLimit } from './forecast-limit';
import { Dof6, Dof6Array, DofType, ForecastOperation } from './forecast-response.model';


const DOF_INDICES = {'Surge': 0, 'Sway': 1, 'Heave': 2, 'Roll': 3, 'Pitch': 4, 'Yaw': 5};
type Matrix = number[][];
@Injectable({
  providedIn: 'root'
})
export class ForecastResponseService {

  constructor(
    private calcService: CalculationService,
    private matService: MatrixService,
  ) {
  }

  computeLimit(response: Dof6Array, limiter: Dof6, limitValue: number): Matrix {
    const dofIndex = DOF_INDICES[limiter];
    return response.map(row => {
      return row.map(elt => {
        return elt[dofIndex] / limitValue;
      });
    });
  }

  combineWorkabilities(datas: Matrix[]): Matrix {
    if (!Array.isArray(datas) || !Array.isArray(datas[0]) || !Array.isArray(datas[0][0])) {
      return [[]];
    }
    const numX = datas[0].length;
    const numY = datas[0][0].length;
    let output = this.matService.zeros(numX, numY);
    for (let i = 0; i < datas.length; i++) {
      output = this.matService.elementwiseMax(output, datas[i]);
    }
    return output;
  }

  setLimitsFromOpsPreference(op: ForecastOperation): ForecastMotionLimit[] {
    const limits = new Array<ForecastMotionLimit>();
    const dofPreference = op.client_preferences.Points_Of_Interest.P1.Degrees_Of_Freedom;
    const dofKeys = Object.keys(dofPreference);
    dofKeys.forEach(dof => {
      for (const type in Object.keys(dofPreference[dof])) {
        if (!dofPreference[dof][type]) { continue; }
        limits.push(
          new ForecastMotionLimit({
            dof: dof as Dof6,
            type: type as DofType,
            value: 1,
          })
        );
      }
    });
    if (limits.length == 0) limits.push(new ForecastMotionLimit({dof: 'Heave', type: 'Disp', value: 15}))
    return limits;
  }


  // radianToCarthegian(r: number[], theta: number[], z: number[][]) {
  //   const R = this.calcService.maxInNdArray(r);
  //   const a = theta.map(t => t * Math.PI / 180);
  //   const x = this.calcService.linspace(-R, R, 2*R/(R.length + 1));
  //   const y = this.calcService.linspace(-R, R, 2*R/(R.length + 1));
  //   return {
  //     x,
  //     y,
  //     c,
  //   }
  // }
  polarToCarthegian(
    r: number[],
    theta: number[],
    z: number[][],
    {
      inDegrees = true,
      useInterpolation = true,
      smoothFactor = 2,
    }
  ) {
    const a = inDegrees ? theta.map(t => t * Math.PI / 180) : theta;

    const R = this.calcService.maxInNdArray(r);
    const N = z.length;
    const step = 2 * R / (N - 1);
    const x = this.calcService.linspace(-R, R, step);
    const y = this.calcService.linspace(-R, R, step);

    const Z = z.map((_z, i) => {
      return _z.map((e, j) => {
        return
      })
    })

    let _x: number[], _y: number[];
    if (useInterpolation) {
      _x = this.calcService.linspace(-R, R, step / smoothFactor);
      _y = this.calcService.linspace(-R, R, step / smoothFactor);
    } else {
      _x = x;
      _y = y;
    }
    const sliderSteps = [];
    if (useInterpolation) {
      z = this.calcService.interp2(x, y, z, _x, _y);
    }
  }
}
