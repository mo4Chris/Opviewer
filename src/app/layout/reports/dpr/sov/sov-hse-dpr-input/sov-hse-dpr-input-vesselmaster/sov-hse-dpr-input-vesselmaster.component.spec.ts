import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovHseDprInputVesselmasterComponent } from './sov-hse-dpr-input-vesselmaster.component';

describe('SovHseDprInputVesselmasterComponent', () => {
  let component: SovHseDprInputVesselmasterComponent;
  let fixture: ComponentFixture<SovHseDprInputVesselmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovHseDprInputVesselmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovHseDprInputVesselmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
