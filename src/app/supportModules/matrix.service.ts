import { Injectable } from '@angular/core';

type Matrix = number[][];
@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  constructor() { }

  transpose(matrix: Matrix): Matrix {
    return matrix[0].map((_, colIndex) =>
      matrix.map(row => row[colIndex])
    );
  }

  scale(mat: Matrix, scalar: number): Matrix {
    return mat.map(col => {
      return col.map(elt => {
        return scalar * elt;
      });
    });
  }

  zeros(numX: number, numY: number): Matrix {
    return this.matrix(numX, numY, 0);
  }

  random(numX: number, numY: number): Matrix {
    const mat = this.matrix(numX, numY);
    mat.forEach(row => {
      row.forEach(elt => {
        elt = Math.random();
      });
    });
    return mat;
  }

  matrix(numX: number, numY: number, filler= 0): Matrix {
    const matrix = [];
    for (let x = 0; x < numX; x++) {
      matrix.push([]);
      for (let y = 0; y < numY; y++) {
        matrix[x].push(filler);
      }
    }
    return matrix;
  }

  elementwiseMax(A: Matrix, B: Matrix): Matrix {
    const numX = A.length, numY = A[0].length;
    const output = this.matrix(numX, numY, 0);
    for (let x = 0; x < numX; x++) {
      for (let y = 0; y < numY; y++) {
        output[x][y] = Math.max(A[x][y], B[x][y]);
      }
    }
    return output;
  }
}
