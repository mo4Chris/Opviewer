import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mo4testComponent } from './mo4test.component';

describe('Mo4testComponent', () => {
  let component: Mo4testComponent;
  let fixture: ComponentFixture<Mo4testComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mo4testComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4testComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
