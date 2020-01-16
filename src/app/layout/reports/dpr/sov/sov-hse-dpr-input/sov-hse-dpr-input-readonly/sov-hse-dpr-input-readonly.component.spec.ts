import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovHseDprInputReadonlyComponent } from './sov-hse-dpr-input-readonly.component';

describe('SovHseDprInputReadonlyComponent', () => {
  let component: SovHseDprInputReadonlyComponent;
  let fixture: ComponentFixture<SovHseDprInputReadonlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovHseDprInputReadonlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovHseDprInputReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
