import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovHseDprInputComponent } from './sov-hse-dpr-input.component';

describe('SovHseDprInputComponent', () => {
  let component: SovHseDprInputComponent;
  let fixture: ComponentFixture<SovHseDprInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovHseDprInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovHseDprInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
