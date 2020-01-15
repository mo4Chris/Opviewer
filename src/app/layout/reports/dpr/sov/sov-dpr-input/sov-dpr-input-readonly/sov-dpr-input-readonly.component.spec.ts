import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputReadonlyComponent } from './sov-dpr-input-readonly.component';

describe('SovDprInputReadonlyComponent', () => {
  let component: SovDprInputReadonlyComponent;
  let fixture: ComponentFixture<SovDprInputReadonlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovDprInputReadonlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDprInputReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
