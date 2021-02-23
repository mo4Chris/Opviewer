import { TestBed } from '@angular/core/testing';

import { MatrixService } from './matrix.service';

describe('MatrixService', () => {
  let service: MatrixService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(MatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly run zeros', () => {
    const A = service.zeros(2, 3);
    expect(A).toEqual([[0, 0, 0], [0, 0, 0]]);
  });

  it('should correctly obtain the elementwise max', () => {
    const A = service.elementwiseMax([[2, 3.3, 5]], [[1, 3.2, 8]]);
    expect(A).toEqual([[2, 3.3, 8]]);
  });

  it('should correctly transpose', () => {
    const A = service.transpose([[2, 3.3, 5], [1, 3.2, 8]]);
    expect(A).toEqual([[2, 1], [3.3, 3.2], [5, 8]]);
  });

  it('should correctly scale', () => {
    const A = service.scale([[2, 1 / 4, 5]], 4);
    expect(A).toEqual([[8, 1, 20]]);
  });

});
