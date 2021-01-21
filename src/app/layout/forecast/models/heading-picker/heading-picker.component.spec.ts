import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingPickerComponent } from './heading-picker.component';

describe('HeadingPickerComponent', () => {
  let component: HeadingPickerComponent;
  let fixture: ComponentFixture<HeadingPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadingPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
