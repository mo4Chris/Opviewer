import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgLoadingComponent } from './ng-loading.component';

describe('NgLoadingComponent', () => {
  let component: NgLoadingComponent;
  let fixture: ComponentFixture<NgLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
