import { Injectable } from '@angular/core';

type Matrix = number[][];
@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  constructor() { }

  transpose(matrix:Matrix): Matrix {
    return matrix[0].map((_, colIndex) => 
      matrix.map(row => row[colIndex])
    );
  }

  scale(mat: Matrix, scalar: number): Matrix {
    return mat.map(col => {
      return col.map(elt => {
        return scalar * elt;
      })
    })
  }

  zeros(numX: number, numY: number) {
    return this.matrix(numX, numY, 0);
  }

  matrix(numX: number, numY: number, filler=0) {
    const matrix = [];
    for (let x=0; x<numX; x++) {
      matrix.push([])
      for (let y=0; y<numY; y++) {
        matrix[x].push(filler)
      }
    }
    return matrix
  }
}
