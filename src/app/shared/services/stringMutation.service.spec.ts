import { TestBed } from '@angular/core/testing';

import { StringMutationService } from './stringMutation.service';

describe('StringMutationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StringMutationService = TestBed.inject(StringMutationService);
    expect(service).toBeTruthy();
  });
});
