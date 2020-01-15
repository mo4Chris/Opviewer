import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputComponent } from './sov-dpr-input.component';

describe('SovDprInputComponent', () => {
  let component: SovDprInputComponent;
  let fixture: ComponentFixture<SovDprInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovDprInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDprInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
