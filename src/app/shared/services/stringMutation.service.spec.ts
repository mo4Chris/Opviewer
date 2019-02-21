import { TestBed } from '@angular/core/testing';

import { StringMutationService } from './stringMutation.service';

describe('StringMutationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StringMutationService = TestBed.get(StringMutationService);
    expect(service).toBeTruthy();
  });
});
