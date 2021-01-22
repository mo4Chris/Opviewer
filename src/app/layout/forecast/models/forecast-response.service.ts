import { Injectable } from '@angular/core';
import { MatrixService } from '@app/supportModules/matrix.service';
import { Dof6, Dof6Array } from './forecast-response.model'


const DOF_INDICES = {'Surge': 0, 'Sway': 1, 'Heave': 2, 'Roll': 3, 'Pitch': 4, 'Yaw': 5}
type Matrix = number[][];
@Injectable({
  providedIn: 'root'
})
export class ForecastReponseService {

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
}
