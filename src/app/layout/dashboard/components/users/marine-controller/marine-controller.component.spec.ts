import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineControllerComponent } from './marine-controller.component';

describe('MarineControllerComponent', () => {
  let component: MarineControllerComponent;
  let fixture: ComponentFixture<MarineControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarineControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarineControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
