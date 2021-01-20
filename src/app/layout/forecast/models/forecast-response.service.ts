import { Injectable } from '@angular/core';
import { MatrixService } from '@app/supportModules/matrix.service';
import { Dof6, Dof6Array } from './forecast-response.model'


const DOF_INDICES = {'surge': 0, 'sway': 1, 'heave': 2, 'roll': 3, 'pitch': 4, 'yaw': 5}

@Injectable({
  providedIn: 'root'
})
export class ForecastReponseService {

  constructor(
    private matService: MatrixService,
  ) { }

  computeLimit(response: Dof6Array, limiter: Dof6, limitValue: number): number[][] {
    const dofIndex = DOF_INDICES[limiter];
    return response.map(row => {
      return row.map(elt => {
        return elt[dofIndex] / limitValue;
      })
    })
  }

  combineWorkabilities(datas: number[][][]) {
    if (!Array.isArray(datas) || datas.length < 1) {
      return [];
    }
    const numX = datas[0].length;
    const numY = datas[0][0].length;
    let output = this.matService.zeros(numX, numY);
    for (let i=0; i<datas.length; i++) {
      let data = datas[i]
      for (let x=0; x<numX; x++) {
        for (let y=0; y<numY; y++) {
          output[x][y] = Math.max(output[x][y], data[x][y])
        }
      }
    }
    return output;
  }
}
